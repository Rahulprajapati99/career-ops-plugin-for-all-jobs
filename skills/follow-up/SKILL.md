---
name: follow-up
description: "Find applications that are overdue a follow-up and draft the message to send. Shows how long each application has been waiting, who to contact, and what to say. Use when someone says 'check my follow-ups', 'who should I follow up with', 'any applications going cold', 'should I chase this up', or 'draft a follow-up to Acme'."
argument-hint: "[company name, or nothing to check everything]"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Follow-up Cadence

Find which applications are past due for a nudge, and write the nudge.

## Step 0: Load Context

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Then read the profile, the tracker, and the follow-up history file if it
exists.

If nothing in the tracker has status `Applied`, `Responded`, or `Interview`:

> "Nothing to follow up on yet — none of your applications are out with a
> company. Come back once you've applied to a few."

## Step 1: Resolve the Cadence

Defaults, in days:

| Situation | Wait before first follow-up | Wait before the next | Max follow-ups |
|---|---|---|---|
| Applied, no response | 7 | 7 | 2 |
| Company responded | 1 | 3 | — |
| After an interview | 1 (thank-you) | 7 | — |

Read the profile for a `followup_cadence` block and let it override any of
these. career-ops profiles use exactly these key names
(`applied_first_days`, `applied_subsequent_days`, `applied_max_followups`,
`responded_initial_days`, `responded_subsequent_days`,
`interview_thankyou_days`), so a user who already tuned their cadence there
keeps it.

## Step 2: Classify Each Application

For every non-terminal row, compute days elapsed since the applied date (or
since the last recorded follow-up, if later) and classify:

| Class | Meaning |
|---|---|
| **Urgent** | The company responded and is waiting on the user. Answer within 24 hours. |
| **Overdue** | Past the cadence window with no reply. |
| **Waiting** | Inside the window. Nothing to do yet. |
| **Cold** | Already had the maximum follow-ups with no reply. |

Where a row has no applied date, say so rather than guessing one — an invented
date produces a confident, wrong "14 days overdue."

## Step 3: Dashboard

Sort urgent first, then overdue, then waiting, then cold.

```
## Follow-up Status — {date}

{n} active applications, {m} need action.

| Company | Role | Status | Days | Sent | Next | State |
|---|---|---|---|---|---|---|
| {company} | {role} | {status} | {n} | {n} | {date} | Urgent |
```

If nothing needs action, say that plainly and stop. Don't manufacture work:

> "Nothing's due. The closest is {company}, ready for a nudge on {date}."

## Step 4: Draft the Messages

Draft only for **urgent** and **overdue** entries. For each, read that role's
evaluation machine summary for context — not the full report.

**First follow-up** — three or four sentences:

1. The specific role and when they applied.
2. One concrete value-add: a Block B match or a proof point from the profile,
   quantified where possible.
3. A soft ask with a real time window.
4. Optionally, one relevant recent development.

Rules:

- Under 150 words. Include a subject line.
- Professional and warm. Not apologetic, not desperate.
- **Never** open with "just checking in", "just following up", "touching base",
  or "circling back". These are the four phrases that mark a message as
  skippable, and recruiters skip them.
- Lead with value; the ask comes after.
- Reference something specific to *that* company. If there's nothing specific to
  say, the message isn't ready — offer to research them first.

**Second follow-up** — shorter, two or three sentences, and a genuinely new
angle: a relevant insight, an article, a project update. Repeating the first
message with different wording is worse than sending nothing.

**Cold (max follow-ups reached):** don't draft a third. Say:

> "{Company} has had {n} follow-ups with no reply. Options: mark it
> `Withdrawn` if the role looks filled, try a different contact — I can find one
> — or leave it open and stop chasing."

**After an interview:** a thank-you within a day, referencing something specific
that was actually discussed. If the user hasn't told you what was discussed, ask
before drafting — a generic thank-you note is worse than a late specific one.

## Step 5: Present

```
## Follow-up: {Company} — {Role}

**To:** {contact from research, or "no contact found"}
**Subject:** {subject}
**Days since applying:** {n}   **Follow-ups sent:** {n}
**Channel:** Email / LinkedIn

{draft}
```

Where no contact is known:

> "I don't have a contact at {company}. Want me to research them and find the
> right person first?"

For LinkedIn, hold to 300 characters — same hook, proof, and ask structure the
`outreach` skill uses.

## Step 6: Record

Only after the user confirms they sent it, append to the follow-up history file:

```markdown
| Date | Company | Role | Channel | Follow-up # | Contact | Note |
|---|---|---|---|---|---|---|
```

Never record a follow-up you drafted but the user hasn't sent — the next run
computes its cadence from this file, so a premature row pushes the real
follow-up a week late.

If the user says the company replied, offer to move the row to `Responded`,
validating the transition against
`${CLAUDE_PLUGIN_ROOT}/references/states.md`.
