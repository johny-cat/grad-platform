import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  deleteMyResult,
  fetchMyFollows,
  fetchMyProfile,
  fetchMyResults,
  fetchResultsForPrograms,
  isConnected,
  isDemo,
  removeFollow,
  setFollow,
  updateMyProfile,
} from '../lib/api';
import { signInHref, signOut, useSession } from '../lib/session';
import { countdownLabel, daysBetween, formatShortDate, todayIso } from '../lib/time';
import {
  DECISION_LABELS,
  type Follow,
  type FollowStatus,
  type MyResult,
  type Profile,
  type ProgramSummary,
  type ResultItem,
} from '../lib/types';
import ResultRow from './ResultRow';
import { programLabel } from '../lib/labels';

interface Props {
  programs: ProgramSummary[];
  cycleId: string;
  cycleLabel: string;
}

export default function MyPage({ programs, cycleId, cycleLabel }: Props) {
  const { loading, session, userId } = useSession();
  const byslug = useMemo(() => new Map(programs.map((p) => [p.slug, p])), [programs]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [follows, setFollows] = useState<Follow[] | null>(null);
  const [feed, setFeed] = useState<ResultItem[] | null>(null);
  const [mine, setMine] = useState<MyResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [handleDraft, setHandleDraft] = useState('');
  const today = todayIso();
  const live = isConnected || isDemo;

  useEffect(() => {
    if (!live || !userId) return;
    Promise.all([fetchMyProfile(userId), fetchMyFollows(cycleId), fetchMyResults()])
      .then(([p, f, m]) => {
        setProfile(p);
        setFollows(f);
        setMine(m);
        return fetchResultsForPrograms(
          f.map((x) => x.program_slug),
          cycleId,
        ).then(setFeed);
      })
      .catch((e: Error) => setError(e.message));
  }, [userId, cycleId, live]);

  if (!live) {
    return (
      <div class="empty">
        <p>Your page switches on once the database is connected.</p>
      </div>
    );
  }
  if (loading) return <p class="muted">Checking whether you're signed in…</p>;
  if (!userId) {
    return (
      <div class="empty">
        <p>
          <strong>Sign in to see your programs.</strong> Follow the programs you applied to and their news collects
          here.
        </p>
        <p>
          <a class="btn" href={signInHref()}>
            Sign in
          </a>
        </p>
      </div>
    );
  }

  async function changeStatus(slug: string, status: FollowStatus) {
    if (!userId) return;
    try {
      await setFollow(userId, slug, cycleId, status);
      setFollows((list) => list?.map((f) => (f.program_slug === slug ? { ...f, status } : f)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function unfollow(slug: string) {
    if (!userId) return;
    try {
      await removeFollow(userId, slug, cycleId);
      setFollows((list) => list?.filter((f) => f.program_slug !== slug) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteMyResult(id);
      setMine((list) => list?.filter((r) => r.id !== id) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function saveHandle(event: Event) {
    event.preventDefault();
    try {
      await updateMyProfile(handleDraft.trim());
      setProfile((p) => (p ? { ...p, handle: handleDraft.trim() } : p));
      setEditing(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const label = (slug: string) => {
    const p = byslug.get(slug);
    return p ? programLabel(p.short, p.name) : slug;
  };

  return (
    <div>
      {error && (
        <p class="notice notice--error" role="alert">
          {error}
        </p>
      )}

      <section class="section" aria-labelledby="me-name">
        <h2 id="me-name">Your public name</h2>
        {!editing ? (
          <p>
            <strong>{profile?.handle ?? '…'}</strong>{' '}
            <button
              type="button"
              class="link-button"
              onClick={() => {
                setHandleDraft(profile?.handle ?? '');
                setEditing(true);
              }}
            >
              Change
            </button>
          </p>
        ) : (
          <form class="search" onSubmit={saveHandle}>
            <label class="visually-hidden" for="handle">
              Public name
            </label>
            <input
              id="handle"
              type="text"
              maxLength={32}
              value={handleDraft}
              onInput={(e) => setHandleDraft((e.target as HTMLInputElement).value)}
            />
            <button type="submit" class="btn">
              Save
            </button>
          </form>
        )}
        <p class="small muted">
          Shown on discussion posts, never on results. Signed in as {isDemo ? 'a preview user' : session?.user.email}.{' '}
          <button type="button" class="link-button" onClick={() => signOut().then(() => window.location.assign('/'))}>
            Sign out
          </button>
        </p>
      </section>

      <section class="section" aria-labelledby="me-programs">
        <div class="section__head">
          <h2 id="me-programs">Your programs</h2>
          <span class="muted small">{cycleLabel}</span>
        </div>
        {follows === null && <p class="muted">Loading…</p>}
        {follows && follows.length === 0 && (
          <div class="empty">
            <p>You're not following any programs yet. Open a program and press Follow or I applied.</p>
            <p>
              <a class="btn btn--small" href="/programs/">
                Find your programs
              </a>
            </p>
          </div>
        )}
        {follows && follows.length > 0 && (
          <ul class="program-list">
            {follows.map((f) => {
              const p = byslug.get(f.program_slug);
              const latest = feed?.find((r) => r.program_slug === f.program_slug);
              const days = p?.deadline ? daysBetween(today, p.deadline.date) : null;
              return (
                <li class="program-row program-row--mine">
                  <div>
                    <h3 class="program-row__title">
                      <a href={`/programs/${f.program_slug}/`}>
                        <span class="program-row__institution">{p?.short ?? f.program_slug}</span>
                        <span class="program-row__name">{p?.name}</span>
                      </a>
                    </h3>
                    <ul class="result__meta">
                      <li>
                        {latest
                          ? `Latest report: ${DECISION_LABELS[latest.decision]}, ${formatShortDate(latest.decided_on)}`
                          : 'No reports yet'}
                      </li>
                      {p?.deadline && days !== null && (
                        <li>
                          Deadline {formatShortDate(p.deadline.date)}: {countdownLabel(days, days < 0).toLowerCase()}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div class="actions" role="group" aria-label={`Your status for ${label(f.program_slug)}`}>
                    <button
                      type="button"
                      class={`btn btn--small ${f.status === 'applied' ? 'btn--on' : 'btn--quiet'}`}
                      aria-pressed={f.status === 'applied'}
                      onClick={() => changeStatus(f.program_slug, f.status === 'applied' ? 'watching' : 'applied')}
                    >
                      I applied
                    </button>
                    <button type="button" class="btn btn--small btn--quiet" onClick={() => unfollow(f.program_slug)}>
                      Unfollow
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {feed && feed.length > 0 && (
        <section class="section" aria-labelledby="me-news">
          <h2 id="me-news">News from your programs</h2>
          <ul class="results">
            {feed.map((r) => (
              <ResultRow result={r} today={today} programLabel={label(r.program_slug)} />
            ))}
          </ul>
        </section>
      )}

      <section class="section" aria-labelledby="me-reports">
        <div class="section__head">
          <h2 id="me-reports">Your reports</h2>
          <a class="btn btn--small" href="/report/">
            Report a result
          </a>
        </div>
        {mine === null && <p class="muted">Loading…</p>}
        {mine && mine.length === 0 && <p class="muted">You haven't reported any results yet.</p>}
        {mine && mine.length > 0 && (
          <ul class="results">
            {mine.map((r) => (
              <li class="result">
                <span class={`chip chip--${r.decision}`}>{DECISION_LABELS[r.decision]}</span>
                <div class="result__body">
                  <p class="result__line">
                    <a class="result__program" href={`/programs/${r.program_slug}/`}>
                      {label(r.program_slug)}
                    </a>
                    <span class="result__when">{formatShortDate(r.decided_on)}</span>
                  </p>
                  {r.hidden && (
                    <p class="result__note">Hidden while moderators review flags from other people.</p>
                  )}
                  <p class="result__actions">
                    <button type="button" class="link-button" onClick={() => remove(r.id)}>
                      Delete
                    </button>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
