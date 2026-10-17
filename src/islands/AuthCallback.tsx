import { useEffect, useState } from 'preact/hooks';
import { getSupabase } from '../lib/supabase';

/**
 * Landing page after an email link or Google sign-in. The Supabase client
 * finishes the sign-in from the address bar on start-up; then we move on.
 */
export default function AuthCallback() {
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawNext = params.get('next') ?? '/me/';
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/me/';
    const reported = params.get('error_description');
    if (reported) {
      setProblem(reported);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setProblem('Sign-in is not switched on yet.');
      return;
    }
    supabase.auth.getSession().then(({ data, error }) => {
      if (data.session) {
        window.location.replace(next);
      } else {
        setProblem(
          error?.message ??
            'This sign-in link has expired or was opened in a different browser. Please ask for a new one.',
        );
      }
    });
  }, []);

  if (!problem) {
    return (
      <p class="muted" aria-live="polite">
        Signing you in…
      </p>
    );
  }
  return (
    <div class="notice notice--error" role="alert">
      <p>{problem}</p>
      <p>
        <a href="/signin/">Try signing in again</a>
      </p>
    </div>
  );
}
