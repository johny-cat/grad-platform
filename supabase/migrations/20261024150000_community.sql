-- Community ("Not Yet"): discussion spaces, private author ids, blocking, and
-- a moderator review list. Builds on the threads, posts and content_reports
-- tables from the initial schema.

-- -----------------------------------------------------------------------------
-- Spaces: a thread belongs to a community space, a program, or a field.
-- -----------------------------------------------------------------------------

alter table public.threads
  add column space text check (space in ('general', 'ask', 'lift-up', 'results'));

alter table public.threads drop constraint threads_check;
alter table public.threads
  add constraint threads_place_check
  check (program_slug is not null or field is not null or space is not null);

create index threads_space_idx on public.threads (space, last_post_at desc) where not hidden;

comment on column public.threads.space is
  'Community space: general, ask (questions and answers), lift-up (encouragement), results (has anyone heard).';


-- -----------------------------------------------------------------------------
-- Blocked members can read but not post or reply.
-- -----------------------------------------------------------------------------

alter table public.profiles add column blocked boolean not null default false;

comment on column public.profiles.blocked is
  'Set by moderators (set_member_blocked). Blocked members can read but not post or reply.';

create function public.is_blocked()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.blocked from public.profiles p where p.id = auth.uid()), false);
$$;


-- -----------------------------------------------------------------------------
-- Who wrote a post stays private: the public sees the nickname only.
-- -----------------------------------------------------------------------------

revoke select on table public.threads, public.posts from anon, authenticated;

grant select (id, program_slug, field, space, cycle_id, title, author_handle, post_count,
              last_post_at, locked, hidden, created_at)
  on table public.threads to anon, authenticated;

grant select (id, thread_id, author_handle, body, hidden, created_at, edited_at)
  on table public.posts to anon, authenticated;

-- Visible posts, plus whether the person reading wrote them (to offer Edit).
create view public.community_posts
as
select
  po.id,
  po.thread_id,
  po.author_handle,
  po.body,
  po.created_at,
  po.edited_at,
  coalesce(po.author_id = auth.uid(), false) as is_mine
from public.posts po
join public.threads t on t.id = po.thread_id
where not po.hidden and not t.hidden;

comment on view public.community_posts is
  'Public posts of visible threads. Shows the author''s nickname and is_mine, never the account id.';

revoke all on table public.community_posts from anon, authenticated;
grant select on table public.community_posts to anon, authenticated;


-- -----------------------------------------------------------------------------
-- Start a thread: now also in a community space. Blocked members can't.
-- -----------------------------------------------------------------------------

drop function public.create_thread(text, text, text, text);

create function public.create_thread(
  p_title         text,
  p_body          text,
  p_program_slug  text default null,
  p_field         text default null,
  p_space         text default null
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

  if public.is_blocked() then
    raise exception 'Your account can''t post right now.';
  end if;

  if p_program_slug is null and p_field is null and p_space is null then
    raise exception 'A discussion needs a program or a field.';
  end if;

  if p_space is not null and p_space not in ('general', 'ask', 'lift-up', 'results') then
    raise exception 'Unknown space.';
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

  insert into public.threads (program_slug, field, space, cycle_id, title, author_id, author_handle)
  values (
    p_program_slug,
    p_field,
    p_space,
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


-- Reply: same as before, but blocked members can't.
create or replace function public.add_post(p_thread_id bigint, p_body text)
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

  if public.is_blocked() then
    raise exception 'Your account can''t post right now.';
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


-- -----------------------------------------------------------------------------
-- Moderators: what's been reported, and blocking a member by nickname.
-- -----------------------------------------------------------------------------

create function public.list_reported_content()
returns table (
  target_type    text,
  target_id      bigint,
  thread_id      bigint,
  title          text,
  body           text,
  author_handle  text,
  hidden         boolean,
  report_count   int,
  reasons        text,
  first_reported timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can do this.';
  end if;

  return query
  select
    cr.target_type,
    cr.target_id,
    coalesce(po.thread_id, th.id),
    coalesce(th.title, pt.title),
    coalesce(po.body, (select p1.body from public.posts p1 where p1.thread_id = th.id order by p1.id limit 1)),
    coalesce(po.author_handle, th.author_handle),
    coalesce(po.hidden, th.hidden),
    count(distinct cr.reporter_id)::int,
    string_agg(distinct cr.reason, ', '),
    min(cr.created_at)
  from public.content_reports cr
  left join public.posts po on cr.target_type = 'post' and po.id = cr.target_id
  left join public.threads pt on pt.id = po.thread_id
  left join public.threads th on cr.target_type = 'thread' and th.id = cr.target_id
  where cr.resolved_at is null
    and cr.target_type in ('post', 'thread')
  group by cr.target_type, cr.target_id, po.thread_id, th.id, th.title, pt.title,
           po.body, po.author_handle, th.author_handle, po.hidden, th.hidden
  order by min(cr.created_at);
end;
$$;


create function public.set_member_blocked(p_handle text, p_blocked boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can do this.';
  end if;

  update public.profiles p
     set blocked = p_blocked
   where lower(p.handle) = lower(btrim(p_handle))
     and p.role = 'member';

  if not found then
    raise exception 'No member with that name.';
  end if;
end;
$$;


-- -----------------------------------------------------------------------------
-- Privileges
-- -----------------------------------------------------------------------------

revoke execute on function
  public.is_blocked(),
  public.create_thread(text, text, text, text, text),
  public.list_reported_content(),
  public.set_member_blocked(text, boolean)
from public, anon, authenticated;

grant execute on function
  public.is_blocked(),
  public.create_thread(text, text, text, text, text),
  public.list_reported_content(),
  public.set_member_blocked(text, boolean)
to authenticated;
