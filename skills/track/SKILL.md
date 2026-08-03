---
name: track
description: "View and update your job application tracker. See all applications, filter by status, update progress, and get statistics on your search. Use when someone says 'show my applications', 'how is my job search going', 'update status', or 'tracker'."
argument-hint: "[status filter, company name, or 'update Company to Status']"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Application Tracker

View and manage applications in one place.

## Step 0: Load the Tracker

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout, then read the tracker.

**Read its existing header row and use those columns.** The standalone and
career-ops layouts differ, and career-ops trackers may carry an extra `Via`
column. Never impose a column layout on a tracker that already has one — that
silently orphans every existing row.

If the tracker doesn't exist, create it with the standalone header:

```markdown
# Job Applications

| Date Added | Date Applied | Company | Role | Score | Status | Evaluation | Notes |
|---|---|---|---|---|---|---|---|
```

Then say:

> "Your tracker is empty. Paste a job posting and I'll score it to get started."

## Step 1: Parse Intent

| Input | Action |
|---|---|
| No argument, "show tracker", "my applications" | Full table plus stats |
| "show applied", "what's in interview" | Filter by status |
| "show Stripe" | Filter by company |
| "update Acme PM to Interview" | Change one row's status |
| "how's my search going", "stats" | Statistics only |
| "remove the Acme entry" | Confirm, then remove the row |

## Step 2: Display

**Full view:** show the table as it exists, then the stats below it.

**Filtered view:** show matching rows, then:
> "Showing {n} applications with status '{status}'."

**Update flow:**

1. Find the matching row (fuzzy match on company + role is fine).
2. Validate the transition against
   `${CLAUDE_PLUGIN_ROOT}/references/states.md`. If it isn't legal:
   > "Can't move from {old} to {new}. Valid next steps: {list}."
3. Confirm before writing:
   > "Update **{Company} — {Role}** from **{old}** to **{new}**?"
4. On confirmation, edit that row in place. Edit the single cell — never rewrite
   the whole file, and never renumber rows.
5. Moving to `Applied` sets the applied date to today.
6. Moving to `Accepted` deserves an actual congratulations.

In host mode, write career-ops's state vocabulary rather than this plugin's.
The mapping is in `data-layout.md`.

## Step 3: Statistics

Compute these from the tracker table alone. Do **not** open evaluation reports
to build stats — the tracker already holds every field below.

```
## Your Job Search Dashboard

| Metric | Count |
|---|---|
| Total evaluated | {n} |
| Resumes tailored | {n} |
| Applied | {n} |
| Response rate | {responses / applied}% |
| Interviews | {n} |
| Offers | {n} |
| Average score (applied) | {avg}/5.0 |
| Active (non-terminal) | {n} |

**Top scoring opportunities:**
1. {Company} — {Role} ({score}/5.0) — {status}

**Needs attention (applied, no response in 7+ days):**
- {Company} — {Role} — applied {date}
```

Report the response rate honestly. With fewer than about ten applications the
percentage is noise, so give the raw counts instead: "2 responses from 6
applications" says more than "33%".

## Step 4: Suggest Next Actions

- Mostly `Evaluated`: "You've scored these but haven't applied to many. Want
  resumes tailored for your top-scored roles?"
- Several `Applied` with no movement: "Some of these are due a follow-up. Say
  'check my follow-ups' and I'll tell you which ones and draft the messages."
- Any `Interview`: "You have interviews coming up. Want me to research
  {company}?"
- Everything terminal: "This batch is wrapped up. Ready to scan for new roles?"

When evaluations scoring 3.5+ have no tailored resume:

> "You have {n} evaluations at 3.5 or above without a resume. Want me to build
> one for {top company}?"
