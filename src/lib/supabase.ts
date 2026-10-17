/**
 * The Supabase client, created once per page and only in the browser.
 *
 * The URL and publishable key are public by design; row-level security in
 * the database decides what anyone can read or write (docs/SECURITY.md).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config';

const url = import.meta.env.PUBLIC_SUPABASE_URL || SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY;

/** Preview builds made with PUBLIC_DEMO=1 show labelled sample data. */
export const isDemo = import.meta.env.PUBLIC_DEMO === '1';

/** True when live features (results, sign-in, follows) can work. */
export const isConnected = Boolean(url && key) && !isDemo;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isConnected || typeof window === 'undefined') return null;
  client ??= createClient(url, key, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
