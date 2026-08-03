---
name: compare
description: "Compare multiple job opportunities side by side. See scores, compensation, pros/cons, and a recommendation. Use when someone says 'compare my options', 'which job should I take', 'rank my opportunities', or 'compare these roles'."
argument-hint: "[company names to compare, or 'my top options']"
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
---

# Compare Opportunities

Side-by-side comparison of evaluated opportunities.

## Step 0: Load Context

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Read the tracker to get each role's current status.

## Step 1: Select Opportunities

- **User named companies or roles:** match them against the tracker (fuzzy
  matching is fine).
- **"My top options" / no argument:** take the top 3–5 by score whose status is
  non-terminal (`Evaluated`, `Resume Ready`, `Applied`, `Responded`,
  `Interview`, `Offer`).
- **Fewer than 2 evaluations exist:**
  > "You need at least two evaluated roles to compare. Paste a job posting and
  > I'll score it."

## Step 2: Read Only the Machine Summaries

Glob the evaluations directory for the selected roles. For each one, read
**only** the `## Machine Summary` YAML fence — not the full report.

Use `Grep` with `-A 20` for `^## Machine Summary` to pull the fence directly.
A full A–F report runs thousands of tokens; the fence runs a few dozen, and it
already carries everything this comparison needs: `score`, `archetype`,
`final_decision`, `hard_stops`, `soft_gaps`, `top_strengths`, `risk_level`,
`confidence`, `advertised_comp`, `seniority`, `location`.

Read a full report **only** when the user asks about one specific role in depth,
and then read just that one.

If an evaluation predates the machine summary and has no fence, fall back to
reading that file and say so once:

> "{Company} was evaluated before the summary format — I read the full report
> for that one."

## Step 3: Comparison Table

```
## Opportunity Comparison

| Dimension | {Company A: Role} | {Company B: Role} | {Company C: Role} |
|---|---|---|---|
| **Score** | {X.X}/5.0 | {X.X}/5.0 | {X.X}/5.0 |
| **Archetype** | {archetype} | | |
| **Seniority** | {seniority} | | |
| **Location** | {location} | | |
| **Advertised comp** | {advertised_comp, or "Not disclosed"} | | |
| **Strongest match** | {top_strengths[0]} | | |
| **Biggest gap** | {hard_stops[0], else soft_gaps[0]} | | |
| **Risk** | {risk_level} | | |
| **Status** | {from tracker} | | |
```

The **Advertised comp** row shows what each posting actually stated. Where a
posting disclosed nothing, write "Not disclosed" — do not substitute a market
estimate, because a researched range next to a real range in the same row reads
as though both are facts.

## Step 4: Pros and Cons

Three pros and two cons per opportunity, each traceable to a specific field in
that role's machine summary. "Good culture fit" is not a con; "hard stop: role
requires an active PMP, which isn't in your profile" is.

```
### {Company} — {Role}
**Pros:**
- {from top_strengths}
- {compensation or location advantage}
- {trajectory fit}

**Cons:**
- {from hard_stops}
- {from soft_gaps}
```

## Step 5: Recommendation

```
## My Recommendation

**Best overall match:** {Company — Role} ({score}/5.0)
{2-3 sentences on why it stands out}

**Best growth opportunity:** {Company — Role}
{1-2 sentences on the upside if the gaps close}

**Safest option:** {Company — Role}
{1-2 sentences on which is most likely to convert to an offer}
```

Where `confidence` is `Low` on any role in the comparison, say so — a 4.2 scored
with low confidence and a 4.2 scored with high confidence should not be ranked
against each other silently.

When the top scores sit within 0.3 of each other:

> "These are genuinely close. The tiebreaker is which company and role excites
> you most — numbers can't measure that."

## Step 6: Next Steps

> "Want me to:
> - **Tailor a resume** for your top pick?
> - **Research** any of these companies more deeply?
> - **Evaluate** another posting?"
