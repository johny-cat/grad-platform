import { useSession } from '../lib/session';
import { isDemo } from '../lib/supabase';

/** Header link: "Sign in", or "My programs" once signed in. */
export default function AuthNav() {
  const { session } = useSession();
  const signedIn = isDemo || Boolean(session);
  return signedIn ? <a href="/me/">My programs</a> : <a href="/signin/">Sign in</a>;
}
