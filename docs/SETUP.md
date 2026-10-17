# Setup status

What is switched on, and the steps for what isn't yet. Update this file
whenever something changes.

| Piece | Status |
| --- | --- |
| GitHub repository `johny-cat/grad-platform` | Created (public). Claude can read it; pushing needs the Claude GitHub App installed for this repository. |
| Supabase project `nhebswofygpgxcgvginn` | Created. Database setup not run yet. |
| Cloudflare Pages | Account created. Not connected yet. |
| Domain | Not bought yet (site name not final). |
| Sign-in emails | Supabase built-in email: reaches project team members only, 2 per hour. Custom SMTP needed before launch. |
| Google sign-in | Not switched on. |

## 1. Let Claude push code to GitHub

Install the Claude GitHub App on the `johny-cat` account and give it access
to `grad-platform`: https://github.com/apps/claude/installations/select_target

## 2. Set up the database (once)

In Supabase: SQL Editor, New query, then run these two files in order:

1. `supabase/migrations/20261017150000_initial_schema.sql`
2. `supabase/seed/catalog.sql`

Run `catalog.sql` again whenever programs are added (until CI does it).

## 3. Sign-in settings (Supabase: Authentication)

- URL Configuration: Site URL = the live site address (e.g.
  `https://grad-platform.pages.dev`). Add `https://<site>/auth/callback/` and
  `http://localhost:4321/auth/callback/` to Redirect URLs.
- Email Templates, Magic Link: include the code `{{ .Token }}` as well as the
  link, so people whose email app opens links in another browser can type the
  code instead.

## 4. Publish the site (Cloudflare)

Workers & Pages, Create, Pages, Connect to Git, choose `grad-platform`:

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`

Every push to `main` then publishes automatically.

## 5. Before public launch

- Buy the domain; point it at Cloudflare Pages; update `SITE_URL` in `src/config.ts`.
- Email: create a Resend account, verify the domain, and set it as custom
  SMTP in Supabase (Authentication, Emails, SMTP settings).
- Contact address for corrections: set `CONTACT_EMAIL` in `src/config.ts`.
- Optional: Google sign-in (Google Cloud OAuth client, then Supabase,
  Authentication, Providers, Google).
