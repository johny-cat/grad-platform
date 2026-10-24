import { useEffect, useState } from 'preact/hooks';
import { addPost, editMyPost, fetchPosts, fetchThread, isConnected, isDemo, reportContent } from '../lib/api';
import { signInHref, useSession } from '../lib/session';
import { SPACES, type Post, type Thread } from '../lib/types';
import { REPORT_REASONS, timeAgo } from '../lib/community';

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** One discussion: its posts, replies, editing your own post and reporting. */
export default function ThreadView() {
  const { userId, loading } = useSession();
  const [id] = useState(() => Number(new URLSearchParams(window.location.search).get('id')) || 0);
  const [thread, setThread] = useState<Thread | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reporting, setReporting] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const live = isConnected || isDemo;

  async function load() {
    const [t, p] = await Promise.all([fetchThread(id), fetchPosts(id)]);
    setThread(t);
    setPosts(p);
  }

  useEffect(() => {
    if (!live || !id) {
      setThread(null);
      return;
    }
    load().catch((e: Error) => {
      setError(e.message);
      setThread(null);
    });
    // Reload when someone signs in, so "Edit" appears on their own posts.
  }, [id, live, userId]);

  useEffect(() => {
    if (thread) document.title = `${thread.title} | HeardYet`;
  }, [thread]);

  async function send(event: Event) {
    event.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addPost(id, reply.trim());
      setReply('');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function report(postId: number, reason: string) {
    setError(null);
    try {
      await reportContent('post', postId, reason);
      setNotice('Thanks. A moderator will look at it. Posts reported by several people are hidden until then.');
    } catch (e) {
      setError((e as Error).message);
    }
    setReporting(null);
  }

  async function saveEdit(postId: number) {
    if (!editDraft.trim()) return;
    setError(null);
    try {
      await editMyPost(postId, editDraft.trim());
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!live) return <p class="muted">The community isn't switched on yet.</p>;
  if (thread === undefined) return <p class="muted">Loading…</p>;
  if (thread === null) {
    return (
      <div class="empty">
        <p>This discussion isn't available. It may have been removed.</p>
        <p>
          <a href="/community/">Back to the community</a>
        </p>
      </div>
    );
  }

  const space = SPACES.find((s) => s.id === thread.space);
  const back = thread.program_slug
    ? { href: `/programs/${thread.program_slug}/#discussion`, label: 'Back to the program' }
    : { href: space ? `/community/?space=${space.id}` : '/community/', label: space ? space.label : 'Community' };

  return (
    <article class="thread">
      <p class="small">
        <a href={back.href}>{back.label}</a>
      </p>
      <h1 class="thread__title">{thread.title}</h1>

      <ol class="post-list">
        {posts.map((p, i) => {
          const canEdit = p.is_mine && Date.now() - new Date(p.created_at).getTime() < EDIT_WINDOW_MS;
          return (
            <li class={i === 0 ? 'post post--first' : 'post'} id={`post-${p.id}`}>
              <p class="post__meta small">
                <strong>{p.author_handle}</strong>
                <span class="muted">
                  {' '}
                  {timeAgo(p.created_at)}
                  {p.edited_at ? ' (edited)' : ''}
                </span>
              </p>
              {editing === p.id ? (
                <div class="field">
                  <label class="visually-hidden" for={`edit-${p.id}`}>
                    Edit your post
                  </label>
                  <textarea id={`edit-${p.id}`} rows={4} maxLength={5000} value={editDraft} onInput={(e) => setEditDraft((e.target as HTMLTextAreaElement).value)} />
                  <div class="actions">
                    <button type="button" class="btn btn--small" onClick={() => saveEdit(p.id)}>
                      Save
                    </button>
                    <button type="button" class="btn btn--small btn--quiet" onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p class="post__body">{p.body}</p>
              )}
              <p class="post__actions small">
                {canEdit && editing !== p.id && (
                  <button
                    type="button"
                    class="link-button"
                    onClick={() => {
                      setEditing(p.id);
                      setEditDraft(p.body);
                    }}
                  >
                    Edit
                  </button>
                )}
                {userId && !p.is_mine && reporting !== p.id && (
                  <button type="button" class="link-button" onClick={() => setReporting(p.id)}>
                    Report
                  </button>
                )}
              </p>
              {reporting === p.id && (
                <div class="report-choices" role="group" aria-label="Why are you reporting this post?">
                  <p class="small">Why are you reporting this post?</p>
                  {REPORT_REASONS.map((r) => (
                    <button type="button" class="btn btn--small btn--quiet" onClick={() => report(p.id, r.id)}>
                      {r.label}
                    </button>
                  ))}
                  <button type="button" class="link-button small" onClick={() => setReporting(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {notice && <p class="notice notice--success">{notice}</p>}
      {error && <p class="notice notice--error">{error}</p>}

      {thread.locked ? (
        <p class="muted">This discussion is closed to new replies.</p>
      ) : loading ? null : userId ? (
        <form class="form compose" onSubmit={send} noValidate>
          <div class="field">
            <label for="reply">Your reply</label>
            <textarea id="reply" rows={4} maxLength={5000} value={reply} onInput={(e) => setReply((e.target as HTMLTextAreaElement).value)} />
            <p class="hint">Be kind. Don't share anyone's personal details, including your own.</p>
          </div>
          <button type="submit" class="btn" disabled={busy || !reply.trim()}>
            {busy ? 'Sending…' : 'Reply'}
          </button>
        </form>
      ) : (
        <p>
          <a class="btn btn--quiet" href={signInHref()}>
            Sign in to reply
          </a>
        </p>
      )}
    </article>
  );
}
