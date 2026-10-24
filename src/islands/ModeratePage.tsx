import { useEffect, useState } from 'preact/hooks';
import { fetchMyProfile, fetchReportedContent, isConnected, moderateContent, setMemberBlocked } from '../lib/api';
import { signInHref, useSession } from '../lib/session';
import type { ReportedItem } from '../lib/types';
import { timeAgo } from '../lib/community';

/** For moderators: reported posts and threads, with hide, restore and block. */
export default function ModeratePage() {
  const { userId, loading } = useSession();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems] = useState<ReportedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setItems(await fetchReportedContent());
  }

  useEffect(() => {
    if (!userId || !isConnected) return;
    fetchMyProfile(userId)
      .then((p) => {
        const ok = p?.role === 'moderator' || p?.role === 'admin';
        setAllowed(ok);
        if (ok) return load();
      })
      .catch((e: Error) => setError(e.message));
  }, [userId]);

  async function act(item: ReportedItem, hidden: boolean) {
    setError(null);
    try {
      await moderateContent(item.target_type, item.target_id, hidden);
      setMessage(hidden ? 'Hidden. Its reports are closed.' : 'Restored. Its reports are closed.');
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function block(item: ReportedItem) {
    if (!item.author_handle) return;
    setError(null);
    try {
      await setMemberBlocked(item.author_handle, true);
      await moderateContent(item.target_type, item.target_id, true);
      setMessage(`${item.author_handle} can no longer post, and this was hidden.`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!isConnected) return <p class="muted">The community isn't switched on yet.</p>;
  if (loading) return <p class="muted">Loading…</p>;
  if (!userId) {
    return (
      <p>
        <a class="btn" href={signInHref()}>
          Sign in
        </a>
      </p>
    );
  }
  if (allowed === false) return <p class="muted">This page is for moderators.</p>;

  return (
    <div>
      {message && <p class="notice notice--success">{message}</p>}
      {error && <p class="notice notice--error">{error}</p>}
      {items === null ? (
        <p class="muted">Loading…</p>
      ) : items.length === 0 ? (
        <div class="empty">
          <p>Nothing to review. Reported posts will appear here.</p>
        </div>
      ) : (
        <ul class="thread-list">
          {items.map((item) => (
            <li class="thread-item">
              <p class="small muted">
                {item.target_type === 'thread' ? 'Discussion' : 'Reply'} by <strong>{item.author_handle}</strong> ·{' '}
                {item.report_count} {item.report_count === 1 ? 'report' : 'reports'} ({item.reasons}) · {timeAgo(item.first_reported)}
                {item.hidden ? ' · hidden now' : ''}
              </p>
              {item.title && (
                <p>
                  <a href={`/community/thread/?id=${item.thread_id}`}>{item.title}</a>
                </p>
              )}
              {item.body && <p class="post__body">{item.body}</p>}
              <div class="actions">
                {item.hidden ? (
                  <button type="button" class="btn btn--small" onClick={() => act(item, false)}>
                    Restore, it's fine
                  </button>
                ) : (
                  <button type="button" class="btn btn--small" onClick={() => act(item, true)}>
                    Hide
                  </button>
                )}
                {item.hidden && (
                  <button type="button" class="btn btn--small btn--quiet" onClick={() => act(item, true)}>
                    Keep hidden
                  </button>
                )}
                <button type="button" class="btn btn--small btn--quiet" onClick={() => block(item)}>
                  Hide and block {item.author_handle}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
