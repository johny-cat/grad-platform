import type { ResultItem } from '../lib/types';
import { APPLICANT_LABELS, CHANNEL_LABELS, DECISION_LABELS, GPA_LABELS } from '../lib/types';
import { formatShortDateYear, relativeDay } from '../lib/time';

interface Props {
  result: ResultItem;
  /** Show which program the result is for (feeds that mix programs). */
  programLabel?: string;
  today: string;
  onFlag?: (result: ResultItem) => void;
}

export default function ResultRow({ result, programLabel, today, onFlag }: Props) {
  const meta = [
    result.channel ? CHANNEL_LABELS[result.channel] : null,
    result.applicant_type ? APPLICANT_LABELS[result.applicant_type] : null,
    result.gpa_band ? GPA_LABELS[result.gpa_band] : null,
  ].filter(Boolean) as string[];
  const others = result.matching_reports;

  return (
    <li class="result">
      <span class={`chip chip--${result.decision}`}>{DECISION_LABELS[result.decision]}</span>
      <div class="result__body">
        <p class="result__line">
          {programLabel && (
            <a class="result__program" href={`/programs/${result.program_slug}/`}>
              {programLabel}
            </a>
          )}
          <time class="result__when" dateTime={result.decided_on} title={formatShortDateYear(result.decided_on)}>
            {relativeDay(result.decided_on, today)}
          </time>
        </p>
        {meta.length > 0 && (
          <ul class="result__meta">
            {meta.map((item) => (
              <li>{item}</li>
            ))}
          </ul>
        )}
        {result.note && <p class="result__note">{result.note}</p>}
        {others > 0 && (
          <p class="result__confirm">
            {others === 1 ? '1 other person reported this too' : `${others} other people reported this too`}
          </p>
        )}
        {onFlag && (
          <p class="result__actions">
            <button type="button" class="link-button" onClick={() => onFlag(result)}>
              Flag as fake or harmful
            </button>
          </p>
        )}
      </div>
    </li>
  );
}
