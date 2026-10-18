/**
 * Site-wide settings. Change a value here and it changes everywhere.
 *
 * Everything in this file is PUBLIC. Never put a secret here: no service_role
 * key, no database password, no API secret. See docs/SECURITY.md.
 */

/** Working name. Final name is still to be decided; change it here only. */
export const SITE_NAME = 'HeardYet';

/** The question every applicant asks. Used as the main headline. */
export const SITE_TAGLINE = 'Has anyone heard yet?';

/** Name of the community space for people who haven't made it yet. */
export const COMMUNITY_NAME = 'Not Yet';

/**
 * Public web address. Update this when the domain is bought.
 * Used for canonical links and social previews.
 */
export const SITE_URL = 'https://grad-platform.pages.dev';

/**
 * The admissions cycle the site is focused on.
 * Must match a row in the public.cycles table (see supabase/migrations).
 */
export const CURRENT_CYCLE = {
  id: 'fall-2027',
  label: 'Fall 2027 entry',
  /** The stretch of the year the season timeline shows. */
  season: { start: '2026-10-01', end: '2027-04-30' },
  /**
   * Typical phases of a US PhD cycle, drawn on the season timeline as a guide.
   * Programs differ; each program page shows its own dates.
   */
  phases: [
    { label: 'Applications due', start: '2026-11-01', end: '2026-12-15' },
    { label: 'Interviews', start: '2027-01-05', end: '2027-03-10' },
    { label: 'Offers', start: '2027-02-01', end: '2027-04-01' },
  ],
  /** Most US graduate programs ask admitted students to decide by April 15. */
  replyBy: '2027-04-15',
} as const;

/** The previous cycle, used for "last year's timeline". */
export const PREVIOUS_CYCLE = {
  id: 'fall-2026',
  label: 'Fall 2026 entry',
} as const;

/**
 * Supabase project. Both values are public by design: anyone can see them in
 * the browser, and row-level security in the database decides what they can
 * read or write. They can be overridden with PUBLIC_SUPABASE_URL and
 * PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables at build time.
 */
export const SUPABASE_URL = 'https://nhebswofygpgxcgvginn.supabase.co';

/** The publishable ("anon") key. Empty means live features show as off. */
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NTOGnLAE48DIdVAmhBY44g_rXMT_2S4';

/**
 * Whether sign-in emails contain a one-time code as well as the link.
 *
 * Keep false while the site uses Supabase's built-in email: its templates
 * can't be edited, so emails carry only a link, and that link works only in
 * the browser that asked for it. The sign-in page then says so and shows no
 * code box. Set to true once custom SMTP is live and both the "Confirm sign
 * up" and "Magic link or OTP" templates contain {{ .Token }}
 * (docs/SETUP.md, section 3).
 */
export const SIGN_IN_EMAIL_HAS_CODE = false;

/** Contact address shown on the site for corrections and safety reports. */
export const CONTACT_EMAIL = '';
