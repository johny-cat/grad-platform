/** Shapes shared between pages, interactive parts and the database. */

export type Decision = 'interview' | 'accepted' | 'waitlisted' | 'rejected';

export const DECISIONS: Decision[] = ['interview', 'accepted', 'waitlisted', 'rejected'];

export const DECISION_LABELS: Record<Decision, string> = {
  interview: 'Interview',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
};

export const CHANNEL_LABELS: Record<string, string> = {
  email: 'By email',
  portal: 'On the portal',
  phone: 'By phone',
  other: 'Other way',
};

export const APPLICANT_LABELS: Record<string, string> = {
  international: 'International applicant',
  domestic: 'Domestic applicant',
};

export const GPA_LABELS: Record<string, string> = {
  'below-3.0': 'GPA below 3.0',
  '3.0-3.49': 'GPA 3.0 to 3.49',
  '3.5-3.79': 'GPA 3.5 to 3.79',
  '3.8-4.0': 'GPA 3.8 to 4.0',
};

export interface ProgramSummary {
  slug: string;
  name: string;
  institution: string;
  short: string;
  country: string;
  deadline?: { date: string; time?: string; timezone?: string };
  /** Home areas or tracks inside an umbrella program, for search. */
  tracks?: string[];
}

/** A row from the public results_feed view. */
export interface ResultItem {
  id: number;
  program_slug: string;
  program_name: string;
  institution: string;
  cycle_id: string;
  decision: Decision;
  decided_on: string;
  channel: string | null;
  applicant_type: string | null;
  gpa_band: string | null;
  note: string | null;
  created_at: string;
  matching_reports: number;
}

/** A row from get_my_results(). */
export interface MyResult extends Omit<ResultItem, 'matching_reports'> {
  hidden: boolean;
}

/** A row from get_program_stats(). */
export interface ProgramStats {
  program_slug: string;
  applied_count: number;
  following_count: number;
  interview_count: number;
  accepted_count: number;
  waitlisted_count: number;
  rejected_count: number;
  first_interview_on: string | null;
  first_accepted_on: string | null;
  last_report_at: string | null;
}

export type FollowStatus = 'watching' | 'applied';

export interface Follow {
  program_slug: string;
  cycle_id: string;
  status: FollowStatus;
  email_alerts: boolean;
}

export interface Profile {
  id: string;
  handle: string;
  kind: string | null;
  country: string | null;
  role: string;
}

export interface NewResult {
  programSlug: string;
  cycleId: string;
  decision: Decision;
  decidedOn: string;
  channel?: string;
  applicantType?: string;
  gpaBand?: string;
  note?: string;
}
