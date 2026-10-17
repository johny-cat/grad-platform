# Security and privacy model

## Keys

- **Public, in the code:** Supabase project URL and publishable ("anon") key,
  in `src/config.ts`. Anyone can see these in the browser; that is by design.
- **Secret, never in the code, chat, or browser:** the Supabase secret /
  service_role key, the database password, API keys for email providers.
  These go only into dashboard settings or GitHub/Cloudflare secret storage.

## Database rules

- RLS is enabled on every table; explicit `revoke` statements remove the broad
  default privileges Supabase gives API roles, so a missing policy can never
  open a table for writing.
- Shared data (results, threads, posts, reports, announcements) is written
  only through `security definer` functions with `set search_path = ''`. Each
  checks the caller (`auth.uid()`), validates input, and rate-limits.
- Results are anonymous: `results` holds no user column. Ownership lives in
  `result_owners`, readable only by the owner.
- Profiles are private. Public names are copied onto posts at write time.
- Users can never change their own `role`; moderators are set with SQL by the
  database owner:
  `update public.profiles set role = 'moderator' where id = '<user id>';`

## Limits (in the migration)

| Action | Limit |
| --- | --- |
| Report a result | 30 per day per person; once per program, cycle and decision |
| Start a discussion | 5 per day |
| Reply | 30 per hour |
| Flag content | 20 per day |
| Follow programs | 100 per cycle |

## Moderation

Three different people flagging the same result, thread or post hides it
automatically until a moderator reviews it (`moderate_content()`). The
person who posted still sees it, marked as hidden.

## Tests

`npm run test:db` runs `supabase/tests/10_security_test.sql` against a local
Postgres with Supabase-like roles: anonymous visitors can't write, users
can't read or change each other's data, roles can't be escalated, limits and
auto-hiding work, and deleting an account removes its results.

## Still to do

- Content-Security-Policy header (needs Supabase and fonts allow-listed).
- Custom SMTP for sign-in emails. Supabase's built-in email only reaches
  members of the project's team and is limited to 2 messages an hour.
- Moderator dashboard page.
- Account deletion from the site (today: delete reports and follows yourself).
