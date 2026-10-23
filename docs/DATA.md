# Program data rules

Program details are the heart of the site's trust. These rules are strict.

## One file per program

`src/data/programs/<id>.json`. The file name is the program's permanent ID
and URL (`/programs/<id>/`). Use lowercase with dashes:
`<institution>-<program>-<degree>`, e.g. `stanford-biosciences-phd`.
Never rename a file once it is live; results point at the ID.

## Every fact needs an official source

- Use the program's or university's own pages only. Not forums, not
  aggregators, not GradCafe, not paid listing sites.
- List every page used in `sources` with the date checked.
- Set `lastChecked` to the date of the most recent check.

## When a page doesn't say

Owner update, 2026-10-22: available official requirements and deadlines may be
published even when Fall 2027 is not confirmed. Store older or undated deadlines
in `publishedDeadlines` with `label`, the exact `dateText` and a qualifying
`note`; add `detailsNote` explaining the cycle limitation. Do not assign an
unstated year, put these dates in countdowns, or present them as Fall 2027.
Missing admission models may be omitted for these qualified entries.

Leave the field out, or use `"unknown"` where the schema asks for it. The
site then shows "Not stated on official pages". Never fill a gap from memory
or from a similar program.

## When pages disagree or are unclear

Pick the safer value (the earlier deadline, the higher test score) and say
why in the `note`, e.g. MIT's two different deadline times.

## Listing a program before its details are checked

So people can follow a program and report results before we have checked
its deadline and requirements, a program can be listed with
`"details": "pending"`. A pending file has only:

- `name`, `institution`, `institutionShort`, `country`, `degree`, `field`
- `tracks`, for an umbrella program (see below)
- `officialUrl`: the program's own page, which we opened
- `cycle`, `sources` (that official page, with the date checked) and
  `lastChecked`

The build refuses anything else on a pending program, so a half-checked
program can't slip through. Its page says "Details being checked" and links
to the official page; the programs list says "Details coming".

To finish a pending program, check everything on its official pages
(deadlines, requirements, funding, international applicants, how students
are admitted), fill in those fields and change `details` to `"checked"`, all
in one go. The build requires `admissionModel` and `requirements` once a
program is checked.

## Umbrella programs

When one application covers several home areas, tracks or programs (for
example Stanford Biosciences, or UCLA's Graduate Programs in Bioscience),
list the program once and name its parts in `tracks`, exactly as its
official page does. Search then finds it by any of them ("UCLA
neuroscience"), and the program page lists them. A program with its own
separate application gets its own file.

## Checking links

`scripts/check-program-links.mjs` opens every official page, application
page and source. It runs on every pull request that changes programs and
every Monday (`.github/workflows/links.yml`), and the run's summary page
shows a table of every link with the title of the page it opened. It fails
only when a page is certainly gone (404 or 410) or its website doesn't
exist; sites that block automated visits are listed as "couldn't check".
Run it by hand with `node scripts/check-program-links.mjs [program-id ...]`.

Some websites answer the check with "not found" although the page opens
for people. After opening such a page by hand, add it to
`scripts/links-checked-by-hand.json` with the date. The check then lists it
as "couldn't check" for 60 days and as broken after that, so someone opens
it again and updates the date.

## Field guide

| Field | Notes |
| --- | --- |
| `details` | `checked` (the default) or `pending` (listed with its basics only, see above) |
| `tracks` | Home areas or tracks inside an umbrella program, named as on its official page |
| `deadlines[]` | `date` (YYYY-MM-DD). Add `time` and `timezone` (IANA, e.g. `America/New_York`) only when the page states a time. |
| `publishedDeadlines[]` | Older or undated official dates: `label`, `dateText` as published, and `note` explaining the cycle limitation. Never used for countdowns. |
| `detailsNote` | Visible qualification when official information is available but current-cycle dates are not confirmed. |
| `requirements.gre` | `required`, `optional`, `not-required`, `not-accepted` (scores not considered), `unknown` |
| `requirements.english.toefl` | Text, because TOEFL changed scales on 21 January 2026, e.g. `"5 (new scale) or 100 (old scale)"` |
| `requirements.applicationFee.waiver` | `available`, `domestic-only`, `not-available`, `unknown` |
| `funding.coversInternational` | `yes` only when a page says funding covers international students (or "all students"); `limited` when it says limited |
| `admissionModel` | `program` (US umbrella programs), `lab`, or `project` (many UK/EU PhDs) |

## Refreshing

Re-check every program at least once per cycle, and whenever someone reports
a correction. Programs usually publish next cycle's deadlines between August
and October.
