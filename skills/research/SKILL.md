---
name: research
description: "Research a company before applying or interviewing. Get an intelligence brief with culture, financials, recent news, team structure, key contacts, and smart interview questions. Use when someone says 'research this company', 'tell me about', 'what do you know about', or 'prep me for my interview at'."
argument-hint: "<company name>"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - WebSearch
  - WebFetch
---

# Company Research

Build an intelligence brief on a target company.

## Step 0: Load Context

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Check the evaluations directory for an existing evaluation at this
company — if one exists, read its machine summary so the brief can speak to the
specific role rather than the company in general.

## Step 1: Gather

Search for:

1. **Basics** — what they do, size, founded, HQ, funding or revenue
2. **Recent news, last six months** — launches, layoffs, acquisitions,
   leadership changes, funding
3. **Culture signals** — Glassdoor rating and recurring themes, awards,
   controversies
4. **Team** — who leads the department, likely hiring manager, team size
5. **Tools and methods** — what this team actually uses, from job postings, the
   engineering or company blog, and public profiles

Date every claim. Company facts go stale fast, and a funding round from two
years ago presented as current is worse than no information in an interview.

If WebSearch is unavailable:

> "For current information — recent news, reviews, team changes — I'd need web
> search enabled. Here's what I know from general knowledge, which may be out of
> date:"

Then label it clearly as such.

## Step 2: Find Contacts

Look for the hiring manager (head of the relevant department), a recruiter for
that function, and potential peers worth an informational conversation.

Use public web results and company pages. Do not scrape LinkedIn profiles. For
each contact, record the name, title, and where you found it — the source is
what lets the user judge whether it's current.

## Step 3: Output

```
## Company Brief: {Company}

### Overview
| Field | Detail |
|---|---|
| **Industry** | |
| **Size** | |
| **Founded** | |
| **HQ** | |
| **Revenue/Funding** | |
| **Website** | |

### Recent News (last 6 months)
- {headline} — {source}, {date}

### Culture Snapshot
**Glassdoor:** {rating}/5 from {n} reviews
**Positive themes:** {what employees consistently like}
**Negative themes:** {consistent complaints}
**Work style:** {remote/hybrid/on-site, hours culture}

### Key Contacts
| Name | Title | Source |
|---|---|---|

### Interview Intelligence
- **What they emphasize:** {values, mission, how they talk about themselves}
- **Current priorities:** {what they're working on now}
- **Questions worth asking:**
  1. {grounded in recent news or strategy}
  2. {about the team}
  3. {about the role's impact}
- **Handle carefully:** {sensitive topics — layoffs, a public incident, a
  departure}
```

Where a section turned up nothing, write "No {x} found" rather than filling it
with plausible generalities. An empty Recent News section is a real finding: a
company with no news in six months is a different prospect from one with three
funding rounds.

## Step 4: Save

Write to the research path for the active layout, as `{company-slug}.md`.

> "Research saved.
>
> - **Draft outreach** to one of these contacts?
> - **Evaluate a role** here? Paste the posting.
> - **Prep interview stories** for this company?"
