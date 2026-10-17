// Generates supabase/seed/catalog.sql from the program files in
// src/data/programs/. That SQL copies each program's ID, name, institution,
// country, field and degree into the database, so user data (results,
// follows, discussions) can point at real programs.
//
// Runs automatically before every build (npm run build). The full program
// details stay in the repository; the database only needs these few columns.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const programsDir = join(root, 'src', 'data', 'programs');
const outFile = join(root, 'supabase', 'seed', 'catalog.sql');

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COUNTRY = /^[A-Z]{2}$/;
const DEGREES = new Set(['phd', 'masters', 'other']);

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

const files = readdirSync(programsDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

const problems = [];
const rows = [];

for (const file of files) {
  const slug = basename(file, '.json');
  let data;
  try {
    data = JSON.parse(readFileSync(join(programsDir, file), 'utf8'));
  } catch (error) {
    problems.push(`${file}: not valid JSON (${error.message})`);
    continue;
  }
  if (!SLUG.test(slug) || slug.length > 120) problems.push(`${file}: file name must be lowercase-with-dashes`);
  if (!data.name || !data.institution) problems.push(`${file}: name and institution are required`);
  if (!COUNTRY.test(data.country ?? '')) problems.push(`${file}: country must be a two-letter code like US`);
  if (!SLUG.test(data.field ?? '')) problems.push(`${file}: field must be lowercase-with-dashes`);
  if (!DEGREES.has(data.degree)) problems.push(`${file}: degree must be phd, masters or other`);
  rows.push(
    `  (${[slug, data.name, data.institution, data.country, data.field, data.degree].map(quote).join(', ')})`,
  );
}

if (problems.length > 0) {
  console.error('Program catalog has problems:\n- ' + problems.join('\n- '));
  process.exit(1);
}

const slugs = files.map((f) => quote(basename(f, '.json')));

const sql = `-- GENERATED FILE. Do not edit by hand.
-- Source: src/data/programs/*.json  (run: npm run catalog:sql)
-- Apply in Supabase: SQL Editor -> paste -> Run. Safe to run again any time.

begin;

insert into public.programs (slug, name, institution, country, field, degree)
values
${rows.join(',\n')}
on conflict (slug) do update
  set name        = excluded.name,
      institution = excluded.institution,
      country     = excluded.country,
      field       = excluded.field,
      degree      = excluded.degree,
      active      = true,
      updated_at  = now();

-- Programs removed from the repository stay in the database (so old results
-- keep their program) but are marked inactive.
update public.programs
   set active = false, updated_at = now()
 where active
   and slug not like 'test-%'
   and slug not in (${slugs.join(', ')});

commit;
`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, sql);
console.log(`Wrote ${files.length} programs to supabase/seed/catalog.sql`);
