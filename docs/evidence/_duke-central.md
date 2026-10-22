# Duke University: central Graduate School pages

Checked 2026-10-22 by opening the official pages. These extracts support the
four Duke records checked on this date. Program-specific qualifications appear
in the individual evidence files. Only Fall 2027 deadlines and current,
unrestricted policies are used; historical stipend amounts are excluded.

## Fall 2027 deadlines

https://gradschool.duke.edu/admissions/application-deadlines/

- Cycle: "These are the application deadlines for applicants who wish to begin their graduate studies in fall 2027."
- Time: "For all dates listed, the deadline is 11:59:59 p.m., Eastern Standard Time."
- Exact Ph.D. table rows: "Computational Biology and Bioinformatics | 12/01/2026"; "Genetics and Genomics | 12/01/2026"; "Molecular Cancer Biology | 12/01/2026"; "Neurobiology | 12/01/2026". The vertical bar represents the table's column boundary.
- Authority: "If there is a discrepancy between the deadline information on this page and other materials you may have received, you should adhere to the deadlines on this page."
- Stored as `2026-12-01`, `23:59`, `America/New_York`. The schema stores minutes; each deadline note preserves the stated `11:59:59 p.m.`. No midnight ambiguity is involved.

## Application and required Life Experiences Statement

https://gradschool.duke.edu/admissions/application-instructions/

- Current application: "Applications for 2027 admission to The Duke University Graduate School are now available!" The opened page includes "Apply Now!" and is used as `applyUrl`.
- Under "Required Documents and Information", the linked list includes "Transcripts", "Letters of recommendation", "Statement of purpose", "Life Experiences Statement", "Resume". Program-specific Graduate School pages confirm the other document requirements and the number of letters.
- This page's address gives "Durham, NC 27708"; the English-test page's address explicitly gives "USA". `US` is the catalog's country code; `biology`, `phd`, the stable IDs and institutional abbreviation are catalog labels, not additional admissions claims.

https://gradschool.duke.edu/admissions/application-instructions/life-experiences-statement/

- "As part of your online application, you must upload a Life Experiences Statement."
- "The statement should be no more than one (1) page single spaced."

## Application fee and waivers

https://gradschool.duke.edu/admissions/application-instructions/application-fee/

- "The Duke University Graduate School application fee is $105." (`USD`, a US university's dollar-denominated fee.)
- "The application fee is nonrefundable."
- Eligibility introduction: "To be eligible to request an application fee waiver, all of the following must apply:"; items "a) Be a United States citizen or permanent resident;", "b) Apply to a degree-granting program;", "c) Have at least one of the following conditions apply:". The listed conditions are low income, US military service, or participation in the named external/Duke programs. The program notes refer applicants to these conditions without expanding or inventing them.
- "The Graduate School is able to offer a limited number of application fee waivers each cycle."
- Exact sentence:
  > As such, fee waiver requests are “first-come, first-serviced.”
- "If you do not qualify based on the above eligibility requirements, your department of interest may have a limited number of fee waivers available for prospective applicants starting later in the fall semester."
- "You may contact your department of interest directly to inquire about a departmental fee waiver."
- `available` for UPGG, MCB and Neurobiology means waivers exist for eligible applicants, with the citizenship rules and uncertain departmental availability in the note. It does not assert international waiver availability. CBB is `domestic-only` because its own admissions page explicitly excludes international waivers.

https://gradschool.duke.edu/admissions/admissions-faqs/

- Under "Are DACA participants or undocumented applicants living in the United States eligible for fee waivers?": "Yes, in many cases we do provide exceptions to our citizenship requirement for DACA and undocumented applicants as long as all other criteria are met."

## English tests

https://gradschool.duke.edu/admissions/application-instructions/english-language-proficiency-test-scores/

- "If your first language is not English, you must submit scores from either the Test of English as a Foreign Language (TOEFL), the academic modules of the International English Language Testing System (IELTS), or the Duolingo English Test with subscores."
- "The Graduate School generally seeks scores no less than:" followed by "90 for an Internet-based TOEFL*", "7.0 for the IELTS Academic", "125 for the Duolingo English Test".
- "Note: The average scores of our admitted students are above these levels."
- "For exams taken before January 21, 2026, we generally seek scores no less than a minimum TOEFL iBT score of 90."
- "For exams taken on or after January 21, 2026, we generally seek scores no less than a minimum TOEFL iBT score of 5."
- "Score reports without subscores will not be accepted." (Duolingo section.)
- "For example, if you submit your application between August 2026 and May 2027 to apply for Fall 2027 admission, your score report must be dated August 1, 2024 or later, regardless of when you submit your application during that period."
- "To be eligible for a TOEFL/IELTS/Duolingo English Test waiver, you must have studied fulltime for two years or more at a college or university where the sole language of instruction is English and in a country where English is the primary spoken language."
- "The two years of study must be completed prior to the start of the program."
- "All admitted international students whose first language is not English are required to take placement exams conducted by the English Language Support Program at the beginning of the term of matriculation, even if the TOEFL/IELTS/Duolingo English Test requirement is waived (see below)."
- The two TOEFL values are the page's own requirements for different test dates, not a conversion. IELTS is stored as `7` and Duolingo as `125`.

## Guaranteed PhD funding

https://gradschool.duke.edu/financial-support/phd-financial-support/

- "The Graduate School guarantees all Ph.D. students a stipend for their first five years of study."
- "Starting in fall 2022, all Duke Ph.D. students will receive a 12-month stipend during their first five years of study (details on how this is handled in each Ph.D. program)."
- "Tuition for all Ph.D. students in their first five years of study is covered by either The Graduate School or external fellowships."
- "The Graduate School covers mandatory fees for all Ph.D. students in their first five years of study."
- "The Graduate School covers the full premiums for medical and dental insurance for all Ph.D. students in their first six years of study, as long as they are on the Duke student medical insurance plan and student dental plan (learn more about the plans)."
- "In year 6 and beyond, stipend support is at the discretion of each Ph.D. program."
- "Programs differ in the amount, length, and requirements of their stipend support, so check with the DGS."
- `allFunded: true` and `coversInternational: yes` use the explicit "all Ph.D. students" language, as allowed by DATA.md. UPGG instead uses `coversInternational: limited` because its own FAQ gives a more restrictive warning, documented in that program's evidence. Neurobiology's own six-year guarantee is also documented separately.

## Stipend amount omitted for Fall 2027

https://gradschool.duke.edu/financial-support/tuition-fees-and-phd-stipend-schedule/

- Table headers: "Actual | Actual", "2025-2026 | 2026-2027".
- "Provides prior and current academic year tuition, stipend, and fee rates."
- "The following AY stipend rate will be shared with programs when available, so August rates can be adjusted appropriately."
- No 2027–28 amount appears. No `funding.stipend` is entered in any of the four records. This checked page is recorded here as evidence of an omission, not as a source for a populated JSON field.

## Independent second check

Completed 2026-10-22 by a separate reviewer who did none of the original
research. Every populated fact in the four program JSON files was compared
with its evidence. The reviewer reopened all 23 distinct URLs in their
`sources`, plus the stipend schedule above; all opened successfully.

- Confirmed the Fall 2027 deadline rows, optional GRE, shared requirements,
  program admission models and funding qualifications.
- Preserved UPGG's explicit warning about limited international funding as
  the safer program-specific value alongside the central funding guarantee.
- Confirmed central waiver eligibility and exceptions; CBB's own exclusion
  supports its `domestic-only` classification.
- Restored the exact quotation marks in the fee-waiver sentence above and
  clarified that CBB expects missing prerequisites to be completed before
  or during the first year.
- No unsupported populated facts remained. The inaccessible legacy CBB
  links and omitted facts remain documented in the individual files.
