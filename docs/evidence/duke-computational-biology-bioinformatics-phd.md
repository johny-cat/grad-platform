# duke-computational-biology-bioinformatics-phd

Checked 2026-10-22. Every populated admissions fact is supported below or by
the exact central-page extracts in [_duke-central.md](_duke-central.md).
`details: checked` records the completion of this check, not a source claim;
all `sources[].checked` and `lastChecked` dates record this live check.
The original stable ID, name, institution and catalog classifications are retained.

## Current cycle, deadline and shared fields

- `cycle: fall-2027`, deadline `2026-12-01`, `23:59`, `America/New_York`, and the full deadline note: central deadline page says "These are the application deadlines for applicants who wish to begin their graduate studies in fall 2027." and "For all dates listed, the deadline is 11:59:59 p.m., Eastern Standard Time." Its Ph.D. table row is "Computational Biology and Bioinformatics | 12/01/2026". Source: https://gradschool.duke.edu/admissions/application-deadlines/ . The note preserves seconds omitted by the schema's minute precision.
- `applyUrl`: the opened 2027 application instructions at https://gradschool.duke.edu/admissions/application-instructions/ ; "Applications for 2027 admission to The Duke University Graduate School are now available!"
- `requirements.english` (both TOEFL test-date thresholds, IELTS 7, Duolingo 125, first-language condition, subscores, Fall 2027 validity date, waiver conditions, placement exams): every exact sentence is under "English tests" in `_duke-central.md`, at https://gradschool.duke.edu/admissions/application-instructions/english-language-proficiency-test-scores/ . No scale conversion is used.
- `requirements.applicationFee` (105 USD, waiver classification and note): "The Duke University Graduate School application fee is $105." The central file's "Application fee and waivers" section quotes eligibility, limited/first-come availability, departmental possibilities, and DACA/undocumented exceptions from https://gradschool.duke.edu/admissions/application-instructions/application-fee/ and https://gradschool.duke.edu/admissions/admissions-faqs/ . Any program-specific qualification is below.
- `requirements.documents` includes the Life Experiences Statement: "As part of your online application, you must upload a Life Experiences Statement." and "The statement should be no more than one (1) page single spaced." Source: https://gradschool.duke.edu/admissions/application-instructions/life-experiences-statement/ .

## Graduate School program requirements and location

https://gradschool.duke.edu/academics/programs-degrees/computational-biology-and-bioinformatics/

- `location: Durham, North Carolina`: the program's contact address says "Durham, NC" followed by its postal code. `NC` is expanded to North Carolina; no location is inferred from memory of a university.
- `requirements.gre: optional`: "GRE Scores: GRE General (Optional)".
- `requirements.letters.min: 3`: "Letters of Recommendation: 3 Required".
- Documents: "Transcripts: Unofficial transcripts required with application submission; official transcripts required upon admission"; "Statement of Purpose: Required"; "Résumé: Required".
- GPA note: "GPA: Undergraduate GPA calculated on 4.0 scale required".
- No-writing-sample note: under "Writing Sample", "None required".
- Optional video note: "Optional Video Essay: How would a Duke PhD training experience help you achieve your academic and professional goals?" and "Max video length 2 minutes; record externally and provide URL in application."

## Program identity, summary and admission model

https://medschool.duke.edu/education/biomedical-phd-programs/computational-biology-and-bioinformatics-program

- "Computational Biology and Bioinformatics (CBB) at Duke University is an integrative, multi-disciplinary Ph.D. program that trains future leaders at the interdisciplinary intersection of quantitative and biomedical sciences."
- This supports the retained program name/institution/degree, `officialUrl` and the summary's first sentence.

https://medschool.duke.edu/education/biomedical-phd-programs/computational-biology-and-bioinformatics-program/program-overview

- "During their first year, students complete three or four research rotations with CBB faculty members."
- This supports `admissionModel: program` and the summary's second sentence, together with admission directly to the program below.
- Prerequisite lead-in: "Students are expected to have taken the following courses prior to entering the CBB program:"; exact list items: "Mathematics through at least differential equations and linear algebra"; "A course in probability and at least one other course in statistics"; "Courses in programming, data structures, and algorithms"; "A course in genetics"; "A course in cell and molecular biology"; "A course in biochemistry or organic chemistry".
- "Otherwise competitive students lacking one or more of these requirements will be expected to satisfy these prerequisites prior to or during their first year."

## Application, waivers and funding

https://medschool.duke.edu/education/biomedical-phd-programs/computational-biology-and-bioinformatics-program/admissions-cbb

- "Applicants should submit an electronic application and all supporting materials through the Duke Graduate School." (The link opens the central application instructions used as `applyUrl`.)
- "Domestic applicants should continue to use The Graduate School policy for fee waivers."
- "CBB does not offer international fee waivers." Supports `waiver: domestic-only`; central eligibility/exceptions are quoted in `_duke-central.md`.
- "All CBB students are guaranteed at least five years of funding that includes tuition, fees and a generous stipend."
- "The CBB Graduate Program provides support for students admitted directly into the program for the first year of doctoral study."
- "Beginning September 1 of the second year in residence, the faculty advisor will become responsible for the student's stipend and fees for the duration of the student's dissertation work."
- `allFunded: true`, `coversInternational: yes` follow "All CBB students". The central funding evidence supplies 12-month stipends and insurance periods.
- Omitted historical amount: "The uniform stipend for academic year 2026-2027 is $43,775.16." It is not a Fall 2027 amount.

## Inaccessible pages and omitted facts

- https://genome.duke.edu/education/cbb/admissions — the Graduate School's departmental-guidance link failed and failed again on retry; the first failure reported a redirect to the next URL.
- https://biostat.duke.edu/duke-center-genomic-and-computational-biology — the redirect target also failed on direct opening and one retry in the page reader.
- Neither inaccessible URL is used in `sources`. The accessible replacement admissions page was found in the official CBB site's navigation, opened and quoted above.
- No current interview or decision timing was found on the opened program pages, so `timeline` is omitted.
- No explicit statement of international applicant acceptance was found on these opened CBB pages, so `international` is omitted. International funding follows the explicit "All CBB students" guarantee, not an assumption about applicant eligibility.
