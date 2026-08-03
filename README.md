# career-ops for all jobs

A Claude plugin that turns a job search into a system: evaluate postings, tailor
ATS-safe resumes, scan career portals, track applications, time follow-ups, draft
outreach, and research companies.

Works for any field — software, healthcare, finance, legal, creative, trades,
education, government, and everything between. Fifteen industry lenses, each with
its own scoring emphasis, so a nursing role and a backend role aren't judged by
the same yardstick.

Adapted from [santifer/career-ops](https://github.com/santifer/career-ops), and
built to run **alongside** it rather than instead of it.

## Install

```
/plugin marketplace add Rahulprajapati99/career-ops-plugin-for-all-jobs
/plugin install career-ops-alljobs@career-ops-alljobs
```

For local development, point Claude Code at the checkout directly:

```bash
claude --plugin-dir /path/to/career-ops-plugin-for-all-jobs
```

## Quick start

1. Say **"set up my profile"** and paste your resume.
2. Paste a job posting and say **"evaluate this"**.
3. Say **"tailor my resume"** for the strong matches.
4. Say **"help"** at any point to see where you are and what's worth doing next.

## Skills

| Skill | What it does | Try saying |
|---|---|---|
| **evaluate** | Score a posting A–F against your background | "Evaluate this job posting" |
| **tailor-resume** | ATS-safe resume for one specific role | "Tailor my resume for Acme" |
| **scan** | Search company career portals | "Scan Stripe for openings" |
| **triage** | Quick-score a pipeline of scan results | "Triage my pipeline" |
| **track** | Application tracker and search stats | "Show my applications" |
| **follow-up** | Who's overdue a nudge, and what to send | "Check my follow-ups" |
| **apply** | Answers for an application form | "Help me with this application" |
| **research** | Company brief before applying or interviewing | "Research this company" |
| **outreach** | LinkedIn and email messages to contacts | "Draft outreach to the hiring manager" |
| **compare** | Opportunities side by side | "Compare my top options" |

Two commands: **setup** (build or update your profile) and **quick-eval** (a
score and a paragraph, nothing saved).

## Running alongside career-ops

If you already use [career-ops](https://github.com/santifer/career-ops), this
plugin detects your checkout and uses **your existing files** — the same tracker,
the same CV, the same reports directory. You don't end up maintaining two
trackers that disagree with each other.

Concretely, inside a career-ops checkout:

| This plugin reads/writes | Instead of |
|---|---|
| `config/profile.yml`, `cv.md` | `data/profile.yml`, `data/resume.md` |
| `reports/` | `data/evaluations/` |
| `output/` | `data/resumes/` |
| `portals.yml` | `config/portals.yml` |
| `data/applications.md` in career-ops's column layout | its own column layout |

Evaluations are written with career-ops's `## Machine Summary` YAML block, so
`analyze-patterns.mjs`, `upskill.mjs`, and `salary-gap.mjs` can read reports this
plugin produced. Statuses are written in career-ops's vocabulary
(`Discarded`/`SKIP` rather than `Withdrawn`/`Skipped`).

career-ops's System Layer — `modes/`, the `.mjs` scripts, templates, its own
manifests — is never written to, matching career-ops's own data contract. Its
curated inputs (`config/profile.yml`, `cv.md`, `portals.yml`) are read but not
edited: where something should change there, the plugin shows the exact edit and
leaves it to you.

Detection is automatic and needs no configuration. The full mapping is in
[`references/data-layout.md`](references/data-layout.md).

## How evaluation works

Paste a posting and get a full assessment:

- **A. Executive Summary** — archetype, seniority, one-line verdict
- **B. Background Match** — every JD requirement mapped to your experience
- **C. Positioning Strategy** — how to present yourself for this specific role
- **D. Compensation & Market** — the posting's stated figure plus researched context
- **E. Tailoring Plan** — specific resume and LinkedIn changes
- **F. Interview Prep** — STAR stories mapped to JD requirements

Scored 1.0 to 5.0. Honest, not inflated — a 3.2 is reported as a 3.2. In
regulated fields (healthcare, legal, trades, licensed engineering), a missing
required license caps the score at 2.0 no matter how strong the rest is.

## What it will not do

- **Fabricate.** Nothing appears in a resume, cover letter, or application answer
  that isn't backed by your profile or something you said in the conversation.
  Reorder, reframe, emphasize — never invent. Where the profile can't support a
  requirement, it's reported as a gap, not written around.
- **Auto-submit.** Every answer is shown for review, and the submit button is
  yours. This holds even if you ask it to submit.
- **Claim authorship.** "Used X" never becomes "built X".

## Privacy

Your data stays local. `data/` and `config/` are gitignored, and CI fails if
either is ever committed. Nothing leaves the machine beyond what Claude uses to
help — web searches for salary data and company research.

## Development

```bash
node scripts/validate-plugin.mjs          # structural validation
node scripts/validate-plugin.mjs --strict # warnings fail too, as in CI
```

The validator checks manifest schemas, skill front matter, name and directory
agreement, and — the one that matters most — that every
`${CLAUDE_PLUGIN_ROOT}/...` path resolves to a file that exists and that no
skill references a bundled file without that prefix. A bare `references/foo.md`
resolves against the user's project directory rather than the plugin, and fails
silently at runtime.

## License

MIT. See [ATTRIBUTION.md](ATTRIBUTION.md) for credits.
