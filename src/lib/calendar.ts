/**
 * Calendar files (.ics, for Apple Calendar, Outlook, Google Calendar import)
 * and "Add to Google Calendar" links for application deadlines. Shared by the
 * build (program pages) and the browser (My programs).
 *
 * Deadlines are all-day events on the date the program states. Each has two
 * reminders, 7 days and 1 day before (calendar apps that ignore reminders in
 * imported files use their own default instead).
 */
import { SITE_NAME, SITE_URL } from '../config';

export interface CalendarDeadline {
  /** Program id, used for a stable event id so re-importing updates instead of duplicating. */
  programId: string;
  /** e.g. "Duke Cell and Molecular Biology PhD" */
  programLabel: string;
  /** YYYY-MM-DD */
  date: string;
  /** e.g. "Priority deadline" */
  label: string;
  /** "23:59" with a time zone, when the page states a time. */
  time?: string;
  timezone?: string;
  /** From an official date whose year isn't confirmed for this season. */
  estimated?: boolean;
}

const compact = (iso: string) => iso.replaceAll('-', '');

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function title(d: CalendarDeadline): string {
  return `${d.estimated ? 'Likely deadline' : 'Deadline'}: ${d.programLabel}`;
}

function details(d: CalendarDeadline): string {
  const lines = [d.label];
  if (d.time && d.timezone) lines.push(`Closes at ${d.time} (${d.timezone}).`);
  if (d.estimated) {
    lines.push("Year not confirmed: the program's official page gives this date for an earlier year or without a year. Check the official page.");
  }
  lines.push(`${SITE_URL}/programs/${d.programId}/`);
  return lines.join('\n');
}

/** Text escaping for .ics values. */
function esc(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
}

/** Lines longer than 75 bytes are folded, as the calendar format requires. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    out.push(rest.slice(0, 73));
    rest = ` ${rest.slice(73)}`;
  }
  out.push(rest);
  return out.join('\r\n');
}

/** A calendar file holding every given deadline, with reminders. */
export function buildIcs(deadlines: CalendarDeadline[], calendarName = `${SITE_NAME} deadlines`): string {
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${SITE_NAME}//Deadlines//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(calendarName)}`,
  ];
  for (const d of deadlines) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${d.programId}-${compact(d.date)}-${esc(d.label).replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40)}@heardyet`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(d.date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(d.date))}`,
      `SUMMARY:${esc(title(d))}`,
      `DESCRIPTION:${esc(details(d))}`,
      `URL:${SITE_URL}/programs/${d.programId}/`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(`In 7 days: ${title(d)}`)}`,
      'TRIGGER:-P7D',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(`Tomorrow: ${title(d)}`)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/** A link that opens Google Calendar with this deadline filled in (one event). */
export function googleCalendarLink(d: CalendarDeadline): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title(d),
    dates: `${compact(d.date)}/${compact(nextDay(d.date))}`,
    details: details(d),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
