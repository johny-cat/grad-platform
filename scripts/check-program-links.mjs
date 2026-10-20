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
// So are pages that answer "not found" to this check but open for people:
// scripts/links-checked-by-hand.json lists them with the date someone opened
// them, and they count as broken again 60 days after that date.
//
// The results go to the run's summary page and, when LINK_REPORT names a
// file, into that file too (the workflow posts it on the pull request).
//
// Run by hand: node scripts/check-program-links.mjs [program-id ...]

import { readdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs';
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
const BY_HAND_DAYS = 60;
const byHand = JSON.parse(readFileSync(join(root, 'scripts', 'links-checked-by-hand.json'), 'utf8')).pages;

/** Opened by hand recently enough to trust over this check's "not found". */
function openedByHand(url) {
  const date = byHand[url];
  return Boolean(date) && Date.now() - Date.parse(date) < BY_HAND_DAYS * 24 * 60 * 60 * 1000;
}
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

function verdict(url, result) {
  if (result.status >= 200 && result.status < 400) return 'ok';
  if (result.status === 404 || result.status === 410) return openedByHand(url) ? 'unchecked' : 'broken';
  if (result.error === 'ENOTFOUND') return 'broken';
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

const rows = [...links.entries()].map(([url, slugs]) => ({ url, slugs, ...results.get(url), verdict: verdict(url, results.get(url)) }));
const counts = { ok: 0, broken: 0, unchecked: 0 };
for (const row of rows) {
  counts[row.verdict] += 1;
  const moved = row.finalUrl && row.finalUrl !== row.url ? ` -> ${row.finalUrl}` : '';
  console.log(
    ['LINK', row.verdict, row.status || row.error, row.slugs.join(','), row.url + moved, row.title].join('\t'),
  );
}
console.log(`\n${rows.length} links: ${counts.ok} open, ${counts.broken} broken, ${counts.unchecked} couldn't be checked.`);

/** Text from other websites goes into a table cell: keep it plain. */
function cell(text) {
  return String(text ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'))
    .replace(/[|[\]`*_\\]/g, (c) => `\\${c}`);
}

/** A web address in a table cell, as a plain link. */
function link(url) {
  return `<${String(url).replace(/[<>\s]/g, encodeURIComponent).replace(/\|/g, '%7C')}>`;
}

function report(full) {
  const bySlug = (a, b) => a.slugs[0].localeCompare(b.slugs[0]);
  const problems = (verdict) =>
    rows
      .filter((row) => row.verdict === verdict)
      .sort(bySlug)
      .map((row) => {
        const result = row.verdict === 'unchecked' && byHand[row.url] ? `${row.status}, opened by hand ${byHand[row.url]}` : row.status || row.error;
        return `| ${cell(row.slugs.join(', '))} | ${cell(result)} | ${link(row.url)} |`;
      });
  const broken = problems('broken');
  const unchecked = problems('unchecked');
  const open = rows
    .filter((row) => row.verdict === 'ok')
    .sort(bySlug)
    .map((row) => {
      const moved = row.finalUrl && row.finalUrl !== row.url ? ` (moved to ${link(row.finalUrl)})` : '';
      return `| ${cell(row.slugs.join(', '))} | ${cell(row.title) || '(no title)'}${moved} |`;
    });
  const lines = [
    `### Program links`,
    ``,
    `${rows.length} links: ${counts.ok} open, ${counts.broken} broken, ${counts.unchecked} couldn't be checked (the site blocked the check or was slow).`,
  ];
  if (broken.length > 0) {
    lines.push(``, `**Broken.** These pages are gone or their websites don't exist. Find each program's new official page and update its file.`, ``);
    lines.push(`| Program | Result | Link |`, `| --- | --- | --- |`, ...broken);
  }
  if (unchecked.length > 0) {
    lines.push(``, `**Couldn't check.** The website blocked the check or was slow. Open these by hand. Pages marked "opened by hand" answer this check with "not found" but opened for a person on that date (\`scripts/links-checked-by-hand.json\`).`, ``);
    lines.push(`| Program | Result | Link |`, `| --- | --- | --- |`, ...unchecked);
  }
  if (open.length > 0) {
    const table = [`| Program | Title of the page that opened |`, `| --- | --- |`, ...open].join('\n');
    // A pull request comment holds about 65,000 characters; the summary page holds far more.
    const fits = full || lines.join('\n').length + table.length < 60000;
    lines.push(
      ``,
      `<details><summary>${counts.ok} links that opened, with each page's title (check that it's the right program)</summary>`,
      ``,
      fits ? table : `Too long to show here: see the summary page of this run.`,
      ``,
      `</details>`,
    );
  }
  return lines.join('\n') + '\n';
}

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report(true));
if (process.env.LINK_REPORT) writeFileSync(process.env.LINK_REPORT, report(false));

if (counts.broken > 0) {
  console.error(`${counts.broken} program links are broken. Find a new official page for each, or fix the address.`);
  process.exit(1);
}
