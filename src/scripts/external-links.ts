/**
 * Links to other websites (official program pages, application portals,
 * sources) open in a new tab, so HeardYet stays open behind them.
 * Works for links added later by interactive parts too, because it acts on
 * the click itself.
 */
function isExternal(link: HTMLAnchorElement): boolean {
  if (!link.href || link.hasAttribute('download')) return false;
  try {
    const url = new URL(link.href, window.location.href);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function markExternal(link: HTMLAnchorElement) {
  if (link.dataset.external !== undefined || !isExternal(link)) return;
  link.dataset.external = '';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  // Tell screen-reader users before they leave the page.
  const note = document.createElement('span');
  note.className = 'visually-hidden';
  note.textContent = ' (opens in a new tab)';
  link.append(note);
}

for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) markExternal(link);

// Links that interactive parts add after the page loads.
document.addEventListener(
  'click',
  (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    if (link instanceof HTMLAnchorElement) markExternal(link);
  },
  true,
);
