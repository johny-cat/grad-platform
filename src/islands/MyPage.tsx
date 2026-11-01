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
          <strong>Nothing here yet.</strong> Follow the programs you applied to, and they and their news collect
          here on this device. No sign-up needed.
        </p>
        <p class="small">
          <a href="/programs/">Find your programs</a>. Already added your email on another device?{' '}
          <a href={signInHref()}>Sign in with email</a> to see them here.
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

  const [calendarBusy, setCalendarBusy] = useState(false);

  /**
   * One calendar file with the deadlines of every followed program: the
   * events from each program's own calendar file (/programs/<id>/deadlines.ics),
   * fetched only when asked, so this page stays light.
   */
  async function downloadCalendar() {
    setCalendarBusy(true);
    setError(null);
    try {
      const files = await Promise.all(
        (follows ?? []).map((f) =>
          fetch(`/programs/${f.program_slug}/deadlines.ics`).then((r) => (r.ok ? r.text() : '')),
        ),
      );
      const events = files.flatMap((text) => text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? []);
      if (events.length === 0) {
        setError("None of the programs you follow has a published deadline yet.");
        return;
      }
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//HeardYet//Deadlines//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:My grad school deadlines',
        ...events,
        'END:VCALENDAR',
        '',
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-deadlines.ics';
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Could not make the calendar file. Check your connection and try again.');
    } finally {
      setCalendarBusy(false);
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
        {!isDemo && session?.user.is_anonymous ? (
          <p class="small muted">
            Shown on discussion posts, never on results. Everything here is saved on this device only.{' '}
            <a href="/signin/">Add your email</a> to keep it on your other devices too, and if you clear this
            browser.
          </p>
        ) : (
          <p class="small muted">
            Shown on discussion posts, never on results. Signed in as {isDemo ? 'a preview user' : session?.user.email}.{' '}
            <button type="button" class="link-button" onClick={() => signOut().then(() => window.location.assign('/'))}>
              Sign out
            </button>
          </p>
        )}
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
          <div class="add-calendar">
            <p class="add-calendar__title">Add my deadlines to my calendar</p>
            <p class="small muted">
              One file with the deadlines of the programs you follow, with reminders 7 days and 1 day before. Open it on your phone or computer to add it to Apple
              Calendar or Outlook. For Google Calendar on a computer: Settings, Import & export, then choose the file.
              Follow more programs later? Download it again; it updates the same events instead of adding copies.
            </p>
            <p>
              <button type="button" class="btn btn--small" onClick={downloadCalendar} disabled={calendarBusy}>
                {calendarBusy ? 'Preparing…' : 'Download my deadlines (.ics)'}
              </button>
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
                          {p.deadline.estimated ? ' (year not confirmed)' : ''}
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
