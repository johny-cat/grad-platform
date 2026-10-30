# Decisions

Newest first. Each entry: what we decided and why.

## 2026-10-31

- **Estimated deadlines in countdowns.** Many programs publish a deadline
  without a Fall 2027 year ("December 1"). Junaid decided they should still
  appear in "Deadlines coming up" and the programs list, because most
  programs keep the same date every year. Each is placed in this season,
  marked "Year not confirmed", and counted down with hedged wording ("About
  30 days left", "Likely closes tomorrow"), so nobody mistakes it for a
  confirmed date. Spring, summer, rolling, fellowship and nomination dates
  are excluded. The program page still shows the date exactly as published.

## 2026-10-24 (later)

- **No sign-up.** Junaid doesn't want visitors to register. The first time
  someone posts, replies, reports a result or follows a program, the
  browser quietly gets an anonymous Supabase account after Cloudflare
  Turnstile's invisible check that a real person is there. All database
  rules stay: posting limits, three reports hide a post, moderators block a
  nickname. Email sign-in is optional, only to use the same account on
  other devices; adding an email keeps the anonymous account's nickname,
  follows and posts. Trade-off: someone blocked can come back with a new
  browser, but must pass the robot check again.

## 2026-10-24

- **Keep an unconfirmed admission model blank even when the current deadline is known.**
  A visible `detailsNote` explains the omission. Confirmed requirements and
  deadlines can still be published; a model is never inferred to satisfy validation.

## 2026-10-24

- **The community ("Not Yet") is threads and replies, not live chat.** Four
  spaces (General, Ask and answer, Lift up, Results talk) plus a discussion
  on every program page. Threads work on slow phones, keep good answers
  findable for next year's applicants, and are far easier to keep safe than
  a live chat that needs someone watching all the time. Junaid chose:
  people post under a nickname (a random one at sign-up, changeable on My
  programs); anyone can read and posting needs sign-in; three reports hide
  a post until a moderator decides. Moderators can also block a member from
  posting. Who wrote a post is never public: visitors see the nickname
  only, not the account id.

## 2026-10-22

- **Publish available official details when the next cycle is not confirmed.**
  The owner explicitly authorized reusing saved official evidence and older or
  undated published deadlines. Display the source's date text with a clear
  Fall 2027 qualification. Do not invent a year or create a countdown from it.
  Requirements stay visible; missing facts remain omitted. This supersedes
  the earlier rule requiring a current deadline before publishing details.

## 2026-10-20

- **A graduate school's current deadline counts even when the program's own
  page is out of date.** Columbia's biology FAQ and Duke CMB's admissions
  page still show last season's dates, but the graduate schools that run
  their admissions list this cycle's deadline, so we use that date and say
  so in the deadline's note. A program with no current deadline on any
  official page stays "details being checked".
- **"Midnight" on a date is shown at the start of that day.** Vanderbilt
  says its final deadline is December 1 at midnight, Central time, which
  could mean either end of the day. Following the safer-value rule in
  `docs/DATA.md`, the site shows the earlier reading and the note explains.
- **A stipend whose page gives no year goes in the funding note.** Michigan
  PIBS states $43,788 a year without saying which year, so the amount is in
  the note as stated, and the stipend field (which always shows a year) is
  left out rather than guessed.

## 2026-10-19

- **The programs page lists universities first.** Junaid asked for it: 307
  rows were too many to scan on a phone. The 121 universities are listed A
  to Z and open in place to show their programs, using the browser's own
  open-and-close, so it stays light on slow connections. Searching or
  filtering opens just the universities with a match, and clearing the
  search puts the list back as it was. Inside a university, programs with
  checked deadlines come first.
- **Publish by hand while GitHub is suspended.** GitHub suspended the
  `johny-cat` account on 2026-10-18, a few minutes after the pull request
  with 169 programs was opened; Junaid has appealed. Waiting could take weeks
  in the middle of application season, so the built site is uploaded to the
  same Cloudflare project from Junaid's computer with Cloudflare's own tool
  (`docs/SETUP.md`, section 7). Same address, same sign-in. Before each
  upload Claude opens every program link by hand, since the automatic link
  check runs on GitHub. We don't open a second GitHub account: GitHub's terms
  allow one free account per person.

## 2026-10-18

- **Programs can be listed before their details are checked.** Junaid chose
  this so people can follow programs and report results from the start of
  the season, instead of waiting until every program from this season's
  sheet has been checked in full. A listed program has its name, its
  university and its official page, which we opened; its page says "Details
  being checked" and sends people to the official page. Nothing is guessed.
  Deadlines and requirements are added from official pages a batch at a
  time, the most-followed programs first. How it works: `docs/DATA.md`.
- **One entry per application.** Where applicants send one application and
  choose home areas or tracks inside it (Stanford Biosciences, UCLA's
  Graduate Programs in Bioscience, Yale BBS, Penn CAMB, UNC BBSP, UC Irvine's
  CMB Gateway), the program is listed once and its home areas are named, so
  search finds them. A program with its own application gets its own entry,
  even when it also takes students through an umbrella (CU Anschutz). An
  umbrella's results mix its home areas; we can split one later if people
  ask for it.
- **Rows the sheet gets wrong are skipped, not guessed.** Six of the sheet's
  350 US biology rows name something that isn't a PhD program we could pin
  down (for example a certificate, a master's, or a department name), and
  five have no official page we could find yet. Each one, with the reason,
  is in `docs/research/2027-28-listing.csv`.
- **Program links are checked automatically.** On every pull request that
  changes programs, and every Monday, a check opens every official link and
  fails if a page is gone, so dead links get fixed before visitors find
  them.
- **The season timeline follows what applicants reported.** It now shows
  interview invites as their own phase (1 December to 31 January), then
  interviews from 1 January to 15 March and offers from 15 January to
  15 April. Before, it had no invites phase and started offers on
  1 February, although about a third of the programs in the Fall 2024
  sheet made their first offers earlier. The evidence is in
  `docs/research/`. The phases are a guide; programs differ.
- **This season's community sheet ("Graduate Admissions 2027-2028") is our
  up-to-date list of program leads,** and last season's BME sheet tells us
  how a season unfolds. Same rules as the Fall 2024 sheet: leads only,
  people's posts never copied, and no results imported from any sheet,
  because our results count only this site's users. Notes in
  `docs/research/`.
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
