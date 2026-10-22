# duke-genetics-genomics-phd

Checked 2026-10-22. Every populated admissions fact is supported below or by
the exact central-page extracts in [_duke-central.md](_duke-central.md).
`details: checked` records the completion of this check, not a source claim;
all `sources[].checked` and `lastChecked` dates record this live check.
The original stable ID, name, institution and catalog classifications are retained.

## Current cycle, deadline and shared fields

- `cycle: fall-2027`, deadline `2026-12-01`, `23:59`, `America/New_York`, and the full deadline note: central deadline page says "These are the application deadlines for applicants who wish to begin their graduate studies in fall 2027." and "For all dates listed, the deadline is 11:59:59 p.m., Eastern Standard Time." Its Ph.D. table row is "Genetics and Genomics | 12/01/2026". Source: https://gradschool.duke.edu/admissions/application-deadlines/ . The note preserves seconds omitted by the schema's minute precision.
- `applyUrl`: the opened 2027 application instructions at https://gradschool.duke.edu/admissions/application-instructions/ ; "Applications for 2027 admission to The Duke University Graduate School are now available!"
- `requirements.english` (both TOEFL test-date thresholds, IELTS 7, Duolingo 125, first-language condition, subscores, Fall 2027 validity date, waiver conditions, placement exams): every exact sentence is under "English tests" in `_duke-central.md`, at https://gradschool.duke.edu/admissions/application-instructions/english-language-proficiency-test-scores/ . No scale conversion is used.
- `requirements.applicationFee` (105 USD, waiver classification and note): "The Duke University Graduate School application fee is $105." The central file's "Application fee and waivers" section quotes eligibility, limited/first-come availability, departmental possibilities, and DACA/undocumented exceptions from https://gradschool.duke.edu/admissions/application-instructions/application-fee/ and https://gradschool.duke.edu/admissions/admissions-faqs/ . Any program-specific qualification is below.
- `requirements.documents` includes the Life Experiences Statement: "As part of your online application, you must upload a Life Experiences Statement." and "The statement should be no more than one (1) page single spaced." Source: https://gradschool.duke.edu/admissions/application-instructions/life-experiences-statement/ .

## Graduate School program requirements and location

https://gradschool.duke.edu/academics/programs-degrees/genetics-and-genomics/

- `location: Durham, North Carolina`: the program's contact address says "Durham, NC" followed by its postal code. `NC` is expanded to North Carolina; no location is inferred from memory of a university.
- `requirements.gre: optional`: "GRE Scores: GRE General (Optional)".
- `requirements.letters.min: 3`: "Letters of Recommendation: 3 Required".
- Documents: "Transcripts: Unofficial transcripts required with application submission; official transcripts required upon admission"; "Statement of Purpose: Required"; "Résumé: Required".
- GPA note: "GPA: Undergraduate GPA calculated on 4.0 scale required".
- No-writing-sample note: under "Writing Sample", "None required".

## Program identity, summary and admission model

https://medschool.duke.edu/education/biomedical-phd-programs/university-program-genetics-and-genomics

- "The Duke University Program in Genetics and Genomics (UPGG) is an umbrella graduate training program that spans several basic science and clinical departments and bridges the Medical Center and the College of Arts and Sciences."
- This supports the retained name/institution, `officialUrl`, the summary's first sentence and `admissionModel: program` with the rotations below. The Graduate School page is titled "Ph.D. in Genetics and Genomics" and says "The program provides a unified curriculum of study in genetics and genomics leading to the Ph.D."

https://medschool.duke.edu/education/biomedical-phd-programs/university-program-genetics-and-genomics/academics/prospective-0

- Under "How many lab rotations will I be expected to complete? How long?": "Typically 8-10 week rotations in 3-4 different labs". Supports the summary's second sentence and program admission model.
- "UPGG does not require Subject GRE's". Supports the subject-test note; the Graduate School's "GRE General (Optional)" supports `gre: optional`.
- "Applications and materials are submitted electronically through the Duke Graduate School."

## Video guidance and English-test discrepancy

https://medschool.duke.edu/education/biomedical-phd-programs/university-program-genetics-and-genomics/academics/prospective

- "Please note: For the 2026-2027 UPGG admission application, we do not require the GRE, nor will we be viewing any applicant videos from the Duke grad school application video prompt."
- The JSON keeps the page's stated application-year label rather than asserting a different entry year. Although the Graduate School lists a video option, the program says it will not view videos.
- "Domestic applicants should continue to use The Graduate School policy for fee waivers." No sentence here excludes international departmental waivers, so the JSON does not invent that exclusion.

https://medschool.duke.edu/education/biomedical-phd-programs/university-program-genetics-and-genomics/academics/prospective-0

- "The minimum scores are 90 for the Internet-based TOEFL, 577 for the paper-based TOEFL, and 7.0 for the IELTS test."
- The FAQ does not address the January 2026 TOEFL change. The Graduate School's current English-test page explicitly gives separate old/new test-date thresholds and a Fall 2027 validity date; those are used. The note flags the FAQ's older scale guidance; no conversion was made.

## Funding and international applicants

https://medschool.duke.edu/education/biomedical-phd-programs/university-program-genetics-and-genomics/academics/prospective-0

- "UPGG graduate students receive stipends for the entire time they are in graduate school."
- "Unfortunately, funds available to cover stipend, tuition and fees for non-US citizens or permanent residents are extremely limited, which makes the competition among foreign student applications much higher than for domestic students."
- This explicit reference to foreign applications supports `international.accepted: yes` and the warning in its note.
- The specific warning supports `funding.coversInternational: limited`; it is retained as the safer value under DATA.md even though the central Graduate School guarantees funding for "all Ph.D. students". `allFunded: true` describes that guarantee for enrolled students, not equal availability of funded admission places. The funding note explains both statements.
- Omitted historical amount: "The uniform stipend for academic year 2025-2026 is $42,500, which goes very far given Durham's low cost of living." No Fall 2027 amount is inferred from it.
- The central evidence supplies the five-year 12-month stipend/tuition/mandatory-fee guarantee and six-year medical/dental premium coverage.

## Omitted facts and access

- No opened page gives current interview or decision dates or a 2027–28 stipend amount, so `timeline` and `funding.stipend` are omitted.
- No page used for this program failed to open. The old Graduate School departmental-guidance URL, https://upg.duke.edu/students-prospective-students/frequently-asked-questions, redirected to the accessible program home page; the current FAQ above was found in that official site's navigation and opened separately.
