// Checks that every program's official links still open.
//
// For each program file in src/data/programs/, opens its official page,
// application page and sources, and reports the result and the page's title,
// so a person can see at a glance that each link leads to the right program.
//
// Runs in GitHub Actions (.github/workflows/links.yml) on pull requests that
// change programs, and once a week. It fails only when a page is certainly
// gone (404 or 410) or its website doesn't exist; sites that block automated
// visits (403, 429) or are slow are listed as "couldn't check", not failures.
//
// Run by hand: node scripts/check-program-links.mjs [program-id ...]

import { readdirSync, readFileSync, appendFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const programsDir = join(root, 'src', 'data', 'programs');
const only = new Set(process.argv.slice(2));

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 HeardYet-link-check',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
};
const TIMEOUT_MS = 25000;
const PARALLEL = 6;

/** Every link to check, with the programs that use it. */
const links = new Map();
for (const file of readdirSync(programsDir).filter((f) => f.endsWith('.json')).sort()) {
  const slug = basename(file, '.json');
  if (only.size > 0 && !only.has(slug)) continue;
  const data = JSON.parse(readFileSync(join(programsDir, file), 'utf8'));
  const urls = [data.officialUrl, data.applyUrl, ...(data.sources ?? []).map((s) => s.url)].filter(Boolean);
  for (const url of new Set(urls)) {
    if (!links.has(url)) links.set(url, []);
    links.get(url).push(slug);
  }
}

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function titleOf(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]).replace(/\s+/g, ' ').trim().slice(0, 140) : '';
}

async function check(url) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const type = response.headers.get('content-type') ?? '';
      const body = type.includes('html') ? await response.text() : '';
      const result = { status: response.status, finalUrl: response.url, title: titleOf(body) };
      if (response.status >= 500 && attempt === 1) continue;
      return result;
    } catch (error) {
      const code = error?.cause?.code ?? error?.name ?? 'error';
      if (attempt === 2 || code === 'ENOTFOUND') return { status: 0, error: String(code), finalUrl: url, title: '' };
    }
  }
}

function verdict(result) {
  if (result.status >= 200 && result.status < 400) return 'ok';
  if (result.status === 404 || result.status === 410 || result.error === 'ENOTFOUND') return 'broken';
  return 'unchecked';
}

const queue = [...links.keys()];
const results = new Map();
async function worker() {
  while (queue.length > 0) {
    const url = queue.shift();
    results.set(url, await check(url));
  }
}
await Promise.all(Array.from({ length: PARALLEL }, worker));

const rows = [...links.entries()].map(([url, slugs]) => ({ url, slugs, ...results.get(url), verdict: verdict(results.get(url)) }));
const counts = { ok: 0, broken: 0, unchecked: 0 };
for (const row of rows) {
  counts[row.verdict] += 1;
  const moved = row.finalUrl && row.finalUrl !== row.url ? ` -> ${row.finalUrl}` : '';
  console.log(
    ['LINK', row.verdict, row.status || row.error, row.slugs.join(','), row.url + moved, row.title].join('\t'),
  );
}
console.log(`\n${rows.length} links: ${counts.ok} open, ${counts.broken} broken, ${counts.unchecked} couldn't be checked.`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const cell = (text) => String(text ?? '').replace(/\|/g, '\\|');
  const lines = [
    `### Program links`,
    ``,
    `${rows.length} links: ${counts.ok} open, ${counts.broken} broken, ${counts.unchecked} couldn't be checked (the site blocked the check or was slow).`,
    ``,
    `| Result | Program | Page title | Link |`,
    `| --- | --- | --- | --- |`,
    ...rows
      .sort((a, b) => a.verdict.localeCompare(b.verdict) || a.slugs[0].localeCompare(b.slugs[0]))
      .map(
        (row) =>
          `| ${row.verdict === 'ok' ? 'Open' : row.verdict === 'broken' ? '**Broken**' : `Couldn't check (${row.status || row.error})`} | ${cell(row.slugs.join(', '))} | ${cell(row.title)} | ${cell(row.url)} |`,
      ),
  ];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
}

if (counts.broken > 0) {
  console.error(`${counts.broken} program links are broken. Find a new official page for each, or fix the address.`);
  process.exit(1);
}
