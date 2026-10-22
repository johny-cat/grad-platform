# duke-neurobiology-phd

Checked 2026-10-22. Every populated admissions fact is supported below or by
the exact central-page extracts in [_duke-central.md](_duke-central.md).
`details: checked` records the completion of this check, not a source claim;
all `sources[].checked` and `lastChecked` dates record this live check.
The original stable ID, name, institution and catalog classifications are retained.

## Current cycle, deadline and shared fields

- `cycle: fall-2027`, deadline `2026-12-01`, `23:59`, `America/New_York`, and the full deadline note: central deadline page says "These are the application deadlines for applicants who wish to begin their graduate studies in fall 2027." and "For all dates listed, the deadline is 11:59:59 p.m., Eastern Standard Time." Its Ph.D. table row is "Neurobiology | 12/01/2026". Source: https://gradschool.duke.edu/admissions/application-deadlines/ . The note preserves seconds omitted by the schema's minute precision.
- `applyUrl`: the opened 2027 application instructions at https://gradschool.duke.edu/admissions/application-instructions/ ; "Applications for 2027 admission to The Duke University Graduate School are now available!"
- `requirements.english` (both TOEFL test-date thresholds, IELTS 7, Duolingo 125, first-language condition, subscores, Fall 2027 validity date, waiver conditions, placement exams): every exact sentence is under "English tests" in `_duke-central.md`, at https://gradschool.duke.edu/admissions/application-instructions/english-language-proficiency-test-scores/ . No scale conversion is used.
- `requirements.applicationFee` (105 USD, waiver classification and note): "The Duke University Graduate School application fee is $105." The central file's "Application fee and waivers" section quotes eligibility, limited/first-come availability, departmental possibilities, and DACA/undocumented exceptions from https://gradschool.duke.edu/admissions/application-instructions/application-fee/ and https://gradschool.duke.edu/admissions/admissions-faqs/ . Any program-specific qualification is below.
- `requirements.documents` includes the Life Experiences Statement: "As part of your online application, you must upload a Life Experiences Statement." and "The statement should be no more than one (1) page single spaced." Source: https://gradschool.duke.edu/admissions/application-instructions/life-experiences-statement/ .

## Graduate School program requirements and location

https://gradschool.duke.edu/academics/programs-degrees/neurobiology/

- `location: Durham, North Carolina`: the program's contact address says "Durham, NC" followed by its postal code. `NC` is expanded to North Carolina; no location is inferred from memory of a university.
- `requirements.gre: optional`: "GRE Scores: GRE General (Optional)".
- `requirements.letters.min: 3`: "Letters of Recommendation: 3 Required".
- Documents: "Transcripts: Unofficial transcripts required with application submission; official transcripts required upon admission"; "Statement of Purpose: Required (see department guidance below)"; "Résumé: Required".
- GPA note: "GPA: Undergraduate GPA calculated on 4.0 scale required".
- No-writing-sample note: under "Writing Sample", "None required".

## Program identity and summary

https://gradschool.duke.edu/academics/programs-degrees/neurobiology/

- Title: "Ph.D. in Neurobiology". The program description says: "Our scientists investigate a myriad of complex processes, including learning, memory, movement, behavior, sensation, and perception, and how to restore normal function of the nervous system in the face of trauma and disease."
- Supports the retained program name/institution/degree, `officialUrl` and the summary's first sentence.

## Admission model and rotations

https://www.neuro.duke.edu/education/neurobiology-graduate-training-program/obtaining-phd

- Under "Year One", "Lab Rotations – September – August.": "Students work in 3-4 different labs of faculty within the Neurobiology training program on well-defined research projects."
- "The ultimate goal is to identify a thesis advisor by the end of the year."
- Supports `admissionModel: program` and the summary's second sentence, together with the explicit program application instructions below.

## Program application and international applicants

https://www.neuro.duke.edu/education/graduate-training-program/prospective-students

- "Applicants should submit an electronic application through the Graduate School."
- 'Indicate on the application that you are applying to “The Graduate Program in Neurobiology.”'
- "Duke welcomes both domestic and international applicants, and international students should demonstrate a high proficiency on the TOEFL exam in addition to the above criteria." Supports `international.accepted: yes`; the Graduate School page explicitly accepts IELTS and Duolingo as alternatives.
- "Importantly, our selection process deliberately does not use video material that can be optionally included in Duke applications."
- "Applicants are strongly encouraged to provide a compelling statement that articulates how Duke Neurobiology fits their specific training goals as part of their personal essay."
- The Graduate School's program page repeats both video and statement guidance; the statement note does not make the encouragement a new required document.

## Funding

https://www.neuro.duke.edu/education/graduate-training-program/financial-support

- "Each student accepted into the program is guaranteed full financial assistance for six years as long as they remain in good standing."
- Supports `allFunded: true` and `coversInternational: yes` ("Each student" has no nationality exclusion), and the six-year assistance note. The central evidence supplies 12-month stipends for five years and medical/dental premiums for six years on Duke's plans.
- Omitted historical amount: "For the 2023-2024 academic year, the award comprises a personal stipend of $38,600 plus tuition, registration fee, recreation fee, health insurance and the student health service fee." It is not used as a Fall 2027 stipend or fee amount.

## Omitted facts and access

- No 2027–28 stipend amount or current interview/decision timing was found on the opened pages, so `funding.stipend` and `timeline` are omitted.
- No page used for this program failed to open.
