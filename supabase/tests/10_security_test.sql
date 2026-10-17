-- Security and behaviour tests for the database.
-- Run with: npm run test:db   (needs local Postgres binaries; see scripts/test-db.sh)
-- Every check raises "TEST FAILED: ..." if something is wrong.

\set ON_ERROR_STOP on
\set QUIET on
\set user_a  '''00000000-0000-0000-0000-00000000000a'''
\set user_b  '''00000000-0000-0000-0000-00000000000b'''
\set user_c  '''00000000-0000-0000-0000-00000000000c'''
\set user_d  '''00000000-0000-0000-0000-00000000000d'''
\set user_m  '''00000000-0000-0000-0000-0000000000ad'''

-- ---------------------------------------------------------------------------
-- Test helpers
-- ---------------------------------------------------------------------------
create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.expect(cond boolean, msg text)
returns void language plpgsql as $$
begin
  if cond is distinct from true then
    raise exception 'TEST FAILED: %', msg;
  end if;
end $$;

create function tests.expect_error(sql text, pattern text default null)
returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    if pattern is not null and sqlerrm !~* pattern then
      raise exception 'TEST FAILED: "%" raised "%" but expected /%/', sql, sqlerrm, pattern;
    end if;
    return;
  end;
  raise exception 'TEST FAILED: expected an error from: %', sql;
end $$;

-- Act as a signed-in user, or as an anonymous visitor.
create function tests.as_user(uid uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated')::text, false);
end $$;

create function tests.as_anon()
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '', false);
end $$;

grant execute on all functions in schema tests to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Fixtures (as the database owner)
-- ---------------------------------------------------------------------------
insert into public.programs (slug, name, institution, country, field, degree) values
  ('test-alpha-phd', 'Alpha PhD', 'Alpha University', 'US', 'biology', 'phd'),
  ('test-beta-phd',  'Beta PhD',  'Beta University',  'GB', 'biology', 'phd'),
  ('test-gone-phd',  'Gone PhD',  'Gone University',  'US', 'biology', 'phd');
update public.programs set active = false where slug = 'test-gone-phd';

insert into public.programs (slug, name, institution, country, field, degree)
select 'test-bulk-' || i, 'Bulk ' || i, 'Bulk University', 'US', 'biology', 'phd'
from generate_series(1, 101) i;

insert into auth.users (id, email) values
  (:user_a, 'a@test.invalid'),
  (:user_b, 'b@test.invalid'),
  (:user_c, 'c@test.invalid'),
  (:user_d, 'd@test.invalid'),
  (:user_m, 'mod@test.invalid');

select tests.expect((select count(*) from public.profiles) = 5,
  'a profile is created for every new user');
select tests.expect((select bool_and(handle ~ '^[A-Z][a-z]+ [A-Z][a-z]+ [0-9]{4}$') from public.profiles),
  'new handles look like "Steady Otter 0421"');
select tests.expect((select bool_and(role = 'member') from public.profiles),
  'new users are plain members');

update public.profiles set role = 'moderator' where id = :user_m;

-- ---------------------------------------------------------------------------
-- Anonymous visitor
-- ---------------------------------------------------------------------------
select tests.as_anon();
set role anon;

select tests.expect((select count(*) from public.programs where slug like 'test-%') = 104,
  'anon can read programs');
select tests.expect((select count(*) from public.cycles where is_current) = 1,
  'exactly one current cycle');
select tests.expect_error($$insert into public.results (program_slug, cycle_id, decision, decided_on)
  values ('test-alpha-phd', 'fall-2027', 'accepted', current_date)$$, 'permission denied');
select tests.expect_error($$select public.submit_result('test-alpha-phd', 'fall-2027', 'accepted', current_date)$$,
  'permission denied');
select tests.expect_error($$select * from public.get_my_results()$$, 'permission denied');
select tests.expect_error($$select public.is_moderator()$$, 'permission denied');
select tests.expect_error($$select * from public.profiles$$, 'permission denied');
select tests.expect_error($$select * from public.result_owners$$, 'permission denied');
select tests.expect_error($$select * from public.follows$$, 'permission denied');
select tests.expect_error($$select * from public.content_reports$$, 'permission denied');
select tests.expect_error($$update public.programs set name = 'Hacked'$$, 'permission denied');
select tests.expect_error($$delete from public.cycles$$, 'permission denied');
select tests.expect_error($$select public.generate_handle()$$, 'permission denied');
select tests.expect((select count(*) from public.get_program_stats('fall-2027')) = 0,
  'stats are empty at the start');

reset role;

-- ---------------------------------------------------------------------------
-- User A reports a result and follows a program
-- ---------------------------------------------------------------------------
select tests.as_user(:user_a);
set role authenticated;

select tests.expect(public.submit_result('test-alpha-phd', 'fall-2027', 'interview', current_date - 3,
  'email', 'international', '3.0-3.49', 'Zoom invite for late January') > 0,
  'A can report a result');
select tests.expect_error($$select public.submit_result('test-alpha-phd', 'fall-2027', 'interview', current_date - 2)$$,
  'already reported');
select tests.expect_error($$select public.submit_result('test-alpha-phd', 'fall-2027', 'accepted', current_date + 5)$$,
  'future');
select tests.expect_error($$select public.submit_result('no-such-program', 'fall-2027', 'accepted', current_date)$$,
  'Unknown program');
select tests.expect_error($$select public.submit_result('test-gone-phd', 'fall-2027', 'accepted', current_date)$$,
  'Unknown program');
select tests.expect_error($$select public.submit_result('test-alpha-phd', 'fall-2099', 'accepted', current_date)$$,
  'Unknown admissions cycle');
select tests.expect_error($$select public.submit_result('test-alpha-phd', 'fall-2027', 'maybe', current_date)$$,
  'check constraint');
select tests.expect_error($$select public.submit_result('test-alpha-phd', 'fall-2027', 'rejected', current_date,
  null, null, null, repeat('x', 501))$$, 'check constraint');

select tests.expect((select count(*) from public.result_owners) = 1,
  'A can see A''s own ownership row');
select tests.expect((select count(*) from public.get_my_results()) = 1,
  'A sees the result in "my results"');

select tests.expect_error($$insert into public.result_owners (result_id, user_id, program_slug, cycle_id, decision)
  values (1, '00000000-0000-0000-0000-00000000000b', 'x', 'fall-2027', 'accepted')$$, 'permission denied');
select tests.expect_error($$update public.profiles set role = 'admin'$$, 'permission denied');
select tests.expect_error($$update public.results set hidden = true$$, 'permission denied');
select tests.expect_error($$insert into public.posts (thread_id, author_id, author_handle, body)
  values (1, null, 'Fake', 'x')$$, 'permission denied');

insert into public.follows (user_id, program_slug, cycle_id, status)
values (:user_a, 'test-alpha-phd', 'fall-2027', 'applied');
select tests.expect_error($$insert into public.follows (user_id, program_slug, cycle_id)
  values ('00000000-0000-0000-0000-00000000000b', 'test-beta-phd', 'fall-2027')$$, 'row-level security');

reset role;

-- ---------------------------------------------------------------------------
-- User B cannot see or touch A's private data
-- ---------------------------------------------------------------------------
select tests.as_user(:user_b);
set role authenticated;

select tests.expect((select count(*) from public.result_owners) = 0, 'B cannot see A''s ownership rows');
select tests.expect((select count(*) from public.get_my_results()) = 0, 'B has no results of their own');
select tests.expect((select count(*) from public.follows) = 0, 'B cannot see A''s follows');
select tests.expect((select count(*) from public.profiles) = 1, 'B sees only B''s profile');
select tests.expect_error($$select public.delete_my_result((select id from public.results limit 1))$$,
  'not found');
-- B tries to change every follow; RLS limits this to B's own rows (none yet).
update public.follows set status = 'watching';

select tests.expect((select count(*) from public.results_feed) = 1, 'B sees A''s result in the public feed');
select tests.expect((select matching_reports from public.results_feed limit 1) = 0, 'no matching reports yet');

select tests.expect(public.submit_result('test-alpha-phd', 'fall-2027', 'interview', current_date - 2) > 0,
  'B reports the same interview');
select tests.expect((select min(matching_reports) from public.results_feed
  where program_slug = 'test-alpha-phd' and decision = 'interview') = 1,
  'two reports of the same decision confirm each other');

insert into public.follows (user_id, program_slug, cycle_id) values (:user_b, 'test-alpha-phd', 'fall-2027');

reset role;

select tests.expect((select status from public.follows
  where user_id = :user_a and program_slug = 'test-alpha-phd') = 'applied',
  'B could not change A''s follow');

-- ---------------------------------------------------------------------------
-- Visitors see counts, never people
-- ---------------------------------------------------------------------------
select tests.as_anon();
set role anon;

select tests.expect((select applied_count from public.get_program_stats('fall-2027', 'test-alpha-phd')) = 1,
  'one user applied');
select tests.expect((select following_count from public.get_program_stats('fall-2027', 'test-alpha-phd')) = 2,
  'two users follow');
select tests.expect((select interview_count from public.get_program_stats('fall-2027', 'test-alpha-phd')) = 2,
  'two interview reports');
select tests.expect((select first_interview_on from public.get_program_stats('fall-2027', 'test-alpha-phd'))
  = current_date - 3, 'first interview date is the earliest report');
select tests.expect_error($$select user_id from public.results$$, 'column');
select tests.expect_error($$select user_id from public.results_feed$$, 'column');

reset role;

-- ---------------------------------------------------------------------------
-- Profiles: handles can change, roles cannot
-- ---------------------------------------------------------------------------
select tests.as_user(:user_a);
set role authenticated;

select public.update_my_profile('Night Owl', 'applicant', 'pk');
select tests.expect((select handle from public.profiles) = 'Night Owl', 'A changed handle');
select tests.expect((select country from public.profiles) = 'PK', 'country is stored upper-case');
select tests.expect((select role from public.profiles) = 'member', 'role did not change');

reset role;
select tests.as_user(:user_b);
set role authenticated;

select tests.expect_error($$select public.update_my_profile('night owl')$$, 'already taken');
select tests.expect_error($$select public.update_my_profile('x')$$, 'not allowed');

reset role;

-- ---------------------------------------------------------------------------
-- Discussion
-- ---------------------------------------------------------------------------
select tests.as_user(:user_a);
set role authenticated;

select tests.expect(public.create_thread('Interview tips for Alpha?', 'Has anyone interviewed there before?',
  'test-alpha-phd') > 0, 'A starts a thread');
select tests.expect((select post_count from public.threads where program_slug = 'test-alpha-phd') = 1,
  'thread has its first post');
select tests.expect((select author_handle from public.threads where program_slug = 'test-alpha-phd') = 'Night Owl',
  'thread shows A''s handle');
select tests.expect_error($$select public.create_thread('No place', 'Body')$$, 'needs a program or a field');

reset role;
select tests.as_user(:user_b);
set role authenticated;

select tests.expect(public.add_post((select id from public.threads where program_slug = 'test-alpha-phd'),
  'I did last year. Be ready to talk about one project in depth.') > 0, 'B replies');
select tests.expect_error($$select public.edit_my_post((select min(id) from public.posts), 'Hijacked')$$,
  'only edit your own');
select public.edit_my_post((select max(id) from public.posts), 'Edited reply');
select tests.expect((select edited_at is not null from public.posts where body = 'Edited reply'),
  'B edited B''s own post');
select tests.expect((select post_count from public.threads where program_slug = 'test-alpha-phd') = 2,
  'thread counts replies');

do $$ begin
  for i in 1..5 loop
    perform public.create_thread('Field thread ' || i, 'Body', null, 'biology');
  end loop;
end $$;
select tests.expect_error($$select public.create_thread('Field thread 6', 'Body', null, 'biology')$$, 'up to 5');

reset role;

-- ---------------------------------------------------------------------------
-- Moderation: three reporters hide a result; a moderator can restore it
-- ---------------------------------------------------------------------------
select r.id as a_result
from public.results r
join public.result_owners o on o.result_id = r.id
where o.user_id = :user_a
\gset

select tests.as_user(:user_b);
set role authenticated;
select public.report_content('result', :a_result, 'fake');
reset role;

select tests.as_user(:user_c);
set role authenticated;
select public.report_content('result', :a_result, 'fake');
select public.report_content('result', :a_result, 'fake');
reset role;

select tests.expect((select not hidden from public.results where id = :a_result),
  'two reporters (one reporting twice) do not hide a result');

select tests.as_user(:user_d);
set role authenticated;
select public.report_content('result', :a_result, 'spam', 'Looks made up');
reset role;

select tests.expect((select hidden from public.results where id = :a_result),
  'three different reporters hide a result');

select tests.as_anon();
set role anon;
select tests.expect((select count(*) from public.results_feed where id = :a_result) = 0,
  'a hidden result disappears from the public feed');
reset role;

select tests.as_user(:user_a);
set role authenticated;
select tests.expect((select hidden from public.get_my_results() where id = :a_result),
  'the reporter still sees their hidden result, marked hidden');
select tests.expect_error(format('select public.moderate_content(%L, %s, false)', 'result', :a_result),
  'Only moderators');
reset role;

select tests.as_user(:user_m);
set role authenticated;
select public.moderate_content('result', :a_result, false);
reset role;

select tests.expect((select not hidden from public.results where id = :a_result),
  'a moderator restored the result');
select tests.expect((select count(*) from public.content_reports
  where target_id = :a_result and resolved_at is null) = 0, 'its reports are marked resolved');

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------
select tests.as_user(:user_b);
set role authenticated;
select tests.expect_error($$select public.post_announcement('Invites sent', 'https://example.edu/news')$$,
  'Only moderators');
reset role;

select tests.as_user(:user_m);
set role authenticated;
select tests.expect(public.post_announcement('Interview invitations sent', 'https://example.edu/news',
  'The program says invitations went out today.', 'test-alpha-phd') > 0, 'a moderator posts an announcement');
select tests.expect_error($$select public.post_announcement('Bad link', 'http://insecure.example')$$,
  'check constraint');
reset role;

select tests.as_anon();
set role anon;
select tests.expect((select count(*) from public.announcements) = 1, 'anyone can read announcements');
reset role;

-- ---------------------------------------------------------------------------
-- Limits
-- ---------------------------------------------------------------------------
select tests.as_user(:user_c);
set role authenticated;

do $$ begin
  for i in 1..100 loop
    insert into public.follows (user_id, program_slug, cycle_id)
    values ('00000000-0000-0000-0000-00000000000c', 'test-bulk-' || i, 'fall-2027');
  end loop;
end $$;
select tests.expect_error($$insert into public.follows (user_id, program_slug, cycle_id)
  values ('00000000-0000-0000-0000-00000000000c', 'test-bulk-101', 'fall-2027')$$, 'up to 100');

do $$ begin
  for i in 1..30 loop
    perform public.submit_result('test-bulk-' || i, 'fall-2027', 'rejected', current_date);
  end loop;
end $$;
select tests.expect_error($$select public.submit_result('test-bulk-31', 'fall-2027', 'rejected', current_date)$$,
  'many results today');

reset role;

-- ---------------------------------------------------------------------------
-- Deleting an account removes its results and follows; posts stay anonymous
-- ---------------------------------------------------------------------------
delete from auth.users where id = :user_a;

select tests.expect(not exists (select 1 from public.results where id = :a_result),
  'deleting an account deletes its results');
select tests.expect(not exists (select 1 from public.follows where user_id = :user_a),
  'deleting an account deletes its follows');
select tests.expect((select count(*) from public.threads
  where author_handle = 'Night Owl' and author_id is null) = 1,
  'threads stay, but are no longer linked to the deleted account');

\echo 'All database tests passed.'
