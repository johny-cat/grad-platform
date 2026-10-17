interface ImportMetaEnv {
  /** Optional override of src/config.ts SUPABASE_URL. */
  readonly PUBLIC_SUPABASE_URL?: string;
  /** Optional override of src/config.ts SUPABASE_PUBLISHABLE_KEY. */
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  /** "1" builds a preview with labelled sample data and no live features. */
  readonly PUBLIC_DEMO?: string;
  /** In preview builds, the date the preview pretends it is (YYYY-MM-DD). */
  readonly PUBLIC_DEMO_TODAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
