# Checking a pending program

How to turn a program listed with `"details": "pending"` into a fully
checked one, quickly and without mistakes. The rules themselves are in
`docs/DATA.md`; follow them exactly. A finished example:
`src/data/programs/duke-cell-molecular-biology-phd.json`.

## Work university by university

A university's graduate school usually publishes one page each for
deadlines, fees, English tests and funding that covers all its programs.
Open those central pages once, then each program's own official page and
its admissions or "how to apply" page: at most about four pages per
program. A program already checked at the same university shows which
central pages to use; open them again yourself.

For a big batch, give each university to its own helper (subagent), a few
at a time. Helpers edit only their own program files and evidence files.
The main session runs `npm run build` after each university, then commits.

## What to fill in

Only what official pages state for the current cycle (now Fall 2027 entry;
deadlines fall in late 2026 or early 2027). Leave a field out when no page
says it.

- `summary` (one or two plain sentences in our own words, max 300
  characters), `applyUrl`, `location` (only if a page states the city)
- `admissionModel`: `program` when students are admitted to the program
  and rotate; `lab` when they apply to a specific lab
- `deadlines`: label and date; `time` and an IANA `timezone` only when a
  time is stated; a `note` when useful
- `timeline`, only if stated
- `requirements`: GRE, English tests (TOEFL as text, scores as the page
  states them, no conversion between the old and new TOEFL scales),
  application fee and its `waiver`, letters, documents
- Fee `waiver`: `available` when an official page offers waivers without
  limiting them to US applicants (if it doesn't say international applicants
  qualify, the note tells them to confirm); `domestic-only` when waivers are
  limited to US citizens and permanent residents (the site lists only
  `available` under "fee waivers open to international applicants");
  `unknown` only when no page mentions waivers
- `funding`: `allFunded` only if a page says all admitted students are
  funded; `coversInternational` is `yes` only when a page says funding
  covers international students or all students
- `international.accepted`
- every page used in `sources`, with the date; `lastChecked`; then
  `"details": "checked"`

Change `details` to `checked` only when there is a current deadline and the
requirements. If no official page gives a current deadline, or a site won't
open after one retry, leave the file as it is and say why.

Decisions that apply (`docs/DECISIONS.md`, 2026-10-20): a graduate school's
current deadline counts when the program's page is out of date (say so in
the note); "midnight" on a date is shown at the start of that day; a stipend
whose page gives no year goes in `funding.note`.

## Reading pages

Ask the page fetcher to quote, word for word, every sentence about:
deadlines for this cycle (with time and time zone), the application fee and
fee waivers (including for international applicants), GRE, English tests,
recommendation letters, required documents, funding and stipend (amount and
year), whether funding covers international students, rotations or how
students are admitted, and interview timing. Use web search only when an
official page has moved, and only on the university's own site. Never take
a fact from a search result summary, an aggregator or memory.

## Evidence

For each program, write `docs/evidence/<program-id>.md`: every fact in the
file, the official page it came from and the exact sentence that states it
(see `docs/evidence/README.md` and the existing files). Central pages go in
`docs/evidence/_<university>-central.md`. Keep quotes short: only what
shows the fact.

## Second check

Before a batch goes into a pull request, a separate helper that did none of
the research confirms every fact against its evidence sentence, re-opens a
sample of pages live plus any fact it doubts, and fixes or removes anything
that doesn't match.
