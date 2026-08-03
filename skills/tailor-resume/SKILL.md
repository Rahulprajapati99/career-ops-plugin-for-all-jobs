---
name: tailor-resume
description: "Generate an ATS-optimized resume tailored to a specific job posting. Creates clean HTML you can print to PDF. Works for any industry. Use when someone says 'tailor my resume', 'make me a resume', 'create a resume for', or 'update my resume for'."
argument-hint: "<company name, or 'for the latest evaluation'>"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Tailor Your Resume

Generate an ATS-safe resume for one specific posting.

## Step 0: Load Context

1. Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
   layout.
2. Read `${CLAUDE_PLUGIN_ROOT}/references/ats-rules.md`.
3. Read the profile and the resume/CV file.
4. Find the target evaluation:
   - Named company or role: search the evaluations directory for a match.
   - "Latest" or no argument: the most recent evaluation file.
   - Ambiguous: list the recent ones and ask which.

Read the full target evaluation — this skill needs Block E, so the machine
summary alone isn't enough. It's one file, not the whole directory.

If no evaluation exists for this role:

> "I need to evaluate the posting first so I know what to emphasize. Paste it
> and I'll score it, then build the resume."

Tailoring without an evaluation produces a generic resume with the company's
name on it, which is worse than the user's existing one.

## Step 1: Extract Keywords

From the evaluation and the JD, pull 15–20 terms an ATS will scan for:

- Exact phrases from "Required Qualifications" — highest priority
- Industry-standard terms, not creative synonyms
- Named certifications, tools, and methodologies
- Action verbs matching the responsibilities section

## Step 2: Detect Language & Paper Size

| JD language | Company location | Output |
|---|---|---|
| English | US | Letter, 8.5" × 11" |
| English | Non-US | A4 |
| Other | Any | Match the JD's language, A4 |

The resume's language must match the JD's. A German-language posting gets a
German resume.

## Step 3: Build the Content

Use the evaluation's Block E as the plan, and the profile as the only source of
facts.

**Professional Summary** (3–4 lines): years of experience and core identity,
three to five JD keywords worked in naturally, and a closing line connecting to
this specific role.

**Experience:** every role from work history, most relevant first. Company,
title, and dates on one line. Three to five bullets per role, ordered by
relevance to this JD. Each bullet is an action verb, what they did, and a
quantified result. Mirror the JD's exact wording — if it says "project
management", write "project management", not "programme management".

**Education:** degree, school, year. Coursework and honors only for recent
graduates.

**Skills:** JD keywords first, then the rest. Group by category past ten skills.
Give both forms on first use: "Search Engine Optimization (SEO)".

**Certifications** (when the profile has any): type, status, jurisdiction, and
number where relevant. For the PASS/FAIL archetypes — healthcare, legal, trades,
non-software engineering — this section goes directly under the summary, above
experience. It's the first thing that gets checked.

**Projects / Portfolio:** only where the archetype values it, and only when
relevant to this role.

Everything here comes from the profile and resume. The source-of-truth boundary
in `data-layout.md` applies: reorder, reframe, emphasize — never invent. If Block
E suggests emphasizing something the profile doesn't support, say so and leave
it out rather than writing it in.

## Step 4: Generate HTML

Read `${CLAUDE_PLUGIN_ROOT}/references/resume-template.html` and fill every
`{{PLACEHOLDER}}`.

Non-negotiable ATS constraints from `ats-rules.md`: single column, standard
section headers spelled exactly ("Experience", "Education", "Skills"), no images
or icons, all text selectable, standard fonts, 10–12pt body, 0.5–1in margins, no
running headers or footers, no JavaScript, two pages maximum.

## Step 5: Output

Write to the resumes path for the active layout, named
`{company-slug}-{role-slug}.html`.

Show the user the content, not the markup:

```
## Resume Preview: {Name} — {Role} at {Company}

**Summary:** {first two lines}

**Experience:**
- {Role} at {Company} ({dates}) — {first bullet}

**Skills:** {top 10}

**Keywords matched:** {n} of {total} from the JD
```

If the keyword match is low, say which ones didn't make it and why — usually
because the profile has no evidence for them. That's useful information: it's
the gap list for the interview.

## Step 6: PDF

> "Saved to `{path}`.
>
> **To make a PDF:** open it in your browser, press Cmd+P (Mac) or Ctrl+P
> (Windows), and choose Save as PDF. The HTML is built to print cleanly."

## Step 7: Update the Tracker

Set this role's status to `Resume Ready` if it's currently `Evaluated`, and note
the resume filename. Match the tracker's existing columns and status vocabulary
per `data-layout.md` — in host mode, career-ops records the resume in its `PDF`
column and leaves the status at `Evaluated`.

## Step 8: Next Steps

> "Resume is ready.
> - **Review it** by opening the HTML file
> - **Apply:** 'help me with the {company} application'
> - **Compare** against your other options: 'compare my options'"
