# Design

## Idea

The admissions season is a long night of waiting. The site is calm and
legible at 2 a.m. on a cheap phone, and it answers one question fast: has
anyone heard yet?

## Signature element: the season timeline

`src/components/SeasonStrip.tsx` draws the cycle from October to April:
typical phases, real deadlines, reported results as coloured dots, the usual
April 15 reply date, and a marigold "Today" line. The same element appears in
three sizes (home hero, program page, mini in lists). This is where the
design spends its boldness; everything else stays quiet.

The one animation: on the home page the Today line slides into place on load
(skipped when the visitor prefers reduced motion).

## Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ink` | #14213D | #E7ECF4 | Text, primary buttons |
| `--paper` | #F4F6F9 | #0E1628 | Page background (cool, never cream) |
| `--surface` | #FFFFFF | #152039 | Panels and inputs |
| `--muted` | #566274 | #A3AFC3 | Secondary text |
| `--marigold` | #F2A93B | #F5B54A | Brand dot, Today line. The only accent |

Decision colours are functional and always paired with a text label:
interview blue, accepted green, waitlisted violet, rejected **slate** (never
alarm red; the site is for people who keep trying).

## Type

Atkinson Hyperlegible Next (variable), one family for everything. Designed by
the Braille Institute for legibility: distinct letterforms and a slashed zero.
Scale: 13 / 14.4 / 17 / 21 / 27 / 34 / 44 / 56 px. Headings 800 weight, tight
tracking, balanced wrapping.

## Layout

Left-aligned, single column on phones. Lists are rows separated by rules,
not boxed cards. Program pages put the deadline and status panel first on
phones and in a sticky side column on desktop.

## Words

Sentence case. Plain verbs. Buttons say what happens ("Post result",
"Email me a sign-in link"). Empty states invite action. Errors say what went
wrong and what to do. Never promise admission.

## Avoid

All-caps labels, eyebrow text, middle-dot meta strings, arrows appended to
links, identical shadowed cards, gradient decoration, red for rejection.
