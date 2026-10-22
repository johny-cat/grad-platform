# Instructions for AI coding agents

This project's rules are in `CLAUDE.md`. They apply to every AI that works
here (Codex, ChatGPT or any other), not only Claude. Read it first, then:

- **Program details:** follow `docs/DATA.md` and `docs/CHECKING-PROGRAMS.md`.
  Every fact comes from the program's or university's own official pages,
  and the exact sentence behind it is recorded in
  `docs/evidence/<program-id>.md`. If you can't open an official page (no
  internet access, or the site blocks you), leave the fact out and say so.
  Never fill a fact from memory, a search-result summary or another website.
- **Before opening a pull request:** run `npm run check` and `npm run build`.
- **One task, one branch, one pull request.** Don't merge it: Junaid, the
  owner, merges after a review.
- **Plain language.** Junaid isn't a programmer. Explain every change to him
  without jargon.
