---
name: triage
description: "Quick-score your pipeline of scan results. Ranks every role in your pipeline by fit and recommends which ones deserve a full evaluation. Use when someone says 'triage my pipeline', 'which scanned jobs should I apply to', 'rank my pipeline', or 'process my scan results'."
argument-hint: "['all', a company name, or 'top 10']"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
---

# Triage Pipeline

Quick-score scan results to find which ones deserve a full evaluation.

## Step 0: Load Context

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Then read the profile, the pipeline file, and the tracker (to exclude
roles already tracked).

If the pipeline is empty:

> "Your pipeline is empty. Scan some companies first — 'scan {company}', or
> 'scan all' for your watchlist."

## Step 1: Determine Scope

- **No argument / "all":** every `New` entry.
- **Company name:** that company's entries only.
- **"top 10":** the first N by relevance score.

Before fetching anything, tell the user how many roles you're about to process
and roughly how long it'll take. Triaging forty postings means forty fetches;
that's worth a heads-up rather than a long silence.

## Step 2: Quick-Score

For each `New` entry:

1. Fetch the full JD if only a URL is stored.
2. Score three dimensions, 0–5 each:
   - **Title fit** — how well the title matches target roles
   - **Requirements fit** — how many stated requirements the profile covers
   - **Logistics fit** — location, seniority, and compensation range
3. The quick score is the average, out of 5.0.

When a fetch fails, score on title and location alone and mark the row
**"partial"**. Do not silently score a posting you couldn't read — a 2.8 from
the full JD and a 2.8 from the title alone carry very different weight, and the
user is about to decide what to skip based on that number.

This is a fit check. No blocks A–F, no STAR stories, no saved report.

## Step 3: Rank & Recommend

```
## Pipeline Triage — {date}

Scored **{n}** roles ({m} partial — JD couldn't be fetched).

### Worth a full evaluation (3.5+)

| # | Company | Role | Score | Why |
|---|---|---|---|---|
| 1 | {company} | {title} | {score}/5 | {one line} |

### Maybe (2.5–3.4)

| # | Company | Role | Score | Why |
|---|---|---|---|---|

### Skip (under 2.5)

| # | Company | Role | Score | Why |
|---|---|---|---|---|
```

The "Why" column must name the deciding factor — the requirement that matched or
the one that didn't. "Good fit" tells the user nothing they can act on.

## Step 4: Update the Pipeline

Write each row's quick score back to the pipeline and move its status from `New`
to `Triaged`. Edit rows in place; don't rewrite the file.

## Step 5: Next Steps

> "{n} roles are worth a full evaluation.
>
> - **Evaluate the top pick:** 'evaluate {company} {role}'
> - **Evaluate all recommended:** I'll work through them one at a time
> - **Scan more companies:** 'scan {company}'"

If the user asks for all recommended, run `evaluate` on each in turn. Full
evaluations are slow and each one writes a report and a tracker row, so confirm
before starting a run of more than about five.
