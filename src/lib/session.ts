/**
 * Who is signed in, for interactive parts of the page.
 */
import { useEffect, useState } from 'preact/hooks';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isDemo } from './supabase';

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
