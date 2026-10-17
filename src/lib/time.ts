/**
 * Date helpers shared by the build (server) and the browser.
 * Dates are calendar dates as 'YYYY-MM-DD' strings unless stated otherwise.
 */

export const DAY_MS = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' -> milliseconds at UTC midnight (for calendar maths only). */
export function dateToUtcMs(iso: string): number {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Calendar date of an instant in the viewer's (or given) time zone. */
export function isoDateIn(instant: Date, timeZone?: string): string {
  if (!timeZone) {
    return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}`;
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Today's date for the person viewing the page. Preview builds can pretend
 * it is another day (PUBLIC_DEMO_TODAY) so sample data looks realistic.
 */
export function todayIso(): string {
  const demoToday = import.meta.env.PUBLIC_DEMO === '1' ? import.meta.env.PUBLIC_DEMO_TODAY : undefined;
  return demoToday || isoDateIn(new Date());
}

/** Whole calendar days from a to b (positive when b is later). */
/** The current instant (midday on the pretend date in preview builds). */
export function nowMs(): number {
  const demoToday = import.meta.env.PUBLIC_DEMO === '1' ? import.meta.env.PUBLIC_DEMO_TODAY : undefined;
  return demoToday ? dateToUtcMs(demoToday) + DAY_MS / 2 : Date.now();
}

export function daysBetween(aIso: string, bIso: string): number {
  return Math.round((dateToUtcMs(bIso) - dateToUtcMs(aIso)) / DAY_MS);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(dateToUtcMs(iso) + days * DAY_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Where a date falls between start and end, from 0 to 1 (clamped). */
export function positionInRange(iso: string, startIso: string, endIso: string): number {
  const start = dateToUtcMs(startIso);
  const span = dateToUtcMs(endIso) + DAY_MS - start;
  const at = dateToUtcMs(iso) + DAY_MS / 2 - start;
  return Math.min(1, Math.max(0, at / span));
}

/** Where the very start of a day falls between start and end, from 0 to 1. */
export function edgeInRange(iso: string, startIso: string, endIso: string): number {
  const start = dateToUtcMs(startIso);
  const span = dateToUtcMs(endIso) + DAY_MS - start;
  return Math.min(1, Math.max(0, (dateToUtcMs(iso) - start) / span));
}

export function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(2)}%`;
}

/** First day of each month inside a range, for timeline labels. */
export function monthStarts(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  let [y = 1970, m = 1] = startIso.split('-').map(Number);
  while (true) {
    const iso = `${y}-${pad(m)}-01`;
    if (iso > endIso) break;
    if (iso >= startIso) out.push(iso);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/** Minutes a time zone is ahead of UTC at a given instant. */
function offsetMinutes(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - utcMs) / 60_000);
}

/** The exact instant of a local wall-clock time in a time zone. */
export function zonedTimeToUtc(dateIso: string, time: string, timeZone: string): number {
  const [hh = 0, mm = 0] = time.split(':').map(Number);
  const guess = dateToUtcMs(dateIso) + (hh * 60 + mm) * 60_000;
  const first = offsetMinutes(guess, timeZone);
  let utc = guess - first * 60_000;
  const second = offsetMinutes(utc, timeZone);
  if (second !== first) utc = guess - second * 60_000;
  return utc;
}

const longDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

const shortDateYear = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const monthName = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });

/** "Tuesday, December 1, 2026" */
export function formatLongDate(iso: string): string {
  return longDate.format(new Date(dateToUtcMs(iso)));
}

/** "Dec 1" */
export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(dateToUtcMs(iso)));
}

/** "Dec 1, 2026" */
export function formatShortDateYear(iso: string): string {
  return shortDateYear.format(new Date(dateToUtcMs(iso)));
}

/** "Dec" */
export function formatMonth(iso: string): string {
  return monthName.format(new Date(dateToUtcMs(iso)));
}

/** "23:59" -> "11:59 pm" */
export function formatClock(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

const ZONE_NAMES: Record<string, string> = {
  'America/Los_Angeles': 'Pacific time',
  'America/Denver': 'Mountain time',
  'America/Chicago': 'Central time',
  'America/New_York': 'Eastern time',
  'Europe/London': 'UK time',
  'Europe/Berlin': 'Central European time',
  'Asia/Kolkata': 'India time',
  'Asia/Karachi': 'Pakistan time',
};

export function zoneName(timeZone: string): string {
  return ZONE_NAMES[timeZone] ?? timeZone.replace(/_/g, ' ');
}

/** "45 days left", "Closes today", "Closed" */
export function countdownLabel(daysLeft: number, passed: boolean): string {
  if (passed || daysLeft < 0) return 'Closed';
  if (daysLeft === 0) return 'Closes today';
  if (daysLeft === 1) return 'Closes tomorrow';
  return `${daysLeft} days left`;
}

/** Relative wording for a past date, e.g. "today", "2 days ago", "Jan 4". */
export function relativeDay(iso: string, today: string = todayIso()): string {
  const diff = daysBetween(iso, today);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatShortDate(iso);
}
