-- Community tests: spaces, private author ids, blocking, reports and the
-- moderator review list. Runs after 10_security_test.sql (uses its helpers).

\set ON_ERROR_STOP on
\set QUIET on
\set user_e  '''00000000-0000-0000-0000-00000000000e'''
\set user_f  '''00000000-0000-0000-0000-00000000000f'''
\set user_g  '''00000000-0000-0000-0000-000000000010'''
\set user_h  '''00000000-0000-0000-0000-000000000011'''
\set user_x  '''00000000-0000-0000-0000-0000000000ee'''

reset role;
insert into auth.users (id, email) values
  (:user_e, 'e@test.invalid'),
  (:user_f, 'f@test.invalid'),
  (:user_g, 'g@test.invalid'),
  (:user_h, 'h@test.invalid'),
  (:user_x, 'x@test.invalid');
update public.profiles set handle = 'Early Lark' where id = :user_e;
update public.profiles set handle = 'Spam Crow' where id = :user_f;
update public.profiles set handle = 'Mod Owl', role = 'moderator' where id = :user_x;

-- ---------------------------------------------------------------------------
-- Spaces
-- ---------------------------------------------------------------------------
select tests.as_user(:user_e);
set role authenticated;

select tests.expect(public.create_thread('Rejected from my top choice', 'Still trying again next year.',
  null, null, 'lift-up') > 0, 'E starts a thread in Lift up');
select tests.expect((select space from public.threads where title = 'Rejected from my top choice') = 'lift-up',
  'thread is in the lift-up space');
select tests.expect_error($$select public.create_thread('Somewhere', 'Body', null, null, 'nowhere')$$,
  'Unknown space');

-- ---------------------------------------------------------------------------
-- Privacy: nickname is public, account id is not
-- ---------------------------------------------------------------------------
reset role;
select tests.as_anon();
set role anon;

select tests.expect((select author_handle from public.community_posts
  where body = 'Still trying again next year.') = 'Early Lark', 'visitors see the nickname');
select tests.expect_error($$select author_id from public.posts limit 1$$, 'permission denied');
select tests.expect_error($$select author_id from public.threads limit 1$$, 'permission denied');
select tests.expect((select count(*) from public.threads where space = 'lift-up') = 1,
  'visitors can list threads in a space');
select tests.expect(not (select is_mine from public.community_posts
  where body = 'Still trying again next year.'), 'a visitor''s is_mine is false');

reset role;
select tests.as_user(:user_e);
set role authenticated;
select tests.expect((select is_mine from public.community_posts
  where body = 'Still trying again next year.'), 'the author sees is_mine');

-- ---------------------------------------------------------------------------
-- Three reports hide a post; the moderator sees it and can restore it
-- ---------------------------------------------------------------------------
reset role;
select tests.as_user(:user_f);
set role authenticated;
select public.add_post((select id from public.threads where title = 'Rejected from my top choice'),
  'Buy cheap essays at spam.example');
select tests.expect_error($$select * from public.list_reported_content()$$, 'Only moderators');

do $$
declare
  v_post bigint := (select id from public.posts where body = 'Buy cheap essays at spam.example');
  v_users uuid[] := array['00000000-0000-0000-0000-00000000000e', '00000000-0000-0000-0000-000000000010',
                          '00000000-0000-0000-0000-000000000011']::uuid[];
  u uuid;
begin
  foreach u in array v_users loop
    perform tests.as_user(u);
    perform public.report_content('post', v_post, 'spam');
  end loop;
end $$;

reset role;
select tests.expect((select hidden from public.posts where body = 'Buy cheap essays at spam.example'),
  'three reports hide the post');
select tests.as_anon();
set role anon;
select tests.expect(not exists (select 1 from public.community_posts
  where body = 'Buy cheap essays at spam.example'), 'hidden posts disappear for visitors');

reset role;
select tests.as_user(:user_x);
set role authenticated;
select tests.expect((select report_count from public.list_reported_content()
  where body = 'Buy cheap essays at spam.example') = 3, 'the moderator sees the reported post');

-- ---------------------------------------------------------------------------
-- Blocking
-- ---------------------------------------------------------------------------
select tests.expect((select author_handle from public.list_reported_content()
  where body = 'Buy cheap essays at spam.example') = 'Spam Crow', 'the moderator sees who posted it');
select public.set_member_blocked('Spam Crow', true);
select public.moderate_content('post', (select target_id from public.list_reported_content()
  where body = 'Buy cheap essays at spam.example'), true);
select tests.expect(not exists (select 1 from public.list_reported_content()), 'reports are resolved');
select tests.expect_error($$select public.set_member_blocked('Mod Owl', true)$$, 'No member');

reset role;
select tests.as_user(:user_f);
set role authenticated;
select tests.expect_error($$select public.add_post((select id from public.threads
  where title = 'Rejected from my top choice'), 'Again')$$, 'can''t post');
select tests.expect_error($$select public.create_thread('New spam', 'Body', null, null, 'general')$$,
  'can''t post');

reset role;
select tests.as_user(:user_e);
set role authenticated;
select tests.expect_error($$select public.set_member_blocked('Early Lark', true)$$, 'Only moderators');

reset role;
\echo 'Community tests passed.'
