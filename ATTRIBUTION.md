# Attribution

This plugin is an adaptation of
[career-ops](https://github.com/santifer/career-ops) by santifer, generalized
beyond software roles and packaged as a Claude plugin.

The original career-ops is a Claude Code job search system built around an A–F
scoring rubric, ATS-safe CV generation, and an application tracker. Those ideas
are the foundation this builds on.

## What we adapted

- The A–F evaluation structure, generalized across industries
- ATS compliance rules for resume generation
- The application state machine and tracker
- The hook + proof + proposal outreach structure
- The follow-up cadence model and its default windows
- The `## Machine Summary` report format — matched exactly, so reports written
  by this plugin are readable by career-ops's own analysis scripts
- "Never fabricate, never auto-submit" and the source-of-truth boundary

## What we changed

- Packaged as a Claude plugin with a marketplace manifest
- Replaced six tech-specific archetypes with fifteen industry-general ones, each
  in its own lens file loaded on demand
- Replaced Playwright and Node dependencies with web search and web fetch
- Added resume ingestion — paste a resume, Claude parses it into the profile
- Added a conversational setup flow for non-technical users
- Added persona modifiers (recent graduate, career changer, career returner,
  international) that adjust scoring
- Added a pipeline triage skill for bulk scoring of scan results
- Redesigned output for a GUI: tables and scannable structure over prose
- Added an interop layer so the plugin uses an existing career-ops checkout's
  files instead of maintaining a parallel set

## License

Both the original career-ops and this adaptation are MIT licensed.
