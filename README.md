# HeardYet (working name)

**Has anyone heard yet?** A free, worldwide home for graduate school
applicants: every program's deadlines and requirements, checked against
official pages, plus live, anonymous decision results reported by applicants,
so nobody waits alone.

Built for everyone who hasn't made it yet.

## Status

First version in progress. Biology and biomedical PhD programs in the United
States for the Fall 2027 cycle, with more fields and countries to follow.
See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/SETUP.md](docs/SETUP.md).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

## How it's built

- [Astro](https://astro.build) static site with small [Preact](https://preactjs.com) islands
- [Supabase](https://supabase.com) for sign-in and data, protected by row-level security
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com)

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit,
and [CLAUDE.md](CLAUDE.md) for the rules every change follows.
