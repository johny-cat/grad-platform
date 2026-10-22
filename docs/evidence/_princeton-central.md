# Princeton central evidence

Checked live on 2026-10-22 for Fall 2027 entry. These source sentences support shared facts in the four program evidence files. All sources were opened independently; the existing Molecular Biology record was used only to locate central URLs. No program facts were copied from that record.

## C1 — Institution, address, tests and English exemptions

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/english-proficiency

Institution and university location (`institution`, `institutionShort`, `country`, `location`):

> The address, for identification purposes only, is: Princeton University, Graduate Admission, One Clio Hall, Princeton, NJ 08544.

The JSON uses the conventional expansion New Jersey and country code US for this university address.

English test requirement:

> If your primary language is not English, you must meet English language proficiency requirements and may be required to submit TOEFL, IELTS, or DET test scores.

> The Graduate School does not have a minimum score requirement.

The page identifies DET in its “Duolingo English Test (DET)” heading.

Exemptions (the following are list entries under “Exemptions from Testing”):

> Applicants whose undergraduate instruction is entirely in English as certified by the institution and for whom the degree will be awarded prior to anticipated enrollment at Princeton.

> Applicants whose graduate study was on a full-time basis for at least two academic years where instruction was entirely in English as certified by the institution.

> Please note that this requirement must be fully met at the time the application opens to qualify for the exemption.

Used for every `requirements.english.note`. No numeric admission score minimum is populated. Enrollment assessment thresholds, which are different from admission minimums, are not presented as admission requirements in these records.

## C2 — Application fee and waiver policy

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/application-fee

> A nonrefundable $90 application fee is required with your application.

Waiver eligibility text:

> Applicants may be eligible to request a fee waiver based on the following criteria.

The criteria list reads:

> Financial Hardship

> Participation in a Program

> Recruiting Event Attendee

> Virtual Workshop Attendee

> Only programs from the list below are accepted.

> The deadline to submit a fee waiver request is two business days before the department application deadline.

> A fee waiver decision will be emailed to you within 2-3 business days.

Used for `requirements.applicationFee.amount=90`, `currency=USD`, and the timing/criteria note. “USD” normalizes the dollar fee at the US university. `waiver=unknown`: the opened policy describes fee waivers but does not explicitly confirm that international applicants can obtain one. Neither a list containing Fulbright nor generic “applicants” wording was treated as proof of international eligibility.

The linked Virtual Workshop Series page was also opened:
https://graddiversity.princeton.edu/prospective-students/virtual-workshop-series

It did not explicitly establish international waiver eligibility. No facts unique to that page are used.

## C3 — Exactly three recommendations

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/letters-recommendation

> Three letters of recommendation are required.

> To ensure that each application receives a thorough and thoughtful review, we limit the number of letters of recommendation to three.

Used for every `requirements.letters.min=3` and `max=3`.

## C4 — Academic statement of purpose

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/academic-statement-purpose

> Applicants will be required to upload an academic statement of purpose with the admission application in the space provided.

> The essay must be written in English and should not exceed 1,000 words.

Used for the academic statement entry in every `requirements.documents`.

## C5 — Personal statement

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/personal-statement

> Applicants will be required to upload a personal statement with the admission application in the space provided.

> The essay must be written in English and should not exceed 250 words.

Used for the personal statement entry in every `requirements.documents`.

## C6 — Resume or CV

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/resume-curriculum-vitae

> Applicants will be required to upload a resume or curriculum vitae with the admission application in the space provided.

Used for the resume/CV entry in every `requirements.documents`.

## C7 — Transcripts and translations

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/transcripts

> As part of the admission application, applicants are required to upload unofficial transcripts, including the transcript key, for each institution they are currently attending or have previously attended.

> Applicants with transcripts in languages other than English will need to upload an official English translation along with such transcripts.

Used for the transcript entry in every `requirements.documents`.

## C8 — Application link and cycle

Source: https://gradschool.princeton.edu/admission-onboarding/apply

> The application for Fall 2027 is now open.

> The application opens in September for admission commencing in the fall term of the following academic year.

Used for `applyUrl` and `cycle=fall-2027`. Each program's Graduate School page separately says its December 1 deadline is for enrollment beginning in fall 2027. The resulting deadline date is 2026-12-01. All four use 23:59 and America/New_York to represent the explicitly stated “11:59 p.m. Eastern Standard Time.”

## C9 — Full funding, including international students

Source: https://gradschool.princeton.edu/financial-support/financial-support-model

> Princeton offers financial support for all Ph.D. students throughout their period of regular enrollment.

> This includes full tuition, university student health plan coverage, and a base stipend intended to cover estimated living expenses.

Used for `funding.allFunded=true`, `funding.coversInternational=yes`, and the funding note. “All Ph.D. students” is the explicit universal coverage statement; international coverage is not inferred from an external grant's eligibility.

Source: https://gradschool.princeton.edu/admission-onboarding

> We guarantee full tuition, fees, and stipends to all regularly enrolled, degree-seeking Ph.D. candidates throughout regular program enrollment, contingent upon satisfactory academic performance.

Used for the academic-performance condition in every funding note.

Also opened:
https://gradschool.princeton.edu/financial-support/financial-support-model/phd-funding-natural-sciences-engineering

No stipend amount for Fall 2027 was confirmed on the opened pages. No older-year or undated amount is carried into `funding.stipend`.

## C10 — Decision notification timeline

Source: https://gradschool.princeton.edu/admission-onboarding/apply/decision-notification

> Admission decisions are emailed separately by department or program starting at the end of January through March 15.

> All decisions are sent to all applicants no later than March 15.

> If placed on the waitlist, it might be closer to April 15 before receiving a final admission decision.

Used for every `timeline.decisions`. The page provides a general recurring timeline, not a program-specific interview schedule.

## C11 — Current international eligibility restriction

Source: https://gradschool.princeton.edu/admission-onboarding/prepare

Under “Update for Individuals Who are Located in or Ordinarily Reside in Iran”:

> As a result, U.S. universities, including Princeton, may no longer process applications for admission from individuals who are located in Iran or who ordinarily reside in Iran, as determined by OFAC.

> Please know that we continue to monitor the situation and will post any new guidance should it become available.

Used for the eligibility restriction and invitation to check for updates in every `international.note`. The three programs without an explicit international-applicant statement retain `international.accepted=unknown`; Neuroscience has its own explicit welcome quoted in its evidence file.

The same page recognizes international degree equivalents:

> International equivalents to the bachelor's degree may, in some cases, have a normal program length that is shorter or longer than four years.

Degree equivalence alone was not treated as a citizenship-based admissions guarantee.

## C12 — Conditional fall grades (QCB only)

Source: https://gradschool.princeton.edu/admission-onboarding/prepare/fall-semester-grades

> Applicants will be encouraged to upload a current transcript which includes the fall semester grades from the college or university where they are currently enrolled.

> If an applicant is not a current student or if the school does not provide fall semester grades, fall semester grades are not required.

> If the fall semester grades are not available at the time of application submission, please log back into the application checklist and upload them when they become available.

Used to qualify the QCB application page's fall-grades document entry.

## Research notes

The Explore page was opened at https://gradschool.princeton.edu/admission-onboarding/explore but supplies no unique fact in the JSON.

No URL failed, so no retry was necessary. No web searches were used. Administrative `details=checked`, source check dates and `lastChecked=2026-10-22` document this live verification; they are not claims made by the university.

## Independent second review — 2026-10-22

A helper who did not research Princeton compared every populated field in all four program JSON files with the exact sentences in this file and the four program evidence files. No unsupported field or mismatch was found, and no program fact was changed.

Live pages reopened included all four Graduate School program pages, EEB Admission & Financial Support, PNI Graduate Students, and the central eligibility, English, fee, funding, recommendation-letter and decision-notification pages. The review reconfirmed the explicit Fall 2027 deadlines, required admission models, GRE distinctions, the location/residence-based Iran restriction, and the distinction between limited international admissions and full financial support for every admitted Neuroscience student. Fee-waiver status remains unknown because explicit international eligibility was not established. Historical stipend amounts remain omitted.
