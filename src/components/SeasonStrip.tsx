/**
 * The season timeline: the admissions cycle drawn from October to April, with
 * deadlines, typical phases, reported results and a "Today" marker.
 *
 * Works both as static HTML (rendered at build time; a small page script
 * then places the Today marker) and inside interactive parts of the page.
 */
import type { Decision } from '../lib/types';
import { edgeClass } from '../lib/season';
import {
  addDays,
  edgeInRange,
  formatMonth,
  formatShortDate,
  monthStarts,
  percent,
  positionInRange,
} from '../lib/time';

export interface SeasonStripProps {
  start: string;
  end: string;
  variant?: 'full' | 'hero' | 'mini';
  /** Today's date. Leave out on static pages; the page script fills it in. */
  today?: string;
  phases?: readonly { label: string; start: string; end: string }[];
  replyBy?: string;
  deadlines?: string[];
  dots?: { date: string; decision: Decision }[];
  /** One sentence describing the timeline for screen readers. */
  label: string;
  showLegend?: boolean;
}

export default function SeasonStrip({
  start,
  end,
  variant = 'full',
  today,
  phases = [],
  replyBy,
  deadlines = [],
  dots = [],
  label,
  showLegend = false,
}: SeasonStripProps) {
  const mark = (iso: string) => percent(positionInRange(iso, start, end));
  const edge = (iso: string) => percent(edgeInRange(iso, start, end));
  const inRange = (iso: string) => iso >= start && iso <= end;
  const todayInRange = today !== undefined && inRange(today);
  const todayFraction = todayInRange ? positionInRange(today!, start, end) : 0;
  const uniqueDeadlines = [...new Set(deadlines.filter(inRange))].sort();

  const todayMarker = (
    <span
      class={`season__today${edgeClass(todayFraction)}`}
      data-today=""
      hidden={!todayInRange}
      style={`--at:${percent(todayFraction)}`}
    >
      {variant !== 'mini' && <span class="season__today-label">Today</span>}
    </span>
  );

  if (variant === 'mini') {
    return (
      <figure class="season season--mini" data-season-start={start} data-season-end={end}>
        <figcaption class="visually-hidden">{label}</figcaption>
        <div class="season__chart" aria-hidden="true">
          <span class="season__track" />
          {uniqueDeadlines.map((d) => (
            <span class="season__tick" style={`--at:${mark(d)}`} />
          ))}
          {dots.filter((d) => inRange(d.date)).map((d) => (
            <span class={`season__dot season__dot--${d.decision}`} style={`--at:${mark(d.date)}`} />
          ))}
          {todayMarker}
        </div>
      </figure>
    );
  }

  const months = monthStarts(start, end);

  // Group result dots by day so several reports on one day stack upwards.
  const stacks = new Map<string, Decision[]>();
  for (const dot of dots) {
    if (!inRange(dot.date)) continue;
    const list = stacks.get(dot.date) ?? [];
    list.push(dot.decision);
    stacks.set(dot.date, list);
  }

  return (
    <figure
      class={variant === 'hero' ? 'season season--full season--hero' : 'season season--full'}
      data-season-start={start}
      data-season-end={end}
    >
      <figcaption class="visually-hidden">{label}</figcaption>
      <div class="season__chart" aria-hidden="true">
        <div class="season__grid">
          {months.map((m) => (
            <span class="season__gridline" style={`--at:${edge(m)}`} />
          ))}
        </div>
        <div class="season__rows">
          {phases.map((phase, index) => (
            <div class="season__row">
              <span class="season__bar-label" style={`--from:${edge(phase.start)}`}>
                {phase.label}
              </span>
              <span
                class="season__bar"
                style={`--from:${edge(phase.start)};--to:${edge(addDays(phase.end, 1))}`}
              />
              {index === 0 && uniqueDeadlines.map((d) => <span class="season__tick" style={`--at:${mark(d)}`} />)}
              {replyBy && index === phases.length - 1 && inRange(replyBy) && (
                <span class="season__milestone" style={`--at:${mark(replyBy)}`} />
              )}
            </div>
          ))}
          {phases.length === 0 && (uniqueDeadlines.length > 0 || replyBy) && (
            <div class="season__row">
              <span class="season__bar-label" style="--from:0%">
                Key dates
              </span>
              {uniqueDeadlines.map((d) => (
                <span class="season__tick" style={`--at:${mark(d)}`} />
              ))}
              {replyBy && inRange(replyBy) && <span class="season__milestone" style={`--at:${mark(replyBy)}`} />}
            </div>
          )}
          {dots.length > 0 && (
            <div class="season__results">
              {[...stacks.entries()].map(([date, decisions]) => (
                <span class="season__stack" style={`--at:${mark(date)}`}>
                  {decisions.slice(0, 8).map((decision) => (
                    <span class={`season__dot season__dot--${decision}`} />
                  ))}
                </span>
              ))}
            </div>
          )}
        </div>
        <div class="season__months">
          {months.map((m) => (
            <span class="season__month" style={`--at:${edge(m)}`}>
              {formatMonth(m)}
            </span>
          ))}
        </div>
        {todayMarker}
      </div>
      {showLegend && (
        <ul class="season__legend">
          {uniqueDeadlines.length > 0 && (
            <li>
              <span class="legend-tick" aria-hidden="true" />
              Deadline
            </li>
          )}
          {replyBy && (
            <li>
              <span class="legend-milestone" aria-hidden="true" />
              Usual reply date, {formatShortDate(replyBy)}
            </li>
          )}
          <li>
            <span class="legend-today" aria-hidden="true" />
            Today
          </li>
        </ul>
      )}
    </figure>
  );
}
