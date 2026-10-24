/**
 * Who is signed in, for interactive parts of the page.
 */
import { useEffect, useState } from 'preact/hooks';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isDemo } from './supabase';
import { getCaptchaToken } from './captcha';

export interface SessionState {
  loading: boolean;
  session: Session | null;
  userId: string | null;
}

const DEMO_USER = '00000000-0000-0000-0000-000000000000';

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    loading: !isDemo,
    session: null,
    userId: isDemo ? DEMO_USER : null,
  });

  useEffect(() => {
    if (isDemo) return;
    const supabase = getSupabase();
    if (!supabase) {
      setState({ loading: false, session: null, userId: null });
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setState({ loading: false, session: data.session, userId: data.session?.user.id ?? null });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ loading: false, session, userId: session?.user.id ?? null });
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** Link to the sign-in page that comes back to the current page afterwards. */
export function signInHref(): string {
  if (typeof window === 'undefined') return '/signin/';
  const next = window.location.pathname + window.location.search;
  return `/signin/?next=${encodeURIComponent(next)}`;
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
}

/**
 * Make sure there is an account to post with. Nobody has to sign up: the
 * first time someone posts, follows or reports, the browser quietly gets an
 * anonymous account (after the invisible robot check). It stays on this
 * device; signing in with email later keeps it on other devices too.
 */
export async function ensureSession(): Promise<string> {
  if (isDemo) return DEMO_USER;
  const supabase = getSupabase();
  if (!supabase) throw new Error('Live features are not switched on yet.');
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const captchaToken = await getCaptchaToken();
  const { data: created, error } = await supabase.auth.signInAnonymously(captchaToken ? { options: { captchaToken } } : undefined);
  if (error || !created.user) {
    throw new Error(
      error && /rate|limit|too many/i.test(error.message)
        ? 'Too many new visitors from your network just now. Please try again in a little while.'
        : 'Could not get you ready to post. Please try again.',
    );
  }
  return created.user.id;
}
