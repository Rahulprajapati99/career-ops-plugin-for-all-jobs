---
name: scan
description: "Scan company career pages for job openings that match your profile. Uses web search with site-scoped queries to find listings on Greenhouse, Lever, Ashby, SmartRecruiters, and other ATS platforms. Use when someone says 'scan for jobs', 'check careers page', 'find openings at', or 'search for roles'."
argument-hint: "<company name, careers URL, or 'all' to scan watchlist>"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
---

# Scan for Job Openings

Search company career portals for roles matching the profile.

## Step 0: Load Context

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Then read, from the paths it gives:

1. The profile — target roles, skills, seniority, exclusions.
2. The company watchlist, if one exists.
3. Scan history — for deduplication against postings already seen.
4. The tracker — to exclude roles already being tracked.

If no watchlist exists and the user asked to scan one, offer to seed it from
`${CLAUDE_PLUGIN_ROOT}/templates/portals.example.yml`:

> "You don't have a watchlist yet. Tell me some companies you're interested in
> and I'll build one."

## Step 1: Determine Scope

- **Company name:** look it up in the watchlist for its ATS type and slug. If
  absent, search for the careers page and detect the ATS from the URL.
- **URL:** detect the ATS from the URL pattern. Patterns per platform are in
  `${CLAUDE_PLUGIN_ROOT}/references/ats-endpoints.md`.
- **"all" / "scan my watchlist":** every entry with `enabled: true`.
- **"scan {industry}":** search for companies hiring in that industry, then scan
  their careers pages.

## Step 2: Search

Build site-scoped queries from the ATS type and slug:

| ATS | Query shape |
|---|---|
| Ashby | `site:jobs.ashbyhq.com/{slug} {role keywords}` |
| Lever | `site:jobs.lever.co/{slug} {role keywords}` |
| Greenhouse | `site:job-boards.greenhouse.io/{slug} {role keywords}` |
| SmartRecruiters | `site:jobs.smartrecruiters.com/{slug} {role keywords}` |
| Workday | `site:{tenant}.myworkdayjobs.com {role keywords}` |
| Unknown | `{company} careers {role keywords} {current year}` |

Greenhouse boards index poorly. When a site-scoped Greenhouse query returns
nothing, retry once as `{company} careers {role keywords} greenhouse` before
concluding there are no openings — an empty result there usually means the
crawler hasn't reached the board, not that the company isn't hiring.

Build role keywords from the profile: primary role, secondary roles, and the top
three skills. For a marketing director that's
`marketing director OR head of marketing OR VP marketing`.

Run one query for the primary role and one for secondary roles. Deduplicate by
URL before filtering.

**If search returns nothing for a company:**

> "I couldn't find listings automatically for {company}. Their careers page is
> {url} — browse it and paste anything interesting and I'll evaluate it."

Say which of the two it is: no matching roles, or no results at all. They mean
different things and the user's next move differs.

## Step 3: Filter & Score

For each listing:

1. **Title relevance** against target roles. Drop titles matching the profile's
   `exclude_keywords` or clearly outside the target seniority.
2. **Relevance score, 0–10:**
   - Title match to target roles: 0–4
   - Skill/keyword overlap with the profile: 0–3
   - Location or remote match: 0–2
   - Seniority alignment: 0–1
3. **Deduplicate:** skip URLs already in scan history, and company + title pairs
   already in the tracker.

This is title-and-metadata scoring only. It is not a fit assessment — that's
what `triage` and `evaluate` are for, and presenting it as one would mislead.

## Step 4: Output

```
## Scan Results: {Company} — {date}

Found **{X}** openings, **{Y}** matching your profile.

### Matches

| # | Role | Location | Relevance | Link |
|---|---|---|---|---|
| 1 | {title} | {location} | {score}/10 | {URL} |

### Filtered Out ({Z})
{Grouped reasons: "3 junior roles, 2 outside your target function, 1 on-site in {city}"}
```

Give the filtered-out reasons by group rather than listing every row. The user
needs to know whether the filter is behaving, not to review each rejection.

## Step 5: Save

Append matches to the pipeline file:

```markdown
| Date Found | Company | Role | Relevance | URL | Status |
|---|---|---|---|---|---|
| {today} | {company} | {title} | {score}/10 | {url} | New |
```

Log **everything seen**, matched and filtered, to scan history. That's what makes
the next scan cheap — without it, every scan re-processes the same postings.

In host mode, scan history is career-ops's `data/scan-history.tsv`: tab-separated,
append-only, nine columns. Match the column order of the existing rows and leave
the fingerprint column empty rather than inventing a value — career-ops computes
that hash itself and a fabricated one would corrupt its cross-listing detection.

## Step 6: Next Steps

> "Found {Y} matching roles at {company}.
>
> - **Evaluate** the top match: 'evaluate #1'
> - **Triage** the whole pipeline: 'triage my pipeline'
> - **Scan** another company: 'scan {company}'"
