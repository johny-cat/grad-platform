import { useEffect, useState } from 'preact/hooks';
import { createThread, fetchThreads, isConnected, isDemo } from '../lib/api';
import { signInHref, useSession } from '../lib/session';
import { SPACES, type Space, type Thread } from '../lib/types';
import { timeAgo } from '../lib/community';

interface Props {
  /** On a program page: that program's discussions only. */
  programSlug?: string;
  programName?: string;
}

type Tab = Space | 'all';

function tabFromUrl(): Tab {
  const s = new URLSearchParams(window.location.search).get('space');
  return SPACES.some((x) => x.id === s) ? (s as Space) : 'all';
}

/** The list of discussions, with a form to start one. */
export default function CommunityBoard({ programSlug, programName }: Props) {
  const { userId, loading } = useSession();
  const [tab, setTab] = useState<Tab>(() => (programSlug ? 'all' : tabFromUrl()));
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [space, setSpace] = useState<Space>(() => (tab === 'all' ? 'general' : tab));
  const [busy, setBusy] = useState(false);
  const live = isConnected || isDemo;

  useEffect(() => {
    if (!live) return;
    setThreads(null);
    fetchThreads(programSlug ? { programSlug } : tab === 'all' ? {} : { space: tab })
      .then(setThreads)
      .catch((e: Error) => setError(e.message));
  }, [tab, programSlug, live]);

  function choose(next: Tab) {
    setTab(next);
    if (next !== 'all') setSpace(next);
    const url = new URL(window.location.href);
    if (next === 'all') url.searchParams.delete('space');
    else url.searchParams.set('space', next);
    history.replaceState(null, '', url);
  }

  async function submit(event: Event) {
    event.preventDefault();
    if (title.trim().length < 3 || body.trim().length < 1) {
      setError('Add a title (at least 3 characters) and a message.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const id = await createThread(
        programSlug ? { title: title.trim(), body: body.trim(), programSlug } : { title: title.trim(), body: body.trim(), space },
      );
      window.location.href = `/community/thread/?id=${id}`;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!live) return <p class="muted">The community isn't switched on yet.</p>;

  const current = SPACES.find((s) => s.id === tab);

  return (
    <div class="community">
      {!programSlug && (
        <div class="space-tabs" role="tablist" aria-label="Spaces">
          <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => choose('all')}>
            Everything
          </button>
          {SPACES.map((s) => (
            <button type="button" role="tab" aria-selected={tab === s.id} onClick={() => choose(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      {current && <p class="muted space-blurb">{current.blurb}</p>}

      <div class="community__start">
        {composing ? (
          <form class="form compose" onSubmit={submit} noValidate>
            {!programSlug && (
              <div class="field">
                <label for="space">Space</label>
                <select id="space" value={space} onChange={(e) => setSpace((e.target as HTMLSelectElement).value as Space)}>
                  {SPACES.map((s) => (
                    <option value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div class="field">
              <label for="thread-title">Title</label>
              <input id="thread-title" type="text" maxLength={150} value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} />
            </div>
            <div class="field">
              <label for="thread-body">Message</label>
              <textarea id="thread-body" rows={5} maxLength={5000} value={body} onInput={(e) => setBody((e.target as HTMLTextAreaElement).value)} />
              <p class="hint">Be kind. Don't share anyone's personal details, including your own.</p>
            </div>
            <div class="actions">
              <button type="submit" class="btn" disabled={busy}>
                {busy ? 'Posting…' : 'Post'}
              </button>
              <button type="button" class="btn btn--quiet" onClick={() => setComposing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : loading ? null : userId ? (
          <button type="button" class="btn" onClick={() => setComposing(true)}>
            {programSlug ? `Start a discussion about ${programName ?? 'this program'}` : 'Start a discussion'}
          </button>
        ) : (
          <a class="btn btn--quiet" href={signInHref()}>
            Sign in to post
          </a>
        )}
      </div>

      {error && <p class="notice notice--error">{error}</p>}

      {threads === null ? (
        <p class="muted">Loading…</p>
      ) : threads.length === 0 ? (
        <div class="empty">
          <p>{programSlug ? 'No discussions about this program yet. Start the first one.' : 'Nothing here yet. Start the first discussion.'}</p>
        </div>
      ) : (
        <ul class="thread-list">
          {threads.map((t) => (
            <li class="thread-item">
              <a class="thread-item__title" href={`/community/thread/?id=${t.id}`}>
                {t.title}
              </a>
              <p class="thread-item__meta small muted">
                {t.author_handle}
                {tab === 'all' && !programSlug && t.space && <> · {SPACES.find((s) => s.id === t.space)?.label}</>}
                {' · '}
                {t.post_count === 1 ? 'no replies yet' : `${t.post_count - 1} ${t.post_count === 2 ? 'reply' : 'replies'}`}
                {' · '}
                {timeAgo(t.last_post_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
