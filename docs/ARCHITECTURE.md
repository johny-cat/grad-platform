# Architecture

## The short version

- **Pages are built ahead of time** (Astro, static output) and served from
  Cloudflare's global network. A page view costs almost nothing and scales to
  very large traffic.
- **Live data is loaded in the browser** from Supabase: results, counts,
  follows, sign-in. Each program page makes two small requests.
- **Program details live in this repository** (`src/data/programs/*.json`),
  version-controlled and reviewed like code. The database only mirrors each
  program's ID and name so user data can point at real programs.
- **The database protects itself.** Row-level security on every table; shared
  data is written only through validated functions. See `SECURITY.md`.

```
Browser
  |-- HTML/CSS/JS ------------------> Cloudflare Pages (static files, cached worldwide)
  |-- results, counts, follows ----> Supabase REST (PostgREST) -> Postgres with RLS
  |-- sign-in (email link/Google) -> Supabase Auth
```

## Data model (see `supabase/migrations`)

| Table | Public? | Written by |
| --- | --- | --- |
| `cycles` | read | migrations |
| `programs` | read | generated `supabase/seed/catalog.sql` |
| `profiles` | owner only | sign-up trigger, `update_my_profile()` |
| `results` | read (not hidden) | `submit_result()`, `delete_my_result()` |
| `result_owners` | owner only | `submit_result()` |
| `follows` | owner only | the owner directly (RLS) |
| `announcements` | read (not hidden) | `post_announcement()` (moderators) |
| `threads`, `posts` | read (not hidden) | `create_thread()`, `add_post()`, `edit_my_post()` |
| `content_reports` | owner only | `report_content()` |

Read paths: the `results_feed` view (includes `matching_reports`, how many
others reported the same decision within two days) and the
`get_program_stats()` function (counts only).

## Why the islands use `client:only`

Pages are built once, but "today" changes every day and every visitor's time
zone differs. Anything that depends on the date, the visitor, or live data
renders only in the browser. Static fallbacks keep the layout steady while
they load. `src/scripts/clock.ts` updates countdowns and "Today" markers in
the static parts of each page.

## Growing to very large traffic

In order, as needed:

1. Upgrade Supabase to Pro (no inactivity pause, daily backups, more room).
2. Cache public reads (`results_feed`, stats) for 30-60 seconds at the edge
   with a small Cloudflare Worker, so a burst of visitors hits the database
   once per minute per program instead of once per visit.
3. Keep per-program counts in a summary table updated by triggers instead of
   counting on every request.
4. Rebuild pages on a schedule (Cloudflare deploy hook) so countdown order and
   "coming up" lists stay fresh without visitors' browsers doing the work.
5. Live updates (Supabase Realtime) only for signed-in followers, if needed.
6. Full-text search (Pagefind or Postgres) when the catalog passes ~1,000 programs.
