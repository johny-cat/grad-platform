import { useEffect, useState } from 'preact/hooks';
import SeasonStrip from '../components/SeasonStrip';
import { fetchProgramResults, isConnected, isDemo, reportContent } from '../lib/api';
import { signInHref, useSession } from '../lib/session';
import { todayIso } from '../lib/time';
import { DECISIONS, DECISION_LABELS, type Decision, type ResultItem } from '../lib/types';
import ResultRow from './ResultRow';

interface Props {
  slug: string;
  cycleId: string;
  cycleLabel: string;
  season: { start: string; end: string };
  deadlines: string[];
  replyBy?: string;
}

/** The program's season timeline with reported results, and the results list. */
export default function ProgramResults({ slug, cycleId, cycleLabel, season, deadlines, replyBy }: Props) {
  const { userId } = useSession();
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Decision | 'all'>('all');
  const [message, setMessage] = useState<string | null>(null);
  const live = isConnected || isDemo;
  const today = todayIso();

  useEffect(() => {
    if (!live) return;
    fetchProgramResults(slug, cycleId)
      .then(setResults)
      .catch((e: Error) => setError(e.message));
  }, [slug, cycleId, live]);

  async function flag(result: ResultItem) {
    if (!userId) {
      window.location.href = signInHref();
      return;
    }
    if (!window.confirm('Flag this report as fake or harmful? Moderators will review it.')) return;
    try {
      await reportContent('result', result.id, 'fake');
      setMessage('Thanks. Reports flagged by three people are hidden until a moderator checks them.');
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  const all = results ?? [];
  const shown = filter === 'all' ? all : all.filter((r) => r.decision === filter);
  const counts = Object.fromEntries(DECISIONS.map((d) => [d, all.filter((r) => r.decision === d).length]));
  const summary =
    all.length === 0
      ? `${cycleLabel} season timeline. No results reported yet.`
      : `${cycleLabel} season timeline with ${all.length} reported results.`;

  return (
    <div>
      <SeasonStrip
        start={season.start}
        end={season.end}
        today={today}
        deadlines={deadlines}
        replyBy={replyBy}
        phases={[]}
        dots={all.map((r) => ({ date: r.decided_on, decision: r.decision }))}
        label={summary}
        showLegend
      />

      <div class="section__head" style="margin-top:28px">
        <h2 id="results-heading">Reported results</h2>
        <a class="btn btn--small" href={`/report/?program=${slug}`}>
          Report a result
        </a>
      </div>

      {!live && (
        <div class="empty">
          <p>Live results switch on once the database is connected.</p>
        </div>
      )}
      {live && error && (
        <div class="notice notice--error" role="alert">
          <p>Could not load results. {error}</p>
        </div>
      )}
      {live && !error && results === null && <p class="muted">Loading results…</p>}
      {live && results && results.length === 0 && (
        <div class="empty">
          <p>
            <strong>Nobody has reported a result for this program yet.</strong> If you hear back, report it here so
            everyone waiting on this program knows.
          </p>
        </div>
      )}
      {live && results && results.length > 0 && (
        <>
          <div class="filters__toggles" role="group" aria-label="Show results" style="margin-bottom:12px">
            <button
              type="button"
              class={`btn btn--small ${filter === 'all' ? '' : 'btn--quiet'}`}
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All {all.length}
            </button>
            {DECISIONS.filter((d) => counts[d]! > 0).map((d) => (
              <button
                type="button"
                class={`btn btn--small ${filter === d ? '' : 'btn--quiet'}`}
                aria-pressed={filter === d}
                onClick={() => setFilter(d)}
              >
                {DECISION_LABELS[d]} {counts[d]}
              </button>
            ))}
          </div>
          {message && (
            <p class="notice small" role="status">
              {message}
            </p>
          )}
          <ul class="results" aria-labelledby="results-heading">
            {shown.map((r) => (
              <ResultRow result={r} today={today} onFlag={flag} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
