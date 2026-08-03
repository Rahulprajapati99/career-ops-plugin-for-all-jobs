---
name: setup
description: "Set up your job search profile. Paste your resume or answer a few questions. Takes 5 minutes. Needed before evaluating jobs."
argument-hint: "[--reset to start over]"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
---

# Set Up Your Profile

Build the user's job search profile. Conversational, no jargon. For most people
this is the first thing they do with the plugin, so the tone here sets the tone
for everything after.

This command is the **only** place a profile gets created. Other skills that
find no profile route here rather than improvising one — a profile written by a
shortcut path is one the other skills can't read.

## Step 0: Resolve the Layout

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and determine which
layout applies.

**In host mode**, the user already has a career-ops profile at
`config/profile.yml` and a CV at `cv.md`. Do not create a second one. Read what
exists and report it:

> "You already have a career-ops profile — {name}, targeting {roles}. I'll use
> it. Want to change anything?"

If a field this plugin uses is missing from that profile (persona modifiers,
`exclude_keywords`), show the exact YAML to add and let the user add it.
`config/profile.yml` is theirs; propose, don't write.

**In standalone mode**, continue below.

## Step 1: Check for an Existing Profile

Read the profile path. If it exists and there's no `--reset`:

> "You're already set up:
>
> **{Name}** — {title} at {company}
> Looking for: {target role}
>
> Say 'setup --reset' to start fresh, or just tell me what to change and I'll
> update that part."

Otherwise continue.

## Step 2: Welcome

> "Let's set up your profile. This is what lets me evaluate jobs, tailor
> resumes, and write messages that sound like you.
>
> **Fastest way:** paste your resume and I'll pull everything from it.
>
> **Or** I can ask you a few questions instead. Which do you prefer?"

## Step 3A: From a Resume (preferred)

1. Parse it into structured data: name and contact details, LinkedIn, work
   history (title, company, dates, bullets per role), education, skills,
   certifications and licenses, projects.
2. Save the raw text to the resume path for the layout. Keep it verbatim — it's
   the detail source for evaluations and the fact-check reference for anything
   generated later.
3. Ask only for what the resume doesn't contain:
   - "What kind of role are you looking for next?"
   - "Where are you willing to work — remote, a specific city, flexible?"
   - "Target salary range? Skip if you'd rather not say."
   - "Anything else I should know? Career change, a gap, a special situation?"

Where the resume is ambiguous — overlapping dates, an unexplained gap, a title
that doesn't match the described work — ask rather than picking an
interpretation. These are exactly the details that later show up in a cover
letter, and a wrong guess is a wrong claim on a document the user signs.

## Step 3B: By Question (fallback)

One at a time, waiting for each answer:

1. "What's your name?"
2. "What do you do right now — title and company, or 'between jobs'?"
3. "Walk me through your last two or three roles: title, company, how long, and
   one or two things you accomplished."
4. "What kind of role are you looking for? Title and industry."
5. "Where are you willing to work?"
6. "How many years of experience total?"
7. "Your strongest skills — top five to ten?"
8. "Any certifications or licenses?"
9. "Salary range — target and minimum? Skip if you'd rather not."
10. "LinkedIn URL?"
11. "Anything else? Career change, gap, portfolio, special circumstances?"

## Step 4: Build the Profile

Write the profile following
`${CLAUDE_PLUGIN_ROOT}/references/profile-schema.md` exactly. Other skills read
these field names; a renamed field is an invisible break.

- Populate `work_history` with real role detail, not just titles. This is the
  single most load-bearing field for evaluation accuracy.
- Pull quantified achievements into `proof_points`.
- Set persona modifiers from what you actually learned:
  - graduated within two years → `recent_graduate`
  - prior roles in a different industry from the target → `career_changer`
  - a gap over a year in the work history → `career_returner`
  - visa status other than citizen or permanent resident → `international`
- Draft `narrative.headline` and `narrative.superpowers` from their strongest
  material.

Persona modifiers change how every future job gets scored, so name them out loud
in Step 5 rather than setting them silently. Someone who doesn't consider
themselves a career changer should get to say so.

## Step 5: Confirm

> "Here's what I have:
>
> **{Name}** — {title} at {company}
> **Experience:** {years} years
> **Looking for:** {target role} in {industries}
> **Location:** {preference}
> **Key skills:** {top 5}
> **Salary target:** {range}
>
> **Work history:**
> - {Role} at {Company} ({dates})
>
> Look right? I can fix anything now, or you can change it later."

Wait for confirmation and apply corrections before moving on.

## Step 6: Next Steps

Create the tracker if it doesn't exist, using the standalone header from
`data-layout.md`.

> "You're set. From here:
>
> - Paste a job posting and I'll evaluate how well you match
> - Say 'scan {company}' to search a company's careers page
> - Say 'help' to see everything available"
