/**
 * Calendar icons (components/CalendarButton.astro): one tap adds that
 * deadline to the visitor's calendar, choosing by device:
 *  - Android and Chromebooks: opens Google Calendar with the deadline filled in
 *  - iPhone, iPad, Mac, Windows and others: a calendar file, which opens in
 *    Apple Calendar or Outlook, with reminders 7 days and 1 day before
 */
import { buildIcs, googleCalendarLink, type CalendarDeadline } from '../lib/calendar';

function usesGoogleCalendar(): boolean {
  const ua = navigator.userAgent;
  return /Android|CrOS/i.test(ua);
}

function download(deadline: CalendarDeadline) {
  const blob = new Blob([buildIcs([deadline], deadline.programLabel)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deadline.programId}-${deadline.date}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest?.<HTMLButtonElement>('button[data-calendar]');
  if (!button) return;
  const deadline = JSON.parse(button.dataset.calendar!) as CalendarDeadline;
  if (usesGoogleCalendar()) window.open(googleCalendarLink(deadline), '_blank', 'noopener');
  else download(deadline);
});
