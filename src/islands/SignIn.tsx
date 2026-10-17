import { useEffect, useState } from 'preact/hooks';
import { getSupabase, isConnected, isDemo } from '../lib/supabase';
import { signOut, useSession } from '../lib/session';

function nextPath(): string {
  const next = new URLSearchParams(window.location.search).get('next') ?? '/me/';
  // Only allow paths on this site, never a full address somewhere else.
  return next.startsWith('/') && !next.startsWith('//') ? next : '/me/';
}

function callbackUrl(): string {
  return `${window.location.origin}/auth/callback/?next=${encodeURIComponent(nextPath())}`;
}

export default function SignIn() {
  const { loading, session } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const problem = params.get('error_description');
    if (problem) setError(problem);
  }, []);

  if (isDemo) {
    return (
      <div class="empty">
        <p>Sign-in is switched off in this preview.</p>
      </div>
    );
  }
  if (!isConnected) {
    return (
      <div class="empty">
        <p>Sign-in switches on once the database is connected.</p>
      </div>
    );
  }
  if (loading) return <p class="muted">Checking whether you're signed in…</p>;

  if (session) {
    return (
      <div class="notice notice--success">
        <p>
          You're signed in as <strong>{session.user.email}</strong>.
        </p>
        <p>
          <a href={nextPath()}>Continue</a> or{' '}
          <button type="button" class="link-button" onClick={() => signOut()}>
            sign out
          </button>
          .
        </p>
      </div>
    );
  }

  async function sendLink(event: Event) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    const address = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) {
      setError('Enter the email address you want to use.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: problem } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: callbackUrl() },
    });
    setBusy(false);
    if (problem) {
      setError(
        /rate|limit|too many/i.test(problem.message)
          ? 'Too many sign-in emails were sent. Please wait a few minutes and try again.'
          : problem.message,
      );
      return;
    }
    setStage('code');
  }

  async function verifyCode(event: Event) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: problem } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    setBusy(false);
    if (problem) {
      setError('That code did not work. Check the newest email, or ask for a new one.');
      return;
    }
    window.location.assign(nextPath());
  }

  async function withGoogle() {
    const supabase = getSupabase();
    if (!supabase) return;
    setError(null);
    const { error: problem } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    });
    if (problem) {
      setError(
        /provider is not enabled|unsupported provider/i.test(problem.message)
          ? 'Google sign-in is not switched on yet. Please use your email for now.'
          : problem.message,
      );
    }
  }

  return (
    <div class="form">
      {stage === 'email' ? (
        <form class="form" onSubmit={sendLink} noValidate>
          <div class="field">
            <label for="email">Email address</label>
            <input
              id="email"
              type="email"
              autocomplete="email"
              inputMode="email"
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              required
            />
            <p class="hint">We'll email you a sign-in link. No password needed, and your email is never shown.</p>
          </div>
          <div>
            <button type="submit" class="btn" disabled={busy}>
              {busy ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </div>
        </form>
      ) : (
        <form class="form" onSubmit={verifyCode} noValidate>
          <div class="notice" role="status">
            <p>
              <strong>Check your inbox.</strong> We sent an email to {email.trim()}. Open the link in it on this device,
              or type the code from the email below.
            </p>
          </div>
          <div class="field">
            <label for="code">Code from the email</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autocomplete="one-time-code"
              value={code}
              onInput={(e) => setCode((e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="actions">
            <button type="submit" class="btn" disabled={busy || code.trim().length < 6}>
              {busy ? 'Checking…' : 'Sign in'}
            </button>
            <button type="button" class="btn btn--quiet" onClick={() => setStage('email')}>
              Use a different email
            </button>
          </div>
        </form>
      )}

      <div>
        <p class="muted small" style="margin-bottom:8px">Or</p>
        <button type="button" class="btn btn--quiet" onClick={withGoogle}>
          Continue with Google
        </button>
      </div>

      {error && (
        <p class="notice notice--error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
