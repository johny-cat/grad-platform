/** "just now", "5 min ago", "3 h ago", "2 days ago", or a date. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? 'yesterday' : `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export const REPORT_REASONS: { id: string; label: string }[] = [
  { id: 'spam', label: 'Spam or advertising' },
  { id: 'abusive', label: 'Rude or hurtful' },
  { id: 'personal-info', label: 'Shares personal details' },
  { id: 'fake', label: 'False or misleading' },
  { id: 'other', label: 'Something else' },
];
