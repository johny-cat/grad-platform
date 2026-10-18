# Setup status

What is switched on, and the steps for what isn't yet. Update this file
whenever something changes.

| Piece | Status |
| --- | --- |
| GitHub repository `johny-cat/grad-platform` | Created (public). Claude GitHub App installed; code pushed to `main` on 2026-10-17. On 2026-10-18 GitHub suspended the `johny-cat` account (appeal sent); while it lasts, the site is published by hand (section 7). |
| Automatic checks (GitHub) | Run on every pull request and every push to `main`; program links are also checked every Monday (section 6). |
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

`.github/workflows/links.yml` ("Program links") opens every program's
official links. It runs on pull requests that change programs, every Monday
morning and on demand (Actions tab, "Program links", "Run workflow"). Each
run's summary page has a table of every link and the title of the page it
opened; on a pull request the same results appear as a comment (the only
thing this check may write). A red cross there means a program page has
moved or gone: find the new official page and update the program's file.

## 7. Publishing without GitHub (by hand)

Normally Cloudflare builds the site from `main` on GitHub. If GitHub can't be
used (as since 2026-10-18), the finished site can be uploaded to the same
Cloudflare project from Junaid's Windows computer. Cloudflare's dashboard
doesn't take drag-and-drop uploads for a project connected to Git, but its
`wrangler` tool does.

Claude prepares two files: the built site (`dist/`, zipped with the files at
the top level) and `supabase/seed/catalog.sql` saved as a `.txt` file.

1. Supabase, SQL Editor, New query: paste the `.txt` file and Run.
2. Once only: install Node.js (LTS) from https://nodejs.org.
3. Extract the zip into `Downloads\heardyet-site`.
4. Open Command Prompt (not PowerShell) and run:
   ```
   cd %USERPROFILE%\Downloads
   npx wrangler login
   npx wrangler pages deploy heardyet-site --project-name=grad-platform --branch=main
   ```
5. Check https://grad-platform.pages.dev/programs/ (the program count).

To undo: Cloudflare dashboard, Workers & Pages, `grad-platform`,
Deployments, choose the previous one, "Rollback to this deployment". When
GitHub is back, merging the pull request makes Cloudflare build the same
work from GitHub again.

Uploaded by hand: none yet (the first upload, with 300 new programs, was
prepared on 2026-10-19).
