# Setup status

What is switched on, and the steps for what isn't yet. Update this file
whenever something changes.

| Piece | Status |
| --- | --- |
| GitHub repository `johny-cat/grad-platform` | Created (public). Claude GitHub App installed; code pushed to `main` on 2026-10-17. |
| Automatic checks (GitHub) | Run on every pull request and every push to `main` (section 6). |
| Supabase project `nhebswofygpgxcgvginn` | Database set up on 2026-10-17 (section 2). |
| Cloudflare Pages | Connected to `main` on 2026-10-17. Live at https://grad-platform.pages.dev (section 4). |
| Sign-in | Address settings done on 2026-10-17 (section 3). First sign-in by email link worked on 2026-10-18. |
| Sign-in emails | Supabase built-in email: a link only, no code, and the templates can't be edited. Reaches project team members only, about 2 per hour. Custom SMTP needed before launch (section 5). |
| Domain | Not bought yet (site name not final). |
| Google sign-in | Not switched on. |

## 1. Let Claude push code to GitHub (done)

The Claude GitHub App is installed on `johny-cat` with access to
`grad-platform`. Cloud sessions (claude.ai/code) start from this repository
and save their work on a branch; open a pull request and merge it into
`main`. Explain each change to Junaid before he merges.

## 2. Set up the database (done 2026-10-17)

In Supabase: SQL Editor, New query, then run these two files in order:

1. `supabase/migrations/20261017150000_initial_schema.sql`
2. `supabase/seed/catalog.sql`

Run `catalog.sql` again whenever programs are added (until CI does it).
Later database changes come as new files in `supabase/migrations/`: run
each one once, in order, and add it to the list below.

Run on the live database:

- 2026-10-17: `20261017150000_initial_schema.sql`
- 2026-10-17: `catalog.sql` (7 programs)

Checked from outside with the public key: visitors can read programs,
cycles, the results feed and the counts, and are refused on profiles,
result owners, follows and reports. The first sign-up (2026-10-18) created
its profile automatically.

## 3. Sign-in settings (Supabase: Authentication)

**URL Configuration (done 2026-10-17)**

- Site URL: `https://grad-platform.pages.dev`
- Redirect URLs, all three:
  - `https://grad-platform.pages.dev/**` (the live site)
  - `https://*.grad-platform.pages.dev/**` (Cloudflare preview links)
  - `http://localhost:4321/**` (a copy running on a computer)

Use these `/**` patterns, not exact `/auth/callback/` addresses. The sign-in
page adds `?next=...` to the callback address so people land back where they
started, and an exact address doesn't match that. When the domain is bought,
change the Site URL and add the domain's `/**` pattern.

**Email templates (Authentication, Emails)**

Locked for now. On Supabase's built-in email the dashboard says "Set up
custom SMTP to edit templates", and the default emails contain only a
sign-in link, no code. For safety (`flowType: 'pkce'` in
`src/lib/supabase.ts`) the link works only in the browser that asked for
it, so the sign-in page tells people to open it there
(`SIGN_IN_EMAIL_HAS_CODE = false` in `src/config.ts`).

Once custom SMTP is set up (section 5):

1. Add the code `{{ .Token }}` next to the link in BOTH templates:
   - "Confirm sign up": the email a new person gets the first time
   - "Magic link or OTP": the email for every sign-in after that
2. Test both: sign in with a new address and with an existing one, and
   check that each email shows a code.
3. Set `SIGN_IN_EMAIL_HAS_CODE = true` in `src/config.ts`. The sign-in page
   then also offers a box for the code, for people whose email app opens
   links in a different browser.

## 4. Publish the site (Cloudflare) (done 2026-10-17)

Workers & Pages, Create, Pages, Connect to Git, choose `grad-platform`:

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`

Every push to `main` publishes https://grad-platform.pages.dev
automatically. Every other branch gets its own preview link; on a pull
request, the "Cloudflare Pages" check lists it (open the Checks tab). The
security headers in `public/_headers` are applied; a
Content-Security-Policy is still to do (`docs/SECURITY.md`).

## 5. Before public launch

- Buy the domain; point it at Cloudflare Pages; update `SITE_URL` in
  `src/config.ts`; update the Site URL and Redirect URLs in Supabase
  (section 3).
- Email: create a Resend account, verify the domain, and set it as custom
  SMTP in Supabase (Authentication, Emails, SMTP settings). Then add the
  code to both email templates and switch it on (section 3).
- Contact address for corrections: set `CONTACT_EMAIL` in `src/config.ts`.
- Optional: Google sign-in (Google Cloud OAuth client, then Supabase,
  Authentication, Providers, Google).

## 6. Automatic checks (GitHub)

`.github/workflows/ci.yml` runs on every pull request and every push to
`main`. It installs the packages (`npm ci`), checks the code
(`npm run check`), builds the site (`npm run build`) and tests the database
rules on a throwaway database (`npm run test:db`). It never changes the
live site or the live database.

The result shows near the bottom of each pull request: a green tick when
everything passed, a red cross when something failed (click "Details" to
see what). Merge only when it is green.
