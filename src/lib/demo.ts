/**
 * SAMPLE DATA for preview builds only (PUBLIC_DEMO=1). Never shown on the
 * live site: production builds talk to the real database instead, and every
 * preview page carries a banner saying the data is made up.
 */
import type { Decision, MyResult, ProgramStats, ResultItem } from './types';

type Sample = [slug: string, name: string, institution: string, decision: Decision, date: string, extra?: Partial<ResultItem>];

const SAMPLES: Sample[] = [
  ['harvard-bbs-phd', 'Biological and Biomedical Sciences (BBS) PhD', 'Harvard University', 'accepted', '2027-02-09', { channel: 'email', applicant_type: 'international', note: 'Sample: offer email, funding details attached.' }],
  ['harvard-bbs-phd', 'Biological and Biomedical Sciences (BBS) PhD', 'Harvard University', 'waitlisted', '2027-02-09', { channel: 'email' }],
  ['mit-biology-phd', 'Biology PhD', 'Massachusetts Institute of Technology', 'rejected', '2027-02-03', { channel: 'portal', applicant_type: 'international' }],
  ['scripps-research-phd', 'Doctoral Program in Chemical and Biological Sciences', 'Scripps Research', 'rejected', '2027-02-06', { channel: 'email', gpa_band: '3.0-3.49' }],
  ['washu-dbbs-phd', 'Division of Biology and Biomedical Sciences (DBBS) PhD', 'Washington University in St. Louis', 'accepted', '2027-02-05', { channel: 'phone', applicant_type: 'domestic', note: 'Sample: call from the program director.' }],
  ['stanford-biosciences-phd', 'Biosciences PhD Programs', 'Stanford University', 'interview', '2027-01-21', { channel: 'email', applicant_type: 'international', note: 'Sample: invited to the March interview session.' }],
  ['stanford-biosciences-phd', 'Biosciences PhD Programs', 'Stanford University', 'interview', '2027-01-20', { channel: 'email' }],
  ['mit-biology-phd', 'Biology PhD', 'Massachusetts Institute of Technology', 'interview', '2027-01-15', { channel: 'email' }],
  ['mit-biology-phd', 'Biology PhD', 'Massachusetts Institute of Technology', 'interview', '2027-01-14', { channel: 'email', applicant_type: 'international' }],
  ['rockefeller-bioscience-phd', 'David Rockefeller Graduate Program in Bioscience', 'The Rockefeller University', 'interview', '2027-01-12', { channel: 'email' }],
  ['washu-dbbs-phd', 'Division of Biology and Biomedical Sciences (DBBS) PhD', 'Washington University in St. Louis', 'interview', '2026-12-18', { channel: 'email', applicant_type: 'international' }],
  ['harvard-bbs-phd', 'Biological and Biomedical Sciences (BBS) PhD', 'Harvard University', 'interview', '2026-12-16', { channel: 'email', applicant_type: 'international', gpa_band: 'below-3.0', note: 'Sample: interview weekend Jan 21-24.' }],
  ['harvard-bbs-phd', 'Biological and Biomedical Sciences (BBS) PhD', 'Harvard University', 'interview', '2026-12-15', { channel: 'email' }],
  ['harvard-bbs-phd', 'Biological and Biomedical Sciences (BBS) PhD', 'Harvard University', 'interview', '2026-12-15', { channel: 'email', applicant_type: 'domestic' }],
  ['ucsf-bms-phd', 'Biomedical Sciences (BMS) PhD', 'University of California, San Francisco', 'interview', '2026-12-14', { channel: 'email', applicant_type: 'international' }],
  ['ucsf-bms-phd', 'Biomedical Sciences (BMS) PhD', 'University of California, San Francisco', 'interview', '2026-12-13', { channel: 'portal' }],
];

function withinTwoDays(a: string, b: string): boolean {
  return Math.abs(Date.parse(a) - Date.parse(b)) <= 2 * 86_400_000;
}

export function demoResults(): ResultItem[] {
  const base: ResultItem[] = SAMPLES.map(([slug, name, institution, decision, date, extra], i) => ({
    id: SAMPLES.length - i,
    program_slug: slug,
    program_name: name,
    institution,
    cycle_id: 'fall-2027',
    decision,
    decided_on: date,
    channel: null,
    applicant_type: null,
    gpa_band: null,
    note: null,
    created_at: `${date}T15:00:00Z`,
    matching_reports: 0,
    ...extra,
  }));
  return base.map((r) => ({
    ...r,
    matching_reports: base.filter(
      (o) => o.id !== r.id && o.program_slug === r.program_slug && o.decision === r.decision && withinTwoDays(o.decided_on, r.decided_on),
    ).length,
  }));
}

const FOLLOWERS: Record<string, [applied: number, following: number]> = {
  'harvard-bbs-phd': [41, 63],
  'stanford-biosciences-phd': [38, 70],
  'mit-biology-phd': [33, 52],
  'ucsf-bms-phd': [29, 44],
  'washu-dbbs-phd': [22, 31],
  'scripps-research-phd': [17, 35],
  'rockefeller-bioscience-phd': [14, 27],
};

export function demoStats(): ProgramStats[] {
  const results = demoResults();
  return Object.entries(FOLLOWERS).map(([slug, [applied, following]]) => {
    const mine = results.filter((r) => r.program_slug === slug);
    const count = (d: Decision) => mine.filter((r) => r.decision === d).length;
    const first = (d: Decision) =>
      mine.filter((r) => r.decision === d).map((r) => r.decided_on).sort()[0] ?? null;
    return {
      program_slug: slug,
      applied_count: applied,
      following_count: following,
      interview_count: count('interview'),
      accepted_count: count('accepted'),
      waitlisted_count: count('waitlisted'),
      rejected_count: count('rejected'),
      first_interview_on: first('interview'),
      first_accepted_on: first('accepted'),
      last_report_at: mine[0]?.created_at ?? null,
    };
  });
}

export function demoMyResults(): MyResult[] {
  return demoResults()
    .filter((r) => r.id === 5 || r.id === 4)
    .map(({ matching_reports: _ignored, ...r }) => ({ ...r, hidden: false }));
}
