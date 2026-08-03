# Data Layout

Single source of truth for **where every file lives**. Every skill resolves its
paths through this document. Nothing else in the plugin hardcodes a data path.

There are two layouts. Detect which one applies **once**, at the start of a
skill, then use it for the whole run.

---

## Path kinds

Three kinds of path appear in this plugin. They resolve differently and mixing
them up is the most common source of "file not found":

| Kind | Written as | Resolves to |
|---|---|---|
| **Plugin asset** | `${CLAUDE_PLUGIN_ROOT}/references/states.md` | The plugin's install directory. Read-only. |
| **Workspace data** | `data/profile.yml` | The user's current project directory. Read/write. |
| **Host-system file** | `config/profile.yml` (career-ops) | The user's career-ops checkout. Read mostly, write narrowly. |

`${CLAUDE_PLUGIN_ROOT}` is set by Claude Code and points at wherever the plugin
was installed. It is **not** the user's project. Never write there — it is
replaced on every plugin update.

---

## Step 1: Detect the layout

Check the current project directory for **both** of these markers:

- `DATA_CONTRACT.md`
- `modes/_shared.md`

**Both present** → **Host mode**. The user is inside a
[career-ops](https://github.com/santifer/career-ops) checkout. Use its files.

**Either missing** → **Standalone mode**. Use the plugin's own `data/` layout.

Detect with a single `Glob` for `{DATA_CONTRACT.md,modes/_shared.md}` rather
than two `Read` calls that may error.

State the detection result once, briefly, the first time it matters in a
session:

> "Detected a career-ops checkout — I'll use your existing tracker and profile
> instead of starting a new one."

Do not repeat it on every subsequent skill invocation.

---

## Step 2: Resolve paths

| What | Standalone mode | Host mode (career-ops) |
|---|---|---|
| Profile / identity | `data/profile.yml` | `config/profile.yml` |
| Full resume text | `data/resume.md` | `cv.md` |
| Narrative, archetypes | `data/profile.yml` (`narrative:`) | `modes/_profile.md` |
| Application tracker | `data/applications.md` | `data/applications.md` |
| Evaluation reports | `data/evaluations/` | `reports/` |
| Generated resumes | `data/resumes/` | `output/` |
| Company research | `data/research/` | `data/research/` |
| Scan pipeline / inbox | `data/pipeline.md` | `data/pipeline.md` |
| Scan history | `data/scan-history.md` | `data/scan-history.tsv` |
| Company watchlist | `config/portals.yml` | `portals.yml` |
| Follow-up history | `data/follow-ups.md` | `data/follow-ups.md` |
| Saved job descriptions | `data/jds/` | `jds/` |
| Do-not-apply list | `data/blacklist.md` | `data/blacklist.md` |

Create any missing directory before writing into it. In standalone mode, seed
`config/portals.yml` from `${CLAUDE_PLUGIN_ROOT}/templates/portals.example.yml`
when the user first asks to scan a watchlist.

---

## Host mode write rules

career-ops splits its files into a **User Layer** and a **System Layer** (see
its own `DATA_CONTRACT.md`). That split is binding on this plugin too.

**Never write to** — these belong to career-ops and are replaced on its updates:

- `modes/**` (including `modes/_profile.md` — propose edits, let the user apply them)
- `*.mjs`, `package.json`, `dashboard/**`, `templates/**`, `batch/**`
- `AGENTS.md`, `CLAUDE.md`, `DATA_CONTRACT.md`, `VERSION`
- `plugins/**`, `plugins-registry/**`, `config/plugins.yml`

**Safe to write** — the user's own work product:

- `data/applications.md` (append rows and edit cells; never rewrite the file wholesale)
- `reports/`, `output/`, `data/research/`, `data/pipeline.md`, `data/follow-ups.md`
- `data/scan-history.tsv` (append only)

**Read but do not modify:** `config/profile.yml`, `cv.md`, `portals.yml`. These
are the user's curated inputs. If a skill concludes something should change
there, say so and show the exact edit — let the user make it.

---

## Tracker format

The tracker is `data/applications.md` in both modes, but the **columns differ**.
Always read the existing header row first and match it. Never impose a layout on
a file that already has one.

**Standalone columns:**

```markdown
| Date Added | Date Applied | Company | Role | Score | Status | Evaluation | Notes |
```

**Host mode (career-ops) columns:**

```markdown
| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
```

career-ops trackers may also carry an optional `Via` column (the agency or
recruiter the application goes through) directly after `Company`:

```markdown
| # | Date | Company | Via | Role | Score | Status | PDF | Report | Notes |
```

Detect it from the header. When present, fill `Via` with the agency name, or
`—` for direct applications. When the end employer is not yet known, career-ops
writes `?` in `Company` and the agency in `Via` — preserve both; never
substitute the word "Confidential" into the `Company` cell.

In host mode the row's identity is its `#` (report number), not the company
name. Never renumber existing rows. To reserve the next number, read the highest
existing `#` and add one.

### Status mapping

The two systems use different state vocabularies. In host mode, write
career-ops's states, not the plugin's:

| This plugin | career-ops | Note |
|---|---|---|
| Evaluated | `Evaluated` | |
| Resume Ready | `Evaluated` | career-ops tracks the resume in the `PDF` column, not the status |
| Applied | `Applied` | |
| Responded | `Responded` | |
| Interview | `Interview` | |
| Offer | `Offer` | |
| Accepted | `Offer` | No career-ops equivalent — record acceptance in `Notes` (`Accepted {date}`) |
| Rejected | `Rejected` | |
| Withdrawn | `Discarded` | |
| Skipped | `SKIP` | |

The full state machine and its legal transitions are in
`${CLAUDE_PLUGIN_ROOT}/references/states.md`.

---

## Evaluation front-matter

**Every** evaluation this plugin writes opens with a `## Machine Summary` YAML
fence, in both modes. This is career-ops's own report format — matching it means
career-ops's `analyze-patterns.mjs`, `upskill.mjs`, and `salary-gap.mjs` can read
reports this plugin produced.

It also exists for a second reason: `compare`, `track`, and `help` need scores
and verdicts across many evaluations. Reading the fence costs a few dozen tokens
per report; reading whole A–F reports costs thousands. **Consumers read the
front-matter, never the full report**, unless the user asked about one specific
role.

```markdown
# Evaluation: {Company} — {Role}

**Date:** {YYYY-MM-DD}
**Archetype:** {detected}
**Score:** {X.X}/5.0
**URL:** {posting URL, or "pasted"}

## Machine Summary

```yaml
company: "{company}"
role: "{role}"
score: {X.X}
archetype: "{detected}"
final_decision: "{Apply | Consider | Research first | Skip}"
hard_stops:
  - "{blocking gap or risk}"
soft_gaps:
  - "{non-blocking gap}"
top_strengths:
  - "{strength most relevant to this role}"
risk_level: "{Low | Medium | High}"
confidence: "{Low | Medium | High}"
next_action: "{one concrete next step}"
advertised_comp: {verbatim JD figure as a quoted string, e.g. "80-90k EUR", or null}
seniority: "{entry | mid | senior | lead | director | vp | c-suite}"
location: "{city, region — or Remote}"
```
```

Rules:

- `score` is numeric only — `4.2`, not `"4.2/5"`.
- `advertised_comp` is the JD's **own** figure, verbatim, or `null` when the JD
  states nothing. Never estimate it and never substitute researched market data
  — market research belongs in Block D of the report body.
- Keep the key names exactly as written. Human-facing headings may be
  translated; these keys may not.
- Do not invent missing data. Limited information means
  `confidence: "Low"` plus an explanation in the report body.

### File naming

| Mode | Path |
|---|---|
| Standalone | `data/evaluations/{company-slug}-{role-slug}-{YYYY-MM-DD}.md` |
| Host | `reports/{next-#}-{company-slug}-{YYYY-MM-DD}.md` |

`{company-slug}` is lowercase, hyphenated, filesystem-safe. In host mode the
report number is the identity — **never rename an existing report file**, even
when a confidential company is later revealed.

---

## Source-of-truth boundary

User-facing content — resumes, cover letters, application answers, outreach
messages — is generated **only** from:

- The profile file for the active mode
- The resume/CV file for the active mode
- `modes/_profile.md` (host mode only)
- Company research this plugin wrote under `data/research/`
- Statements the user makes directly in the current conversation

Anything else is out of scope for content generation: other repositories on the
machine, cross-session recollection, and inference from directory names all
count as out of scope.

**Reorder, reframe, emphasize — never invent.** If a claim is not backed by an
in-scope file, ask the user. If they can't or won't confirm it, the output ships
without it. Silence on a topic is fine; manufactured detail is not.

**Authorship claims are non-negotiable.** Never state that the user built,
authored, or maintains a project, tool, or library unless an in-scope file
attributes it to them. "Used X" becoming "built X" is the most common
fabrication pattern and is flatly forbidden.
