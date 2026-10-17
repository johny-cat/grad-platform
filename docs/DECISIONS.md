# Decisions

Newest first. Each entry: what we decided and why.

## 2026-10-17

- **Static Astro site + Preact islands, hosted on Cloudflare Pages.** Pages
  are served from a global network for free and scale to very large traffic;
  Cloudflare's free plan allows commercial use (Vercel's doesn't). Preact keeps
  JavaScript small for slow connections.
- **Supabase for data and sign-in.** Postgres with row-level security; free to
  start, upgrade path to Pro.
- **Program details live in the repository, not the database.** Every change
  is reviewable and reversible; only ID and name are mirrored to the database
  for user data to reference.
- **Results are anonymous by design.** Ownership kept in a separate private
  table; all shared writes through validated, rate-limited functions.
- **Results count only this site's users.** "62 users here applied", never
  presented as official totals.
- **Islands render only in the browser (`client:only`).** Dates, time zones,
  sign-in and live data differ per visitor; static pages are built once.
- **Working name "HeardYet"; community name "Not Yet".** One line in
  `src/config.ts` changes the site name.
- **Typeface: Atkinson Hyperlegible Next.** Legibility for tired readers on
  small screens; one family for everything.
- **First field: biology and biomedical PhDs in the US, Fall 2027 cycle.**
  Programs move in sync, so the results feed is most useful there.
- **Seven programs seeded from official pages** (Stanford Biosciences, Harvard
  BBS, MIT Biology, Scripps Research, WashU DBBS, UCSF BMS, Rockefeller).
