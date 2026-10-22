# duke-molecular-cancer-biology-phd

Checked 2026-10-22. Every populated admissions fact is supported below or by
the exact central-page extracts in [_duke-central.md](_duke-central.md).
`details: checked` records the completion of this check, not a source claim;
all `sources[].checked` and `lastChecked` dates record this live check.
The original stable ID, name, institution and catalog classifications are retained.

## Current cycle, deadline and shared fields

- `cycle: fall-2027`, deadline `2026-12-01`, `23:59`, `America/New_York`, and the full deadline note: central deadline page says "These are the application deadlines for applicants who wish to begin their graduate studies in fall 2027." and "For all dates listed, the deadline is 11:59:59 p.m., Eastern Standard Time." Its Ph.D. table row is "Molecular Cancer Biology | 12/01/2026". Source: https://gradschool.duke.edu/admissions/application-deadlines/ . The note preserves seconds omitted by the schema's minute precision.
- `applyUrl`: the opened 2027 application instructions at https://gradschool.duke.edu/admissions/application-instructions/ ; "Applications for 2027 admission to The Duke University Graduate School are now available!"
- `requirements.english` (both TOEFL test-date thresholds, IELTS 7, Duolingo 125, first-language condition, subscores, Fall 2027 validity date, waiver conditions, placement exams): every exact sentence is under "English tests" in `_duke-central.md`, at https://gradschool.duke.edu/admissions/application-instructions/english-language-proficiency-test-scores/ . No scale conversion is used.
- `requirements.applicationFee` (105 USD, waiver classification and note): "The Duke University Graduate School application fee is $105." The central file's "Application fee and waivers" section quotes eligibility, limited/first-come availability, departmental possibilities, and DACA/undocumented exceptions from https://gradschool.duke.edu/admissions/application-instructions/application-fee/ and https://gradschool.duke.edu/admissions/admissions-faqs/ . Any program-specific qualification is below.
- `requirements.documents` includes the Life Experiences Statement: "As part of your online application, you must upload a Life Experiences Statement." and "The statement should be no more than one (1) page single spaced." Source: https://gradschool.duke.edu/admissions/application-instructions/life-experiences-statement/ .

## Graduate School program requirements and location

https://gradschool.duke.edu/academics/programs-degrees/molecular-cancer-biology/

- `location: Durham, North Carolina`: the program's contact address says "Durham, NC" followed by its postal code. `NC` is expanded to North Carolina; no location is inferred from memory of a university.
- `requirements.gre: optional`: "GRE Scores – GRE General: Optional".
- `requirements.letters.min: 3`: "Letters of Recommendation: 3 Required".
- Documents: "Transcripts: Unofficial transcripts required with application submission; official transcripts required upon admission"; "Statement of Purpose: Required"; "Résumé: Required".
- GPA note: "GPA: Undergraduate GPA calculated on 4.0 scale required".
- No-writing-sample note: under "Writing Sample", "None required".
- Optional video note: "Optional Video Essay: How would a Duke PhD training experience help you achieve your academic and professional goals?" and "Max video length 2 minutes; record externally and provide URL in application."

## Program identity and summary

https://pcb.duke.edu/education-training/molecular-cancer-biology-phd-program

- "The Duke University program in Molecular Cancer Biology is designed to generate independent scholars who are interested in augmenting current knowledge on the basic mechanisms underlying cell growth, differentiation, and development, and discerning how these processes are perturbed in cancer cells with the goal of identifying novel candidates for therapeutic intervention in the treatment of cancer."
- Supports the retained name/institution, `officialUrl` and the summary's first sentence. The Graduate School page's title "Ph.D. in Molecular Cancer Biology" confirms the degree.

## Admission model and rotations

https://pcb.duke.edu/education-training/molecular-cancer-biology-phd-program/mcb-program-requirements

- "Students complete 3 rotations with different faculty members to select an advisor."
- "Once the rotations are completed, students select an advisor with whom they will work on a thesis project."
- Supports `admissionModel: program` and the summary's second sentence.

## Application and GRE

https://pcb.duke.edu/education-training/molecular-cancer-biology-phd-program/how-apply-mcb-program

- "To apply, please visit the Duke University Graduate School web site." The link points to the application instructions used as `applyUrl`.
- "All application materials should be sent to the graduate school office."
- "This program does not require applicants to provide GRE or other graduate entrance exam scores."
- The Graduate School program page explicitly says "GRE Scores – GRE General: Optional" and "If you choose to enter self-reported test scores, official test scores will become a required component of your application." This supports `gre: optional` and the official-score note.

## Funding, omitted facts and access

- `allFunded: true`, `coversInternational: yes` and the five-year stipend/tuition/mandatory-fee and six-year insurance note come from the explicit "all Ph.D. students" sentences in `_duke-central.md`, not from another Duke program.
- No 2027–28 stipend amount or current program interview/decision timing was found, so `funding.stipend` and `timeline` are omitted.
- No explicit statement of international applicant acceptance was found on the opened MCB pages, so `international` is omitted. English-test rules and funding for all students do not establish a separate applicant-eligibility claim.
- No page used for this program failed to open.
