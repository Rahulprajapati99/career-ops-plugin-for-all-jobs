---
name: outreach
description: "Draft personalized outreach messages for LinkedIn connections, hiring managers, or recruiters. Creates targeted messages using a hook + proof + proposal structure. Under 300 characters for connection requests. Use when someone says 'draft outreach', 'message the recruiter', 'reach out to', or 'write a LinkedIn message'."
argument-hint: "<contact name and company, or 'outreach for Company'>"
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - WebSearch
---

# Draft Outreach

Personalized messages for job search networking.

## Step 0: Load Context

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md` and resolve the active
layout. Read the profile, the company research file if one exists, and the
machine summary of any evaluation at this company.

Without research on the company:

> "I don't have research on {company} yet. Specific beats generic by a wide
> margin here. Want me to research them first, or draft with what I have?"

## Step 1: Identify the Contact

Parse for name, title, company, and platform. Where no contact is named, offer
the ones in the research file:

> "From my research, here are contacts at {company}: {list}. Who do you want to
> reach?"

## Step 2: Pick the Message Type

| Type | When | Length |
|---|---|---|
| LinkedIn connection request | Not connected | Under 300 characters, hard limit |
| LinkedIn message | Already connected | 100–200 words |
| Cold email | You have their address | 100–150 words |
| Follow-up | No response after 5+ days | 50–75 words |

Ask which, if context doesn't make it obvious.

## Step 3: Hook + Proof + Proposal

**Hook — about them, not you.** Something specific: their work, a launch, a
recent event from the research.

> Weak: "I'm really interested in your company." (about you)
> Weak: "I'd love to connect." (generic)
> Better: "Your team's work on {specific launch} caught my attention."

**Proof — one quantifiable thing about you.** One sentence, one number,
relevant to their world.

> Weak: "I have 10 years of experience in marketing."
> Better: "I grew organic traffic 3× at {Company} in eight months."

Pull the proof point from the profile that connects to this company's actual
situation. The strongest number in the profile is not always the right one.

**Proposal — a low-pressure ask.**

> Weak: "Can you refer me?" (presumptuous)
> Weak: "I'd love to pick your brain." (vague, one-sided)
> Better: "Would you be open to 15 minutes on what {team} looks for?"

## Step 4: Output

```
## Outreach: {Contact} at {Company}

**Platform:** {type}
**Context:** {role or department}

---
{the message, formatted as it will be sent}
---

**Characters:** {n} / {limit}
**Tone:** {Professional / Warm / Direct}
```

For connection requests, the character count is a hard constraint, not a target.
Over the limit means the message gets truncated mid-sentence — cut it down
rather than sending it long.

## Step 5: Variations

> "Want me to:
> - **Adjust the tone?** More formal, warmer, more direct
> - **Rewrite for another platform?** Email instead of LinkedIn
> - **Draft the follow-up** for a week from now if they don't reply?"

## Rules

- Never misrepresent the user's background.
- Never imply a connection, referral, or shared history that doesn't exist —
  including soft versions like "I've been following your work for years."
- No flattery. Recruiters read hundreds of these and it reads as filler.
- Every message contains something specific to this company. If you can't find
  one specific true thing to say, the message isn't ready:
  > "This would be stronger with real company context. Want me to research them
  > first?"
