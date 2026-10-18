# Decisions

Newest first. Each entry: what we decided and why.

## 2026-10-18

- **The Fall 2024 bioscience applicants' sheet is our starting list of
  programs and ideas.** Junaid picked it. It's a list of leads: every fact
  on the site still comes from official pages, and people's comments are
  never copied. What we learned from it, and the program list, are in
  `docs/research/`.
- **The sign-in page offers only the email link until custom SMTP is set
  up.** On Supabase's built-in email the templates can't be edited, so the
  emails carry a link and no code, and that link works only in the browser
  that asked for it. The page says exactly that and hides the code box, so
  nobody waits for a code that never comes. `SIGN_IN_EMAIL_HAS_CODE` in
  `src/config.ts` brings the code box back once both the "Confirm sign up"
  and "Magic link or OTP" templates contain `{{ .Token }}`.
- **Automatic checks on GitHub.** Every pull request and every push to
  `main` runs the code checks, the build and the database tests, so a
  mistake shows up before it reaches the live site. The two outside
  building blocks it uses (`actions/checkout`, `actions/setup-node`) are
  pinned to exact commits, so a change someone else publishes can't alter
  what runs here.

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
