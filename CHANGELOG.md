# Changelog

## 1.1.0

Integration with an existing career-ops checkout, plus a pass over correctness
and token cost.

### Fixed

- **Bundled reference files were unreachable at runtime.** Skills said things
  like "Read references/scoring-rubric.md", which resolves against the *user's*
  project directory, not the plugin's install directory. Every scoring rubric,
  ATS rule, and resume template lookup failed silently. All bundled paths now
  use `${CLAUDE_PLUGIN_ROOT}`, and the validator fails the build if a bare one
  reappears.
- **Plugin manifest pointed at the wrong project.** `author` and `repository`
  named an unrelated upstream repo.
- **Plugin name collided with career-ops.** Both declared a plugin named
  `career-ops`, so installing this one alongside it was ambiguous. Renamed to
  `career-ops-alljobs`; skills are namespaced `career-ops-alljobs:*`.
- **`apply` and `track` promised follow-up reminders that nothing implemented.**
- **Skills wrote whole files where they meant to change one row**, which loses
  concurrent edits and renumbers rows. Tracker and pipeline updates are now
  in-place edits, and `Edit` was added to the relevant `allowed-tools`.

### Added

- **`follow-up` skill.** Classifies active applications as urgent, overdue,
  waiting, or cold; drafts the message; records it only after the user confirms
  they sent it. Cadence defaults match career-ops's, and it reads a
  `followup_cadence` block from either profile format.
- **`.claude-plugin/marketplace.json`**, so the repo installs with
  `/plugin marketplace add`.
- **`references/data-layout.md`** — one place that resolves every data path,
  for both standalone and career-ops host mode, including the tracker column
  layouts, the status vocabulary mapping, and the write-safety rules.
- **`templates/portals.example.yml`** — a watchlist seed using career-ops's key
  names, so one file works for both.
- **`scripts/validate-plugin.mjs` and a CI workflow.** Checks manifest schemas,
  front matter, skill name/directory agreement, that every
  `${CLAUDE_PLUGIN_ROOT}` path resolves, and that no bundled file is referenced
  without that prefix. CI also fails if candidate data is ever committed.

### Changed

- **Evaluations now open with career-ops's `## Machine Summary` YAML block.**
  `compare`, `track`, and `help` read that block instead of whole reports —
  comparing five roles went from five full A–F reports to five short fences. In
  a career-ops checkout it also means `analyze-patterns.mjs`, `upskill.mjs`, and
  `salary-gap.mjs` can read reports this plugin wrote.
- **The 15 archetype lenses were split into `references/lenses/*.md`,** loaded
  one at a time after detection instead of all fifteen on every evaluation.
  Scoring weights stay in `scoring-rubric.md` alone, so there's one authority
  for the numbers.
- **`evaluate` delegates profile creation to `setup`** rather than running a
  divergent inline version that produced profiles other skills couldn't read.
- **`ats-endpoints.md` leads with what `scan` actually uses** — ATS detection and
  search query patterns — with the blocked direct APIs moved to an appendix. Adds
  per-platform indexing caveats, so "no results" gets reported as either "nothing
  matched" or "couldn't see the board" rather than being conflated.
- **`.gitignore` covers the career-ops-shaped output paths too** (`reports/`,
  `output/`, `jds/`, `cv.md`).

## 1.0.0

Initial release: 9 skills, 2 commands, 1 agent, 15 industry archetypes.
