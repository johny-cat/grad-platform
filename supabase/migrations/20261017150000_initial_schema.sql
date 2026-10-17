-- =============================================================================
-- Initial schema
--
-- How to apply: Supabase dashboard -> SQL Editor -> paste this whole file -> Run.
-- (Or, later, automatically with the Supabase CLI: `supabase db push`.)
--
-- Rules this schema follows (see docs/SECURITY.md):
--   1. Row-level security (RLS) is on for every table.
--   2. The public can only read what is meant to be public.
--   3. Writes to shared data go through functions (RPC) that validate input
--      and enforce rate limits. Private data (follows) uses RLS directly.
--   4. Results are anonymous. Who reported what is kept in a separate table
--      that nobody but the reporter can read.
--   5. Never edit this file after it has been applied. Make a new migration.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- Admissions cycles, e.g. 'fall-2027' = applications for Fall 2027 entry.
-- -----------------------------------------------------------------------------

create table public.cycles (
  id          text primary key
              check (id ~ '^(fall|spring|summer|winter)-[0-9]{4}$'),
  label       text not null check (char_length(label) between 3 and 60),
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.cycles is
  'Admissions cycles. Exactly one is current. Seeded below; change with a migration.';

-- Only one cycle can be the current one.
create unique index cycles_only_one_current on public.cycles (is_current) where is_current;


-- -----------------------------------------------------------------------------
-- Programs: a mirror of the curated catalog that lives in the code repository
-- (src/data/programs/*.json). Rows are written by the generated file
-- supabase/seed/catalog.sql, never by users. Full program details (deadlines,
-- requirements) stay in the repository; this table exists so user data can
-- point at real programs.
-- -----------------------------------------------------------------------------

create table public.programs (
  slug         text primary key
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  name         text not null check (char_length(name) between 2 and 200),
  institution  text not null check (char_length(institution) between 2 and 200),
  country      text not null check (country ~ '^[A-Z]{2}$'),
  field        text not null check (field ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  degree       text not null check (degree in ('phd', 'masters', 'other')),
  active       boolean not null default true,
  updated_at   timestamptz not null default now()
);

comment on table public.programs is
  'Mirror of the program catalog in the repository. Written only by supabase/seed/catalog.sql.';


-- -----------------------------------------------------------------------------
-- Profiles: one per signed-in user. Private. A public handle (e.g.
-- "Hopeful Heron 0421") is copied onto posts so profiles never need to be
-- exposed. Kept deliberately small; public profiles for student/lab matching
-- will be a separate, opt-in table later.
-- -----------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  handle      text not null
              check (handle ~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{1,30}[A-Za-z0-9]$'),
  kind        text check (kind in ('applicant', 'student', 'faculty', 'lab', 'other')),
  country     text check (country ~ '^[A-Z]{2}$'),
  role        text not null default 'member'
              check (role in ('member', 'moderator', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.profiles.role is
  'Site role. Users cannot change this themselves; set it with SQL as the database owner.';

create unique index profiles_handle_unique on public.profiles (lower(handle));

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- Friendly random handle such as "Steady Otter 4821".
create function public.generate_handle()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  adjectives text[] := array[
    'Hopeful','Steady','Curious','Brave','Patient','Bright','Calm','Bold',
    'Kind','Quiet','Gentle','Eager','Honest','Lucky','Swift','Warm',
    'Wise','Daring','Humble','Sunny'];
  nouns text[] := array[
    'Heron','Falcon','Otter','Cedar','Comet','Maple','River','Lynx',
    'Robin','Willow','Sparrow','Pine','Harbor','Meadow','Beacon','Lantern',
    'Orchid','Pebble','Summit','Tide'];
  candidate text;
begin
  loop
    candidate := adjectives[1 + floor(random() * array_length(adjectives, 1))::int]
      || ' ' || nouns[1 + floor(random() * array_length(nouns, 1))::int]
      || ' ' || lpad(floor(random() * 10000)::int::text, 4, '0');
    exit when not exists (
      select 1 from public.profiles p where lower(p.handle) = lower(candidate)
    );
  end loop;
  return candidate;
end;
$$;


-- Create a profile automatically when someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, handle)
  values (new.id, public.generate_handle())
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Is the current user a moderator or admin?
create function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('moderator', 'admin')
  );
$$;


-- -----------------------------------------------------------------------------
-- Results: anonymous, public reports such as "interview invite on 12 Jan".
-- -----------------------------------------------------------------------------

create table public.results (
  id              bigint generated always as identity primary key,
  program_slug    text not null references public.programs (slug) on update cascade,
  cycle_id        text not null references public.cycles (id),
  decision        text not null
                  check (decision in ('interview', 'accepted', 'waitlisted', 'rejected')),
  decided_on      date not null check (decided_on >= date '2020-01-01'),
  channel         text check (channel in ('email', 'portal', 'phone', 'other')),
  applicant_type  text check (applicant_type in ('international', 'domestic')),
  gpa_band        text check (gpa_band in ('below-3.0', '3.0-3.49', '3.5-3.79', '3.8-4.0')),
  note            text check (char_length(note) <= 500),
  hidden          boolean not null default false,
  created_at      timestamptz not null default now()
);

comment on table public.results is
  'Anonymous decision reports. Public when not hidden. Insert only through submit_result().';
comment on column public.results.gpa_band is
  'Optional, on a 4.0 scale. Used later by the Comeback Track filter.';

create index results_program_cycle_idx
  on public.results (program_slug, cycle_id, decided_on desc, id desc);
create index results_recent_idx
  on public.results (created_at desc) where not hidden;
create index results_matching_idx
  on public.results (program_slug, cycle_id, decision, decided_on);


-- Who reported which result. Private: only the reporter can read their rows.
create table public.result_owners (
  result_id     bigint primary key references public.results (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  program_slug  text not null,
  cycle_id      text not null,
  decision      text not null,
  created_at    timestamptz not null default now(),
  unique (user_id, program_slug, cycle_id, decision)
);

create index result_owners_user_idx on public.result_owners (user_id, created_at desc);

-- When an owner row goes (account deleted), the result goes too.
create function public.delete_orphaned_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.results r where r.id = old.result_id;
  return old;
end;
$$;

create trigger result_owners_delete_result
  after delete on public.result_owners
  for each row execute function public.delete_orphaned_result();


-- -----------------------------------------------------------------------------
-- Follows: "my programs". Private. status 'applied' feeds the public count
-- "N users here applied" (counts only, never who).
-- -----------------------------------------------------------------------------

create table public.follows (
  user_id       uuid not null references auth.users (id) on delete cascade,
  program_slug  text not null references public.programs (slug)
                on update cascade on delete cascade,
  cycle_id      text not null references public.cycles (id),
  status        text not null default 'watching' check (status in ('watching', 'applied')),
  email_alerts  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, program_slug, cycle_id)
);

create index follows_program_idx on public.follows (program_slug, cycle_id, status);

create trigger follows_set_updated_at
  before update on public.follows
  for each row execute function public.set_updated_at();

-- At most 100 followed programs per user per cycle.
create function public.enforce_follow_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.follows f
      where f.user_id = new.user_id and f.cycle_id = new.cycle_id) >= 100 then
    raise exception 'You can follow up to 100 programs per cycle.';
  end if;
  return new;
end;
$$;

create trigger follows_limit
  before insert on public.follows
  for each row execute function public.enforce_follow_limit();


-- -----------------------------------------------------------------------------
-- Announcements: official updates, posted by moderators with a source link.
-- program_slug null = site-wide announcement.
-- -----------------------------------------------------------------------------

create table public.announcements (
  id            bigint generated always as identity primary key,
  program_slug  text references public.programs (slug) on update cascade on delete cascade,
  cycle_id      text references public.cycles (id),
  title         text not null check (char_length(btrim(title)) between 3 and 160),
  body          text check (char_length(body) <= 2000),
  source_url    text not null check (source_url ~ '^https://'),
  published_at  timestamptz not null default now(),
  created_by    uuid references auth.users (id) on delete set null,
  hidden        boolean not null default false
);

create index announcements_program_idx
  on public.announcements (program_slug, published_at desc) where not hidden;


-- -----------------------------------------------------------------------------
-- Discussion: threads per program or per field, and their posts.
-- -----------------------------------------------------------------------------

create table public.threads (
  id             bigint generated always as identity primary key,
  program_slug   text references public.programs (slug) on update cascade on delete set null,
  field          text check (field ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  cycle_id       text references public.cycles (id),
  title          text not null check (char_length(btrim(title)) between 3 and 150),
  author_id      uuid references auth.users (id) on delete set null,
  author_handle  text not null,
  post_count     integer not null default 0,
  last_post_at   timestamptz not null default now(),
  locked         boolean not null default false,
  hidden         boolean not null default false,
  created_at     timestamptz not null default now(),
  check (program_slug is not null or field is not null)
);

create index threads_program_idx on public.threads (program_slug, last_post_at desc) where not hidden;
create index threads_field_idx on public.threads (field, last_post_at desc) where not hidden;
create index threads_author_idx on public.threads (author_id, created_at desc);

create table public.posts (
  id             bigint generated always as identity primary key,
  thread_id      bigint not null references public.threads (id) on delete cascade,
  author_id      uuid references auth.users (id) on delete set null,
  author_handle  text not null,
  body           text not null check (char_length(btrim(body)) between 1 and 5000),
  hidden         boolean not null default false,
  created_at     timestamptz not null default now(),
  edited_at      timestamptz
);

create index posts_thread_idx on public.posts (thread_id, created_at);
create index posts_author_idx on public.posts (author_id, created_at desc);

-- Keep thread counters current.
create function public.bump_thread_on_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.threads t
     set post_count = t.post_count + 1,
         last_post_at = new.created_at
   where t.id = new.thread_id;
  return new;
end;
$$;

create trigger posts_bump_thread
  after insert on public.posts
  for each row execute function public.bump_thread_on_post();


-- -----------------------------------------------------------------------------
-- Moderation: anyone signed in can flag content. Three different people
-- flagging the same result, thread or post hides it until a moderator looks.
-- -----------------------------------------------------------------------------

create table public.content_reports (
  id           bigint generated always as identity primary key,
  reporter_id  uuid references auth.users (id) on delete set null,
  target_type  text not null check (target_type in ('result', 'thread', 'post', 'announcement')),
  target_id    bigint not null,
  reason       text not null check (reason in ('fake', 'spam', 'abusive', 'personal-info', 'other')),
  details      text check (char_length(details) <= 500),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references auth.users (id) on delete set null,
  unique (reporter_id, target_type, target_id)
);

create index content_reports_open_idx
  on public.content_reports (target_type, target_id) where resolved_at is null;


-- =============================================================================
-- Public read paths
-- =============================================================================

-- Results with program names and how many other people reported the same
-- decision for the same program within two days ("matching_reports").
create view public.results_feed
with (security_invoker = on)
as
select
  r.id,
  r.program_slug,
  p.name        as program_name,
  p.institution,
  p.country,
  p.field,
  r.cycle_id,
  r.decision,
  r.decided_on,
  r.channel,
  r.applicant_type,
  r.gpa_band,
  r.note,
  r.created_at,
  (
    select count(*)::int
    from public.results r2
    where r2.program_slug = r.program_slug
      and r2.cycle_id = r.cycle_id
      and r2.decision = r.decision
      and r2.id <> r.id
      and not r2.hidden
      and r2.decided_on between r.decided_on - 2 and r.decided_on + 2
  ) as matching_reports
from public.results r
join public.programs p on p.slug = r.program_slug
where not r.hidden;

comment on view public.results_feed is
  'Public results feed. Runs with the caller''s permissions, so hidden rows never appear.';


-- Counts per program for a cycle: how many users applied/follow, results by
-- decision, first interview and acceptance dates. Counts only, never people.
create function public.get_program_stats(p_cycle_id text, p_program_slug text default null)
returns table (
  program_slug        text,
  applied_count       integer,
  following_count     integer,
  interview_count     integer,
  accepted_count      integer,
  waitlisted_count    integer,
  rejected_count      integer,
  first_interview_on  date,
  first_accepted_on   date,
  last_report_at      timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with f as (
    select fo.program_slug as slug,
           count(*) filter (where fo.status = 'applied')::int as applied,
           count(*)::int as following
    from public.follows fo
    where fo.cycle_id = p_cycle_id
      and (p_program_slug is null or fo.program_slug = p_program_slug)
    group by fo.program_slug
  ),
  r as (
    select re.program_slug as slug,
           count(*) filter (where re.decision = 'interview')::int  as interviews,
           count(*) filter (where re.decision = 'accepted')::int   as accepted,
           count(*) filter (where re.decision = 'waitlisted')::int as waitlisted,
           count(*) filter (where re.decision = 'rejected')::int   as rejected,
           min(re.decided_on) filter (where re.decision = 'interview') as first_interview,
           min(re.decided_on) filter (where re.decision = 'accepted')  as first_accepted,
           max(re.created_at) as last_report
    from public.results re
    where re.cycle_id = p_cycle_id
      and not re.hidden
      and (p_program_slug is null or re.program_slug = p_program_slug)
    group by re.program_slug
  )
  select coalesce(f.slug, r.slug),
         coalesce(f.applied, 0),
         coalesce(f.following, 0),
         coalesce(r.interviews, 0),
         coalesce(r.accepted, 0),
         coalesce(r.waitlisted, 0),
         coalesce(r.rejected, 0),
         r.first_interview,
         r.first_accepted,
         r.last_report
  from f
  full outer join r on r.slug = f.slug;
$$;


-- =============================================================================
-- Write functions (RPC). Each one checks who is calling and validates input.
-- =============================================================================

-- Report a result.
create function public.submit_result(
  p_program_slug    text,
  p_cycle_id        text,
  p_decision        text,
  p_decided_on      date,
  p_channel         text default null,
  p_applicant_type  text default null,
  p_gpa_band        text default null,
  p_note            text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_id   bigint;
begin
  if v_user is null then
    raise exception 'Please sign in to report a result.';
  end if;

  if not exists (select 1 from public.programs p where p.slug = p_program_slug and p.active) then
    raise exception 'Unknown program.';
  end if;

  if not exists (select 1 from public.cycles c where c.id = p_cycle_id) then
    raise exception 'Unknown admissions cycle.';
  end if;

  if p_decided_on is null
     or p_decided_on > (now() at time zone 'utc')::date + 1
     or p_decided_on < date '2020-01-01' then
    raise exception 'Please choose the date you heard back. It cannot be in the future.';
  end if;

  if (select count(*) from public.result_owners o
      where o.user_id = v_user and o.created_at > now() - interval '24 hours') >= 30 then
    raise exception 'You have reported many results today. Please try again tomorrow.';
  end if;

  if exists (select 1 from public.result_owners o
             where o.user_id = v_user
               and o.program_slug = p_program_slug
               and o.cycle_id = p_cycle_id
               and o.decision = p_decision) then
    raise exception 'You already reported this decision for this program.';
  end if;

  insert into public.results
    (program_slug, cycle_id, decision, decided_on, channel, applicant_type, gpa_band, note)
  values
    (p_program_slug, p_cycle_id, p_decision, p_decided_on,
     nullif(p_channel, ''), nullif(p_applicant_type, ''), nullif(p_gpa_band, ''),
     nullif(btrim(p_note), ''))
  returning id into v_id;

  insert into public.result_owners (result_id, user_id, program_slug, cycle_id, decision)
  values (v_id, v_user, p_program_slug, p_cycle_id, p_decision);

  return v_id;
end;
$$;


-- Delete one of my own results.
create function public.delete_my_result(p_result_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Please sign in.';
  end if;

  delete from public.results r
   using public.result_owners o
   where r.id = p_result_id
     and o.result_id = r.id
     and o.user_id = auth.uid();

  if not found then
    raise exception 'Result not found.';
  end if;
end;
$$;


-- My own results, including any hidden by moderators.
create function public.get_my_results()
returns table (
  id              bigint,
  program_slug    text,
  program_name    text,
  institution     text,
  cycle_id        text,
  decision        text,
  decided_on      date,
  channel         text,
  applicant_type  text,
  gpa_band        text,
  note            text,
  hidden          boolean,
  created_at      timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.program_slug, p.name, p.institution, r.cycle_id, r.decision,
         r.decided_on, r.channel, r.applicant_type, r.gpa_band, r.note,
         r.hidden, r.created_at
  from public.result_owners o
  join public.results r on r.id = o.result_id
  join public.programs p on p.slug = r.program_slug
  where o.user_id = auth.uid()
  order by r.created_at desc;
$$;


-- Change my handle, who I am, or my country. Role can never be changed here.
create function public.update_my_profile(
  p_handle   text default null,
  p_kind     text default null,
  p_country  text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Please sign in.';
  end if;

  update public.profiles p
     set handle  = coalesce(nullif(btrim(p_handle), ''), p.handle),
         kind    = case when p_kind = '' then null else coalesce(p_kind, p.kind) end,
         country = case when p_country = '' then null else coalesce(upper(p_country), p.country) end
   where p.id = auth.uid();
exception
  when unique_violation then
    raise exception 'That name is already taken. Please choose another.';
  when check_violation then
    raise exception 'That value is not allowed. Names use 3 to 32 letters, numbers or spaces.';
end;
$$;


-- Start a discussion thread (with its first post).
create function public.create_thread(
  p_title         text,
  p_body          text,
  p_program_slug  text default null,
  p_field         text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user    uuid := auth.uid();
  v_handle  text;
  v_thread  bigint;
begin
  if v_user is null then
    raise exception 'Please sign in to start a discussion.';
  end if;

  if p_program_slug is null and p_field is null then
    raise exception 'A discussion needs a program or a field.';
  end if;

  if p_program_slug is not null
     and not exists (select 1 from public.programs p where p.slug = p_program_slug and p.active) then
    raise exception 'Unknown program.';
  end if;

  if (select count(*) from public.threads t
      where t.author_id = v_user and t.created_at > now() - interval '24 hours') >= 5 then
    raise exception 'You can start up to 5 discussions a day.';
  end if;

  select pr.handle into v_handle from public.profiles pr where pr.id = v_user;

  insert into public.threads (program_slug, field, cycle_id, title, author_id, author_handle)
  values (
    p_program_slug,
    p_field,
    (select c.id from public.cycles c where c.is_current),
    btrim(p_title),
    v_user,
    v_handle
  )
  returning id into v_thread;

  insert into public.posts (thread_id, author_id, author_handle, body)
  values (v_thread, v_user, v_handle, btrim(p_body));

  return v_thread;
end;
$$;


-- Reply in a thread.
create function public.add_post(p_thread_id bigint, p_body text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user    uuid := auth.uid();
  v_handle  text;
  v_post    bigint;
begin
  if v_user is null then
    raise exception 'Please sign in to reply.';
  end if;

  if not exists (select 1 from public.threads t
                 where t.id = p_thread_id and not t.hidden and not t.locked) then
    raise exception 'This discussion is closed or no longer available.';
  end if;

  if (select count(*) from public.posts po
      where po.author_id = v_user and po.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'You are posting very quickly. Please wait a little.';
  end if;

  select pr.handle into v_handle from public.profiles pr where pr.id = v_user;

  insert into public.posts (thread_id, author_id, author_handle, body)
  values (p_thread_id, v_user, v_handle, btrim(p_body))
  returning id into v_post;

  return v_post;
end;
$$;


-- Edit my own post within 24 hours.
create function public.edit_my_post(p_post_id bigint, p_body text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Please sign in.';
  end if;

  update public.posts po
     set body = btrim(p_body),
         edited_at = now()
   where po.id = p_post_id
     and po.author_id = auth.uid()
     and not po.hidden
     and po.created_at > now() - interval '24 hours';

  if not found then
    raise exception 'You can only edit your own posts, within 24 hours.';
  end if;
end;
$$;


-- Flag content. Three different people flagging the same item hides it.
create function public.report_content(
  p_target_type  text,
  p_target_id    bigint,
  p_reason       text,
  p_details      text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user   uuid := auth.uid();
  v_flags  int;
begin
  if v_user is null then
    raise exception 'Please sign in to report content.';
  end if;

  if (p_target_type = 'result'       and not exists (select 1 from public.results x where x.id = p_target_id))
  or (p_target_type = 'thread'       and not exists (select 1 from public.threads x where x.id = p_target_id))
  or (p_target_type = 'post'         and not exists (select 1 from public.posts x where x.id = p_target_id))
  or (p_target_type = 'announcement' and not exists (select 1 from public.announcements x where x.id = p_target_id))
  or p_target_type not in ('result', 'thread', 'post', 'announcement') then
    raise exception 'Nothing to report.';
  end if;

  if (select count(*) from public.content_reports cr
      where cr.reporter_id = v_user and cr.created_at > now() - interval '24 hours') >= 20 then
    raise exception 'You have sent many reports today. Thank you; please try again tomorrow.';
  end if;

  insert into public.content_reports (reporter_id, target_type, target_id, reason, details)
  values (v_user, p_target_type, p_target_id, p_reason, nullif(btrim(p_details), ''))
  on conflict (reporter_id, target_type, target_id) do nothing;

  select count(distinct cr.reporter_id) into v_flags
  from public.content_reports cr
  where cr.target_type = p_target_type
    and cr.target_id = p_target_id
    and cr.resolved_at is null;

  if v_flags >= 3 then
    if p_target_type = 'result' then
      update public.results set hidden = true where id = p_target_id;
    elsif p_target_type = 'thread' then
      update public.threads set hidden = true where id = p_target_id;
    elsif p_target_type = 'post' then
      update public.posts set hidden = true where id = p_target_id;
    end if;
  end if;
end;
$$;


-- Moderators: hide or restore content, closing its open reports.
create function public.moderate_content(
  p_target_type  text,
  p_target_id    bigint,
  p_hidden       boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can do this.';
  end if;

  if p_target_type = 'result' then
    update public.results set hidden = p_hidden where id = p_target_id;
  elsif p_target_type = 'thread' then
    update public.threads set hidden = p_hidden where id = p_target_id;
  elsif p_target_type = 'post' then
    update public.posts set hidden = p_hidden where id = p_target_id;
  elsif p_target_type = 'announcement' then
    update public.announcements set hidden = p_hidden where id = p_target_id;
  else
    raise exception 'Unknown content type.';
  end if;

  if not found then
    raise exception 'Content not found.';
  end if;

  update public.content_reports
     set resolved_at = now(), resolved_by = auth.uid()
   where target_type = p_target_type
     and target_id = p_target_id
     and resolved_at is null;
end;
$$;


-- Moderators: post an official announcement (always with a source link).
create function public.post_announcement(
  p_title         text,
  p_source_url    text,
  p_body          text default null,
  p_program_slug  text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can post announcements.';
  end if;

  insert into public.announcements (program_slug, cycle_id, title, body, source_url, created_by)
  values (
    p_program_slug,
    (select c.id from public.cycles c where c.is_current),
    btrim(p_title),
    nullif(btrim(p_body), ''),
    btrim(p_source_url),
    auth.uid()
  )
  returning id into v_id;

  return v_id;
end;
$$;


-- =============================================================================
-- Row-level security
-- =============================================================================

alter table public.cycles          enable row level security;
alter table public.programs        enable row level security;
alter table public.profiles        enable row level security;
alter table public.results         enable row level security;
alter table public.result_owners   enable row level security;
alter table public.follows         enable row level security;
alter table public.announcements   enable row level security;
alter table public.threads         enable row level security;
alter table public.posts           enable row level security;
alter table public.content_reports enable row level security;

-- Public reference data.
create policy "Anyone can read cycles"
  on public.cycles for select to anon, authenticated using (true);

create policy "Anyone can read programs"
  on public.programs for select to anon, authenticated using (true);

-- Public user content (only what has not been hidden).
create policy "Anyone can read visible results"
  on public.results for select to anon, authenticated using (not hidden);

create policy "Anyone can read visible announcements"
  on public.announcements for select to anon, authenticated using (not hidden);

create policy "Anyone can read visible threads"
  on public.threads for select to anon, authenticated using (not hidden);

create policy "Anyone can read visible posts"
  on public.posts for select to anon, authenticated using (not hidden);

-- Private rows: only the owner.
create policy "Users read their own profile"
  on public.profiles for select to authenticated using (id = (select auth.uid()));

create policy "Users read their own result ownership"
  on public.result_owners for select to authenticated using (user_id = (select auth.uid()));

create policy "Users read their own reports"
  on public.content_reports for select to authenticated using (reporter_id = (select auth.uid()));

create policy "Users read their own follows"
  on public.follows for select to authenticated using (user_id = (select auth.uid()));

create policy "Users add their own follows"
  on public.follows for insert to authenticated with check (user_id = (select auth.uid()));

create policy "Users change their own follows"
  on public.follows for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Users remove their own follows"
  on public.follows for delete to authenticated using (user_id = (select auth.uid()));


-- =============================================================================
-- Privileges. Supabase grants broad defaults to the API roles; tighten them so
-- that even a missing policy can never open a table for writing.
-- =============================================================================

revoke all on table
  public.cycles, public.programs, public.profiles, public.results,
  public.result_owners, public.follows, public.announcements,
  public.threads, public.posts, public.content_reports, public.results_feed
from anon, authenticated;

grant select on table
  public.cycles, public.programs, public.results, public.announcements,
  public.threads, public.posts, public.results_feed
to anon, authenticated;

grant select on table public.profiles, public.result_owners, public.content_reports to authenticated;
grant select, insert, update, delete on table public.follows to authenticated;

-- Functions: nobody by default, then only what each role needs.
revoke execute on function
  public.set_updated_at(),
  public.generate_handle(),
  public.handle_new_user(),
  public.is_moderator(),
  public.delete_orphaned_result(),
  public.enforce_follow_limit(),
  public.bump_thread_on_post(),
  public.get_program_stats(text, text),
  public.submit_result(text, text, text, date, text, text, text, text),
  public.delete_my_result(bigint),
  public.get_my_results(),
  public.update_my_profile(text, text, text),
  public.create_thread(text, text, text, text),
  public.add_post(bigint, text),
  public.edit_my_post(bigint, text),
  public.report_content(text, bigint, text, text),
  public.moderate_content(text, bigint, boolean),
  public.post_announcement(text, text, text, text)
from public, anon, authenticated;

grant execute on function public.get_program_stats(text, text) to anon, authenticated;

grant execute on function
  public.is_moderator(),
  public.submit_result(text, text, text, date, text, text, text, text),
  public.delete_my_result(bigint),
  public.get_my_results(),
  public.update_my_profile(text, text, text),
  public.create_thread(text, text, text, text),
  public.add_post(bigint, text),
  public.edit_my_post(bigint, text),
  public.report_content(text, bigint, text, text),
  public.moderate_content(text, bigint, boolean),
  public.post_announcement(text, text, text, text)
to authenticated;


-- =============================================================================
-- Seed: admissions cycles.
-- =============================================================================

insert into public.cycles (id, label, is_current) values
  ('fall-2026', 'Fall 2026 entry', false),
  ('fall-2027', 'Fall 2027 entry', true);
