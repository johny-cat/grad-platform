/**
 * Runs on every page. Pages are built ahead of time, so anything that
 * depends on today's date is filled in here, in the visitor's browser:
 *  - countdowns ("45 days left") and deadlines in the visitor's own time zone
 *  - hiding deadlines that have passed from "coming up" lists
 *  - the "Today" marker on season timelines
 */
import {
  countdownLabel,
  daysBetween,
  nowMs,
  percent,
  positionInRange,
  todayIso,
  zonedTimeToUtc,
} from '../lib/time';
import { edgeClass } from '../lib/season';

const localFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function updateDeadlines(today: string) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-deadline]')) {
    const { date, time, tz } = el.dataset;
    if (!date) continue;
    // Days are counted to the date the program states (the date shown on the
    // page), so every "Dec 1" deadline shows the same count. When the page
    // gives an exact time, that time decides when the deadline has passed.
    let days = daysBetween(today, date);
    let passed = days < 0;
    let label: string | null = null;
    if (time && tz) {
      const instant = zonedTimeToUtc(date, time, tz);
      const msLeft = instant - nowMs();
      passed = msLeft <= 0;
      if (!passed) {
        days = Math.max(0, days);
        if (msLeft < 24 * 3_600_000) {
          const hours = Math.ceil(msLeft / 3_600_000);
          label = hours <= 1 ? 'Closes within the hour' : `Closes in ${hours} hours`;
        }
      }
      const local = el.querySelector<HTMLElement>('[data-localtime]');
      if (local) {
        local.textContent = `In your time zone: ${localFormat.format(new Date(instant))}`;
        local.hidden = false;
      }
    }
    const countdown = el.querySelector<HTMLElement>('[data-countdown]');
    if (countdown) countdown.textContent = label ?? countdownLabel(days, passed);
    el.classList.toggle('is-passed', passed);
    if (passed && el.hasAttribute('data-hide-when-passed')) el.hidden = true;
  }

  for (const list of document.querySelectorAll<HTMLElement>('[data-upcoming]')) {
    const limit = Number(list.dataset.limit ?? '5');
    let shown = 0;
    for (const item of list.querySelectorAll<HTMLElement>('[data-deadline]')) {
      if (item.hidden) continue;
      shown += 1;
      if (shown > limit) item.hidden = true;
    }
    const empty = document.querySelector<HTMLElement>(`[data-upcoming-empty="${list.id}"]`);
    if (empty) empty.hidden = shown > 0;
  }
}

function placeTodayMarkers(today: string) {
  for (const strip of document.querySelectorAll<HTMLElement>('[data-season-start]')) {
    const start = strip.dataset.seasonStart!;
    const end = strip.dataset.seasonEnd!;
    const marker = strip.querySelector<HTMLElement>('[data-today]');
    if (!marker) continue;
    if (today < start || today > end) {
      marker.hidden = true;
      continue;
    }
    const fraction = positionInRange(today, start, end);
    marker.style.setProperty('--at', percent(fraction));
    marker.className = `season__today${edgeClass(fraction)}`;
    marker.hidden = false;
  }
}

function run() {
  const today = todayIso();
  updateDeadlines(today);
  placeTodayMarkers(today);
}

run();
// Keep countdowns honest for people who leave the tab open overnight.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') run();
});
