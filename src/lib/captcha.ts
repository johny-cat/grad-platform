/**
 * Cloudflare Turnstile: an invisible check that a real person is using the
 * browser. Most people never see anything; a few get a single click. The
 * token it returns goes to Supabase, which verifies it with the secret key.
 */
import { TURNSTILE_SITE_KEY } from '../config';

interface Turnstile {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let loading: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Robot check failed to load.')));
    script.onerror = () => {
      loading = null;
      reject(new Error('Could not load the robot check. Check your connection and try again.'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** A fresh token, or undefined when the check is switched off. */
export async function getCaptchaToken(): Promise<string | undefined> {
  if (!TURNSTILE_SITE_KEY) return undefined;
  const turnstile = await loadTurnstile();
  const box = document.createElement('div');
  box.className = 'captcha-box';
  document.body.appendChild(box);
  let widget: string | undefined;
  try {
    return await new Promise<string>((resolve, reject) => {
      widget = turnstile.render(box, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: 'interaction-only',
        callback: (token: string) => resolve(token),
        'error-callback': () => reject(new Error('The robot check didn\'t pass. Please try again.')),
        'expired-callback': () => reject(new Error('The robot check timed out. Please try again.')),
        'timeout-callback': () => reject(new Error('The robot check timed out. Please try again.')),
      });
    });
  } finally {
    // Remove the widget itself as well as its box, so pressing the button
    // again starts a fresh check instead of reusing a failed one.
    setTimeout(() => {
      if (widget) turnstile.remove(widget);
      box.remove();
    }, 0);
  }
}
