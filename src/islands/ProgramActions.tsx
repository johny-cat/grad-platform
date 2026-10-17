import { useEffect, useState } from 'preact/hooks';
import { fetchMyFollows, fetchStats, isConnected, isDemo, removeFollow, setFollow } from '../lib/api';
import { signInHref, useSession } from '../lib/session';
import type { FollowStatus, ProgramStats } from '../lib/types';

interface Props {
  slug: string;
  cycleId: string;
}

const EMPTY: Omit<ProgramStats, 'program_slug'> = {
  applied_count: 0,
  following_count: 0,
  interview_count: 0,
  accepted_count: 0,
  waitlisted_count: 0,
  rejected_count: 0,
  first_interview_on: null,
  first_accepted_on: null,
  last_report_at: null,
};

/** "N applied here", plus the Follow and I applied buttons. */
export default function ProgramActions({ slug, cycleId }: Props) {
  const { loading, userId } = useSession();
  const [stats, setStats] = useState<ProgramStats>({ program_slug: slug, ...EMPTY });
  const [status, setStatus] = useState<FollowStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = isConnected || isDemo;

  useEffect(() => {
    if (!live) return;
    fetchStats(cycleId, slug)
      .then((rows) => rows[0] && setStats(rows[0]))
      .catch((e: Error) => setError(e.message));
  }, [cycleId, slug, live]);

  useEffect(() => {
    if (!live || !userId) return;
    fetchMyFollows(cycleId)
      .then((rows) => setStatus(rows.find((r) => r.program_slug === slug)?.status ?? null))
      .catch((e: Error) => setError(e.message));
  }, [cycleId, slug, userId, live]);

  async function choose(next: FollowStatus | null) {
    if (!userId) {
      window.location.href = signInHref();
      return;
    }
    const before = status;
    const counts = (s: FollowStatus | null) => ({ applied: s === 'applied' ? 1 : 0, following: s ? 1 : 0 });
    const delta = { applied: counts(next).applied - counts(before).applied, following: counts(next).following - counts(before).following };
    setBusy(true);
    setError(null);
    setStatus(next);
    setStats((s) => ({
      ...s,
      applied_count: Math.max(0, s.applied_count + delta.applied),
      following_count: Math.max(0, s.following_count + delta.following),
    }));
    try {
      if (next) await setFollow(userId, slug, cycleId, next);
      else await removeFollow(userId, slug, cycleId);
    } catch (e) {
      setStatus(before);
      setStats((s) => ({
        ...s,
        applied_count: Math.max(0, s.applied_count - delta.applied),
        following_count: Math.max(0, s.following_count - delta.following),
      }));
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!live) {
    return <p class="small muted">Following and live counts switch on once the database is connected.</p>;
  }

  return (
    <div>
      <ul class="stat-line" aria-live="polite">
        <li>
          <strong>{stats.applied_count}</strong> applied here
        </li>
        <li>
          <strong>{stats.following_count}</strong> following
        </li>
      </ul>
      <div class="actions" role="group" aria-label="Your status for this program">
        <button
          type="button"
          class={`btn btn--small ${status === 'applied' ? 'btn--on' : 'btn--quiet'}`}
          aria-pressed={status === 'applied'}
          disabled={busy || loading}
          onClick={() => choose(status === 'applied' ? 'watching' : 'applied')}
        >
          I applied
        </button>
        <button
          type="button"
          class={`btn btn--small ${status ? 'btn--on' : 'btn--quiet'}`}
          aria-pressed={Boolean(status)}
          disabled={busy || loading}
          onClick={() => choose(status ? null : 'watching')}
        >
          {status ? 'Following' : 'Follow'}
        </button>
      </div>
      {error && (
        <p class="notice notice--error small" role="alert">
          {error}
        </p>
      )}
      <p class="small muted">Only the counts are public. Nobody can see which programs you follow.</p>
    </div>
  );
}
