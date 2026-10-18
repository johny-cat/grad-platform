# Fall 2024 bioscience admissions sheet

Junaid chose this public spreadsheet on 2026-10-18 as our starting point for
program ideas and for learning what applicants need. Claude read all of it
the same day: every tab (including two hidden backup copies), the one cell
note, and every link.

- **Sheet:** "Bioscience Admissions Sheet for Fall 2024",
  https://docs.google.com/spreadsheets/d/1aSYBktWKtf_MEPw7TQVcxdwTJAXesi_Ws9PpBLe3eH0/edit
- **What it is:** a view-only sheet that applicants filled in during the
  2023–24 season (programs starting in Fall 2024) to share interview
  invites, offers and rejections for biology and biomedical graduate
  programs.
- **Program list taken from it:** `fall-2024-sheet-programs.csv` in this
  folder (842 rows).
- **Other seasons' sheets:** see `README.md` in this folder.

## Rules for using it

1. **It's a list of leads, not a source of facts.** Its deadlines and
   details come from the 2023 cycle, were typed by applicants, and are
   sometimes wrong (one row gives a 2021 deadline, another a 2024 one).
   Before a program goes into `src/data/programs/`, every fact is checked on
   the program's official page (golden rule 1 in `CLAUDE.md`).
2. **Don't republish people's posts.** The comments are other people's
   words, and some name faculty, staff or applicants. Use the patterns, not
   the posts, on the site and in this repository.
3. **Its counts are its own users, not totals.** The same rule we follow
   for our results.

## What's in it

| Tab | What it holds |
| --- | --- |
| Welcome Page | The purpose and the house rules: the first two columns of Main are locked, missing programs go on the Additional tab, add to a cell instead of overwriting it. Also a saved filter that shows only programs with interviews out, and links to last year's sheet and to a sheet shared on Reddit (see the end of this file). |
| Main | 660 programs at 136 institutions. Almost all are US PhD programs in biology and biomedicine, plus a few in the UK and Canada. One row per program; applicants add what happened to them. |
| Additional Programs missing from main (or non-bio) | 193 more rows at 108 institutions, including chemistry, biomedical engineering, psychology, epidemiology, food science and medical physics. |
| other suggestions | About 60 requests and replies about the sheet itself. They're covered below. |
| Two hidden backups | Identical copies of Main from 21 December 2023, saved before the organiser re-sorted it. Compared with Main today, they hold 70 early comments that were later changed or removed, and 57 answers that changed as more people reported (mostly "domestic only" or "unsure" becoming "both"). |

There is one cell note, on UT Galveston's acceptance date: someone was told
by faculty that acceptances wouldn't be decided until February, which didn't
match the dates others had entered.

Main's columns, in order: institution; program; deadline; program type
(doctoral, masters, both, other); three tick boxes (interviews out,
acceptances out, rejections out); date of interview invite; interview
dates; in person or virtual; how and from whom the invite came; citizenship
of the people notified (domestic, international, both, unsure); acceptance
date; how and from whom; other comments; rejection date; how and from whom;
number invited (American); number invited (international); when last year's
invites went out; last year's interview date; rolling admissions.

## What the numbers show

From Main, using the first date anyone reported for each program:

- **Program type:** 607 doctoral, 11 PhD or master's, 6 master's, 3 other,
  33 left blank.
- **Deadlines:** 1 December for 371 of the 547 programs with a date. Next
  are 30 November (41) and 15 December (40), and a few in January.
- **First interview invite:** 1–15 December: 144 programs; 16–31 December:
  216; 1–15 January: 87; 16–31 January: 52; February: 8. About 7 in 10
  programs sent their first invites in December.
- **First acceptance:** December: 9; 1–15 January: 9; 16–31 January: 83;
  1–15 February: 101; 16–29 February: 65; 1–15 March: 52; later: 2.
- **First rejection:** spread from mid-December to mid-March, most of them
  in January.
- **Interview format:** in person 219, virtual 212, both 50. "Both" is often
  a virtual round first, then a visit.
- **How people heard:** nearly always by email, very often an email saying
  to check the application portal. Offers often came first as a phone call
  from faculty, days before the official letter.
- **Who was notified:** both domestic and international applicants: 273
  programs; domestic only: 65; international only: 11; unsure: 43.
- **How the columns were used:** 390 programs have comments and 129 have
  head counts, but only 26 have last year's invite date, a column people
  had asked for.

## What applicants kept asking, and what it means for us

1. **Whether all interview invites are out, and whether a program sends
   them in waves.** By far the most common question, asked in almost every
   row. We can answer it with data: for each program, how many invites were
   reported this cycle and how recently, next to last year's dates from our
   own results. People asked the organiser to add last year's dates and a
   rolling-admissions column.
2. **What hearing nothing means.** No invite and no rejection worried people
   for weeks. Show what past reports say about each program's silence, and
   how long it usually takes after interviews.
3. **Whether a report is real.** Boxes were ticked and unticked, comments
   were deleted (one person restored them from the cell's edit history),
   and a few cells were vandalised. Our design already answers this: one
   report per person per decision, "others reported this too", nobody can
   edit or delete someone else's post, and flagging. Keep it that way.
4. **Whether international applicants have heard.** Asked constantly. Show
   domestic and international counts on every results summary (we already
   collect this). It matters most to our users outside the US.
5. **Time of day and time zone.** People compared when emails arrived, in
   Pacific or Eastern time. Offer an optional time of day on reports and
   show it in the reader's own time zone.
6. **How the news came, and from whom:** an email to check the portal, a
   call from a professor, an informal offer with the letter to follow, or an
   invite to a visit weekend (often an offer in disguise). Keep our channel
   field; consider marking offers informal or official, and adding a "visit
   invite" step.
7. **Declining offers.** People on waitlists kept asking others to decline
   offers they wouldn't take. New idea: let people report "I declined an
   offer", so waitlisted applicants can see places opening up.
8. **Confusing program structures:** umbrella programs with tracks (Harvard
   BBS, Yale BBS, Columbia's integrated program, Penn CAMB, UNC BBSP, WashU
   DBBS, Michigan PIBS, USC PIBBS); joint programs (Carnegie Mellon with
   Pitt, Harvard with MIT, the Tri-Institutional program, NIH partnerships);
   direct admission into a lab versus rotations; applying to one program and
   being invited by another. The catalog needs umbrella programs with tracks
   underneath. It already records the admission model (program, lab,
   project).
9. **More than one interview stage:** short screening calls or a virtual
   round first (Emory, Weill Cornell, Caltech, Mayo), then a visit. Allow a
   "pre-interview" step and describe each program's process on its page.
10. **How competitive it is.** Comments and letters mention 420 applicants
    for 9 places, over 350 for 25, more than 720 applicants, 102 interviewed
    for 63 offers, and about 85 interviewed for 60 to 65 offers. One large
    program said at its interview day that it invites about a quarter of
    applicants and admits about half of those. Duke and Yale BBS publish
    admissions statistics. Program pages can link to official statistics and
    show crowd-reported numbers, clearly labelled. This fits Junaid's idea of
    showing how many people applied.
11. **The comments column became a chat.** People asked for a wider column,
    a word limit, or a Discord or Reddit thread. Keep results and discussion
    apart: discussion threads per program (already planned).
12. **Filters people made or asked for:** programs with interviews out, a
    filter by field, and separate sheets for bioengineering, neuroscience,
    plant biology, food science, social sciences and engineering. Add an
    "interviews out this cycle" filter and a field filter to the program
    list.
13. **Late deadlines.** Someone looked for programs still taking
    applications in January. Add a "deadlines still open" view.
14. **Funding worries:** budget cuts, professors not taking students this
    year, changes at the NIH, and PhD rejections that came with an unfunded
    master's offer. Show funding on program pages and let people report
    funding news.
15. **Support and belonging.** Strangers kept encouraging each other, and
    people identified themselves by the colour of their text so they could
    talk. This is the Not Yet community in miniature, and our anonymous
    handles ("Steady Otter 0421") do the job the colours did. There was also
    venting and swearing, so moderation matters.
16. **Where else people looked:** GradCafe, Reddit (r/gradadmissions and
    r/BioGradAdmissions), Discord, X (Twitter), Instagram, last year's sheet,
    and emails to program coordinators. Link to them; don't copy them.

## Suggestions (not done yet)

- **Season timeline:** add an "Interview invites" phase from about
  1 December to 31 January, and start "Offers" in mid-January. Today
  `src/config.ts` starts interviews on 5 January and offers on 1 February.
- **Adding programs:** start with the umbrella programs that have the most
  rows and comments in the sheet, and check each one against its official
  pages before adding it.

## Linked from the sheet (not read yet)

- Last year's sheet (Fall 2023 entry):
  https://docs.google.com/spreadsheets/d/1wZ97YulhFeNUil4K0_UqSv6YrikCTwA7HT0LlRuPZ0c/edit
- The sheet shared on Reddit:
  https://docs.google.com/spreadsheets/d/1mDX8Os5dzZLhn1PY4v13ueH8qdLO50wD4FCeJTXSyW8/edit
- Duke's PhD admissions statistics:
  https://gradschool.duke.edu/about/statistics/all-departments-phd-admissions-and-enrollment-statistics/
- The Institute of Food Technologists' list of graduate programs:
  https://www.ift.org/community/students/graduate-programs

## About `fall-2024-sheet-programs.csv`

One row per program, as written in the sheet: `institution`, `program`,
`deadline_reported` (as typed, so mostly late-2023 dates), `type` (PhD,
Masters, PhD or Masters, Other, or blank) and `tab` (Main or Additional).
Cleaning was kept light: two deadline cells that held other text were
cleared, one UK-style date was rewritten (Sanger, 28 November 2023), and
four Additional rows with no institution or no program were left out. Names
keep the sheet's spelling, typos included. GitHub shows the file as a
searchable table.
