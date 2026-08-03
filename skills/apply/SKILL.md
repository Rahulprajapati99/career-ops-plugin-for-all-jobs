---
name: apply
description: "Help fill out a job application form. Generates personalized answers for every field using your profile and evaluation. Never auto-submits. Use when someone says 'help me apply', 'fill out this application', or 'application for'."
argument-hint: "<company name, or 'help me with this application'>"
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
---

# Application Form Assistant

Draft honest, personalized answers for a job application form.

**Never submit an application.** Show the user every answer and get explicit
confirmation before touching a form. Stop before any submit button, every time,
including when the user says to go ahead and submit — the final click is theirs.

## Step 0: Load Context

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Then read the profile, the resume/CV, the evaluation for this role, the
company research file if one exists, and check for a tailored resume.

If there's no evaluation for this company:

> "I haven't evaluated this role yet. Want me to score the posting first? It
> gives me the specifics that make these answers worth submitting."

## Step 1: Identify the Application

- **Company or role named:** find the matching evaluation.
- **"Help me with this application":** ask which role. If computer use is
  available and the form is on screen, a screenshot can identify it.

## Step 2: Standard Fields

| Field | Source |
|---|---|
| Name, email, phone | Profile |
| Resume upload | Point at the tailored resume file |
| Cover letter | Step 3 |
| "Why this company?" | Research plus the evaluation |
| "Why this role?" | Evaluation Block C plus the profile narrative |
| Years of experience | Profile — the honest number |
| Salary expectations | Evaluation Block D plus the profile target |
| Work authorization | Profile |
| Willing to relocate | Profile work preference |
| Start date | Ask the user |

Where the profile doesn't answer a field, ask. Don't infer work authorization,
notice period, or salary from context — these are the fields where a plausible
guess becomes a misrepresentation on a document the user signs.

## Step 3: Cover Letter

250–350 words, four moves:

1. **Opening** — a specific hook about the company. Not "I'm excited to apply."
2. **Bridge** — how this background connects to their stated need.
3. **Evidence** — two or three concrete accomplishments relevant to this role.
4. **Close** — forward-looking, confident, not presumptuous.

Match the JD's language and the company's register: formal for a law firm,
plainer for an early-stage startup. Every claim traces to the profile.

## Step 4: Custom Questions

**Short answer (under 500 characters):** draw from the evaluation, profile, or
research. Include a number or a concrete detail.

**Behavioral ("tell me about a time..."):** use the STAR story from evaluation
Block F that best matches the question.

**Salary expectations:** the profile's target, informed by Block D market data.
A range if they ask for a range; the midpoint if they demand one number.

**Yes/no (authorization, relocation, sponsorship):** answer directly from the
profile, or ask.

**EEO and demographic questions:** these are voluntary and legally cannot affect
candidacy. Say that, and leave them for the user to answer themselves. Don't
draft them.

## Step 5: Present Everything

Show every generated answer before any action:

```
## Application Answers: {Company} — {Role}

**Cover letter:**
{full text}

**"Why this company?"**
{answer}

**Salary expectations:** {answer}

**Custom questions:**
1. "{question}" — {answer}
```

Then:

> "Review these. You can ask me to revise any of them, adjust the tone, or copy
> them straight into the form."

## Step 6: Computer Use

Only if computer use is available **and** the user explicitly asks for help
filling the form:

1. Navigate to the application page.
2. Fill each field with the **approved** answers only — nothing improvised to
   fit a field you hadn't seen.
3. If the form has a field that wasn't in the approved set, stop and ask. Don't
   fill it.
4. **Stop before Submit.** Screenshot the filled form and say:

> "Everything's filled in. Please review it and click Submit yourself when
> you're ready — I won't click it for you."

Without computer use:

> "Copy the answers above into the form. Tell me when you've submitted and I'll
> update your tracker."

## Step 7: Update the Tracker

After the user confirms they submitted — not before, and not on the assumption
that they will — set the status to `Applied` and the applied date to today.
Match the tracker's existing columns and status vocabulary per `data-layout.md`.

Then seed the follow-up clock:

> "Tracked. The usual follow-up window is about a week — say 'check my
> follow-ups' any time and I'll tell you who's due and draft the message."
