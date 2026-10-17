// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import { SITE_URL } from './src/config.ts';

// Static site: every page is built ahead of time and served from Cloudflare's
// global network. Live data (results, follows, sign-in) is loaded in the
// browser from Supabase. See docs/ARCHITECTURE.md.
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // Keep normal HTML whitespace rules so text and links never run together.
  compressHTML: true,
  integrations: [preact()],
});
