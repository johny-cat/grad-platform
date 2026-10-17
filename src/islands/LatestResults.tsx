import { useEffect, useState } from 'preact/hooks';
import { fetchRecentResults, isConnected, isDemo } from '../lib/api';
import { todayIso } from '../lib/time';
import type { ResultItem } from '../lib/types';
import ResultRow from './ResultRow';

interface Props {
  cycleId: string;
  /** slug -> short label, e.g. "Harvard BBS PhD". */
  labels: Record<string, string>;
  limit?: number;
}

export default function LatestResults({ cycleId, labels, limit = 8 }: Props) {
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const live = isConnected || isDemo;

  useEffect(() => {
    if (!live) return;
    fetchRecentResults(cycleId, limit)
      .then(setResults)
      .catch((e: Error) => setError(e.message));
  }, [cycleId, limit, live]);

  if (!live) {
    return (
      <div class="empty">
        <p>Live results switch on once the database is connected.</p>
      </div>
    );
  }
  if (error) {
    return (
      <div class="notice notice--error" role="alert">
        <p>Could not load the latest reports. {error}</p>
      </div>
    );
  }
  if (!results) {
    return <p class="muted" aria-live="polite">Loading the latest reports…</p>;
  }
  if (results.length === 0) {
    return (
      <div class="empty">
        <p>
          <strong>No reports yet this season.</strong> When you hear back from a program, report it here so everyone
          still waiting knows too.
        </p>
        <p>
          <a class="btn btn--small" href="/report/">
            Report a result
          </a>
        </p>
      </div>
    );
  }

  const today = todayIso();
  return (
    <ul class="results">
      {results.map((r) => (
        <ResultRow result={r} today={today} programLabel={labels[r.program_slug] ?? r.program_name} />
      ))}
    </ul>
  );
}
