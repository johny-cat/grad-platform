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

Leave the field out, or use `"unknown"` where the schema asks for it. The
site then shows "Not stated on official pages". Never fill a gap from memory
or from a similar program.

## When pages disagree or are unclear

Pick the safer value (the earlier deadline, the higher test score) and say
why in the `note`, e.g. MIT's two different deadline times.

## Field guide

| Field | Notes |
| --- | --- |
| `deadlines[]` | `date` (YYYY-MM-DD). Add `time` and `timezone` (IANA, e.g. `America/New_York`) only when the page states a time. |
| `requirements.gre` | `required`, `optional`, `not-required`, `not-accepted` (scores not considered), `unknown` |
| `requirements.english.toefl` | Text, because TOEFL changed scales on 21 January 2026, e.g. `"5 (new scale) or 100 (old scale)"` |
| `requirements.applicationFee.waiver` | `available`, `domestic-only`, `not-available`, `unknown` |
| `funding.coversInternational` | `yes` only when a page says funding covers international students (or "all students"); `limited` when it says limited |
| `admissionModel` | `program` (US umbrella programs), `lab`, or `project` (many UK/EU PhDs) |

## Refreshing

Re-check every program at least once per cycle, and whenever someone reports
a correction. Programs usually publish next cycle's deadlines between August
and October.
