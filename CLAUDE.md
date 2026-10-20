# grad-platform (working name: HeardYet)

A free, worldwide home for grad school applicants: programs with deadlines and
requirements checked against official pages, live crowdsourced decision
results ("Has anyone heard yet?"), and next a community, "Not Yet", for
people who haven't made it yet.

Owner: Junaid, a non-technical founder. Claude builds and maintains the code.
Explain every change to him in plain language, without jargon.

## Golden rules

1. **Never invent program facts.** Every fact in `src/data/programs/*.json`
   comes from an official page listed in that file's `sources`. If a page
   doesn't say something, leave the field out; the site then shows "Not
   stated on official pages". See `docs/DATA.md`.
2. **Results are anonymous.** Never expose user IDs, emails, or the
   `result_owners` table publicly. Public counts only, never who.
3. **No secrets in the repository or the browser.** Only the Supabase URL and
   publishable key live in `src/config.ts`. Never the secret/service_role
   key or the database password.
4. **Row-level security on every table.** Shared or public data is written
   only through SQL functions (RPC) that validate input and rate-limit.
   Private per-user rows (follows) may use RLS directly. See `docs/SECURITY.md`.
5. **Never edit an applied migration.** Add a new timestamped file in
   `supabase/migrations/`, add tests in `supabase/tests/`, and run
   `npm run test:db` before committing.
6. **Mobile-first, low-bandwidth, accessible.** Many users are on cheap
   phones and slow connections. Static pages plus small Preact islands.
7. **Honest, kind copy.** Never promise admission. Rejection is shown
   neutrally (slate, not red). Sentence case, plain verbs.

## Stack

- **Astro 7**, static output (`src/pages`). Interactive parts are Preact
  islands in `src/islands`, loaded with `client:only="preact"` because they
  depend on the browser (today's date, sign-in, live data).
- **Supabase** (Postgres + Auth). Schema in `supabase/migrations/`. The
  program catalog mirror `supabase/seed/catalog.sql` is generated from the
  JSON files by `scripts/build-catalog-sql.mjs` (runs in `npm run build`).
- **Cloudflare Pages** hosting: build command `npm run build`, output `dist`.
- Node 22.22+ (`.node-version`).

## Commands

```bash
npm install
npm run dev          # local site at http://localhost:4321
npm run build        # regenerates catalog SQL, then builds dist/
npm run check        # TypeScript and Astro checks
npm run test:db      # applies migrations to a throwaway local Postgres and runs supabase/tests
PUBLIC_DEMO=1 PUBLIC_DEMO_TODAY=2027-02-10 npx astro build --outDir /tmp/preview   # labelled sample data
```

## Map

| Path | What it is |
| --- | --- |
| `src/config.ts` | Site name, current cycle, season dates, public Supabase settings, sign-in email switch |
| `src/content.config.ts` | Schema every program JSON file must match (build fails otherwise) |
| `src/data/programs/` | One JSON file per program; the file name is the permanent ID |
| `src/pages/` | Pages: home, programs list, program page, report, sign-in, me, about, privacy |
| `src/islands/` | Interactive parts (results, follow buttons, report form, sign-in, my page) |
| `src/components/SeasonStrip.tsx` | The season timeline, the site's signature element |
| `src/lib/api.ts` | Every database call from the browser |
| `src/lib/time.ts` | Date maths and formatting, shared by build and browser |
| `src/scripts/clock.ts` | Fills in countdowns and "Today" markers in the browser |
| `src/styles/global.css` | Design tokens and all styles (see `docs/DESIGN.md`) |
| `supabase/migrations/` | Database schema, security rules and functions |
| `supabase/tests/` | Database tests (`npm run test:db`) |
| `.github/workflows/ci.yml` | Runs check, build and `test:db` on every pull request and push to `main` |
| `.github/workflows/links.yml` | Opens every program's official links (`scripts/check-program-links.mjs`) on pull requests that change programs and every Monday |
| `docs/` | Architecture, security, data rules, design, roadmap, setup status, decisions |
| `docs/research/` | What applicants track and ask, from their community sheets, plus lists of candidate programs. Start with `docs/research/README.md` |

## Common tasks

**Add a program:** create `src/data/programs/<institution>-<program>-<degree>.json`
following an existing file and `docs/DATA.md`, run `npm run build`, then apply
the regenerated `supabase/seed/catalog.sql` in Supabase (until CI does it).
To list a program before its details are checked, give only the basics and
its official page with `"details": "pending"`; an umbrella program names its
home areas in `tracks` (see `docs/DATA.md`). Candidate programs are listed in
`docs/research/2027-28-sheet-programs.csv` (this season) and
`docs/research/fall-2024-sheet-programs.csv`; they are leads only, and every
fact still comes from the official page. `docs/research/2027-28-listing.csv`
shows what became of each of this season's US biology rows (listed, skipped
with a reason, or official page not found yet).

**Check a pending program's details:** follow `docs/CHECKING-PROGRAMS.md`, and
record the source sentence for every fact in `docs/evidence/`.

**Change the database:** new migration file, new tests, `npm run test:db`,
then apply in Supabase (SQL Editor) and note it in `docs/SETUP.md`.

**Record decisions** in `docs/DECISIONS.md`, and keep `docs/SETUP.md` (what is
live) and `docs/ROADMAP.md` (what's next) current.
