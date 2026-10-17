/**
 * Every read and write the browser makes to the database goes through here.
 * Writes to shared data call database functions (RPC) that validate input;
 * see supabase/migrations for what each one checks.
 */
import { getSupabase, isConnected, isDemo } from './supabase';
import { demoMyResults, demoResults, demoStats } from './demo';
import type {
  Follow,
  FollowStatus,
  MyResult,
  NewResult,
  Profile,
  ProgramStats,
  ResultItem,
} from './types';

export class NotConnectedError extends Error {
  constructor() {
    super('Live features are not switched on yet.');
  }
}

/** Turn database errors into a sentence a person can act on. */
function fail(error: { message?: string } | null | undefined): never {
  const message = error?.message?.trim();
  if (!message) throw new Error('Something went wrong. Please try again.');
  if (/JWT|token|not authenticated|permission denied/i.test(message)) {
    throw new Error('Please sign in again, then retry.');
  }
  if (/Failed to fetch|NetworkError|network/i.test(message)) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  throw new Error(message);
}

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new NotConnectedError();
  return supabase;
}

export { isConnected, isDemo };

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------

export async function fetchRecentResults(cycleId: string, limit = 12): Promise<ResultItem[]> {
  if (isDemo) return demoResults().slice(0, limit);
  const { data, error } = await client()
    .from('results_feed')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) fail(error);
  return (data ?? []) as ResultItem[];
}

export async function fetchProgramResults(slug: string, cycleId: string): Promise<ResultItem[]> {
  if (isDemo) return demoResults().filter((r) => r.program_slug === slug);
  const { data, error } = await client()
    .from('results_feed')
    .select('*')
    .eq('program_slug', slug)
    .eq('cycle_id', cycleId)
    .order('decided_on', { ascending: false })
    .order('id', { ascending: false })
    .limit(200);
  if (error) fail(error);
  return (data ?? []) as ResultItem[];
}

export async function fetchResultsForPrograms(slugs: string[], cycleId: string): Promise<ResultItem[]> {
  if (slugs.length === 0) return [];
  if (isDemo) return demoResults().filter((r) => slugs.includes(r.program_slug));
  const { data, error } = await client()
    .from('results_feed')
    .select('*')
    .in('program_slug', slugs)
    .eq('cycle_id', cycleId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) fail(error);
  return (data ?? []) as ResultItem[];
}

export async function fetchStats(cycleId: string, slug?: string): Promise<ProgramStats[]> {
  if (isDemo) return demoStats().filter((s) => !slug || s.program_slug === slug);
  const { data, error } = await client().rpc('get_program_stats', {
    p_cycle_id: cycleId,
    p_program_slug: slug ?? null,
  });
  if (error) fail(error);
  return (data ?? []) as ProgramStats[];
}

// ---------------------------------------------------------------------------
// Signed-in actions
// ---------------------------------------------------------------------------

export async function submitResult(input: NewResult): Promise<number> {
  if (isDemo) return 1;
  const { data, error } = await client().rpc('submit_result', {
    p_program_slug: input.programSlug,
    p_cycle_id: input.cycleId,
    p_decision: input.decision,
    p_decided_on: input.decidedOn,
    p_channel: input.channel || null,
    p_applicant_type: input.applicantType || null,
    p_gpa_band: input.gpaBand || null,
    p_note: input.note?.trim() || null,
  });
  if (error) fail(error);
  return data as number;
}

export async function fetchMyResults(): Promise<MyResult[]> {
  if (isDemo) return demoMyResults();
  const { data, error } = await client().rpc('get_my_results');
  if (error) fail(error);
  return (data ?? []) as MyResult[];
}

export async function deleteMyResult(id: number): Promise<void> {
  if (isDemo) return;
  const { error } = await client().rpc('delete_my_result', { p_result_id: id });
  if (error) fail(error);
}

export async function fetchMyFollows(cycleId: string): Promise<Follow[]> {
  if (isDemo) {
    return [
      { program_slug: 'harvard-bbs-phd', cycle_id: cycleId, status: 'applied', email_alerts: true },
      { program_slug: 'ucsf-bms-phd', cycle_id: cycleId, status: 'applied', email_alerts: true },
      { program_slug: 'rockefeller-bioscience-phd', cycle_id: cycleId, status: 'watching', email_alerts: true },
    ];
  }
  const { data, error } = await client()
    .from('follows')
    .select('program_slug, cycle_id, status, email_alerts')
    .eq('cycle_id', cycleId);
  if (error) fail(error);
  return (data ?? []) as Follow[];
}

export async function setFollow(
  userId: string,
  slug: string,
  cycleId: string,
  status: FollowStatus,
): Promise<void> {
  if (isDemo) return;
  const { error } = await client()
    .from('follows')
    .upsert(
      { user_id: userId, program_slug: slug, cycle_id: cycleId, status },
      { onConflict: 'user_id,program_slug,cycle_id' },
    );
  if (error) fail(error);
}

export async function removeFollow(userId: string, slug: string, cycleId: string): Promise<void> {
  if (isDemo) return;
  const { error } = await client()
    .from('follows')
    .delete()
    .eq('user_id', userId)
    .eq('program_slug', slug)
    .eq('cycle_id', cycleId);
  if (error) fail(error);
}

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  if (isDemo) return { id: userId, handle: 'Steady Otter 0421', kind: null, country: null, role: 'member' };
  const { data, error } = await client()
    .from('profiles')
    .select('id, handle, kind, country, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) fail(error);
  return (data ?? null) as Profile | null;
}

export async function updateMyProfile(handle: string): Promise<void> {
  if (isDemo) return;
  const { error } = await client().rpc('update_my_profile', { p_handle: handle });
  if (error) fail(error);
}

export async function reportContent(
  targetType: 'result' | 'thread' | 'post',
  targetId: number,
  reason: string,
): Promise<void> {
  if (isDemo) return;
  const { error } = await client().rpc('report_content', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
  });
  if (error) fail(error);
}
