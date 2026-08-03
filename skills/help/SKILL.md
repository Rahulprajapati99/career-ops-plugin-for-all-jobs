---
name: help
description: "See all available career-ops skills, what they do, and which one to use next based on where you are in your job search. Use when someone says 'help', 'what can you do', 'how does this work', or seems unsure what to do next."
argument-hint: "[skill name for detailed help]"
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - Grep
---

# career-ops Help

Point the user at the right next action for where they actually are.

## Step 0: Check State

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Then establish state **cheaply**:

- `Glob` the profile path — does it exist?
- `Glob` the evaluations directory — how many files?
- `Glob` the resumes directory — how many files?
- Read the tracker for statuses and scores.

That is enough for everything below. Do not open evaluation reports here; the
tracker already carries company, role, score, and status.

Mention the layout only when it's host mode and this is the first time it has
come up in the session:

> "You're in a career-ops checkout, so I'm using your existing tracker and CV."

## Step 1: Show the Skill Directory

If the user asked about one specific skill, show detailed help for that skill
only. Otherwise:

```
## career-ops — Your Job Search Copilot

| Skill | What It Does | Try Saying |
|---|---|---|
| **evaluate** | Score a posting against your background (blocks A-F) | "Evaluate this job posting" |
| **tailor-resume** | ATS-safe resume for one specific role | "Tailor my resume for Acme" |
| **scan** | Search company career portals for openings | "Scan Google for jobs" |
| **triage** | Quick-score a pipeline of scan results | "Triage my pipeline" |
| **track** | Application tracker and search stats | "Show my applications" |
| **follow-up** | Who's overdue a nudge, and the message to send | "Check my follow-ups" |
| **apply** | Answers for an application form | "Help me with this application" |
| **research** | Company brief before applying or interviewing | "Research Stripe" |
| **outreach** | LinkedIn and email messages to contacts | "Draft outreach to the hiring manager" |
| **compare** | Opportunities side by side | "Compare my top options" |

**Commands:**

| Command | What It Does |
|---|---|
| **setup** | Create or update your profile |
| **quick-eval** | Score plus one paragraph, no full report |
```

## Step 2: Suggest the Next Action

Pick the single most useful next step for their state. One suggestion, not a
menu — a list of five options is the same as no recommendation.

**No profile:**
> "Start here: paste your resume, or just tell me about yourself, and I'll set
> up your profile."

**Profile, no evaluations:**
> "You're set up. Paste a job posting — URL or text — and I'll score how well
> you match."

**Evaluations, no resumes:**
> "You have {n} evaluations. Your top match is **{company} — {role}**
> ({score}/5.0). Want a resume tailored for it?"

**Resumes, nothing applied:**
> "You have resumes ready for {n} roles. Say 'help me with the {company}
> application' and I'll draft your form answers."

**Applied, some overdue:**
> "{n} of your applications are past the follow-up window. Say 'check my
> follow-ups' and I'll tell you which ones and draft the messages."

**Has interviews:**
> "You have interviews coming up. Want me to research {company} to prep?"

**Everything terminal:**
> "This batch is wrapped up. Ready to scan for new openings?"

## Step 3: Workflow Overview

Only when the user asks how the system works:

```
## The career-ops Workflow

1. Set up your profile (once, about five minutes)
2. Evaluate postings — paste a JD, get an honest A-F assessment
3. Tailor your resume for the strong matches
4. Apply with personalized form answers
5. Track applications and follow up on time

Discovery tools, usable at any point:
- scan      find openings on company career pages
- research  company brief before applying or interviewing
- outreach  message a contact at a target company
- compare   weigh multiple opportunities against each other
```

If the layout is host mode, add:

> "Because you're in a career-ops checkout, these skills read and write your
> existing files — the same tracker, CV, and reports the career-ops modes use.
> There's no second copy of your data."
