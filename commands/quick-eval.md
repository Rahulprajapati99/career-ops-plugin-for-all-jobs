---
name: quick-eval
description: "Quick job evaluation. Paste a JD and get a score plus one-paragraph summary. Faster than a full evaluate. Use when someone says 'quick eval', 'quick score', or 'just give me a number'."
model: haiku
argument-hint: "<paste JD or URL>"
user-invocable: true
allowed-tools:
  - Read
  - Glob
  - WebFetch
---

# Quick Evaluation

A score and a paragraph. No blocks A–F, no saved report, no tracker row. This is
a triage tool for deciding whether a posting deserves a real evaluation.

## Step 0: Load Profile

Read `${CLAUDE_PLUGIN_ROOT}/references/data-layout.md`, resolve the layout, and
read the profile. If there's no profile:

> "Run setup first so I have something to score against."

## Step 1: Parse the Posting

Pasted text, a URL (fetch it), or a file path. Extract title, company, location,
key requirements, and seniority signals.

## Step 2: Score

Score 1.0–5.0 across three things:

- Hard requirement coverage against the profile's skills and experience — 50%
- Seniority alignment — 25%
- Domain and industry match — 25%

Read `${CLAUDE_PLUGIN_ROOT}/references/archetypes.md` only far enough to detect
the archetype. If it's Healthcare, Legal, Trades, or Non-Software Engineering,
apply the PASS/FAIL credential rule: a required license the profile doesn't have
caps the score at 2.0, and the reason gets stated explicitly.

Don't load the lens files here. Full lens analysis belongs to `evaluate`; this
command exists to be fast.

## Step 3: Output

```
**{Score}/5.0** — {Company}: {Role}

{One paragraph: what matches, what doesn't, and whether it's worth a full
evaluation. Specific, not generic.}

Want the full A-F analysis? Say "evaluate this".
```

Say when the score is uncertain — a posting that's vague about requirements
produces a soft number, and presenting it as precise is the failure mode of a
quick score. "Roughly 3.5, but the posting is thin on specifics" is more useful
than "3.5".

Nothing is written to disk. If the user wants this tracked, they want
`evaluate`.
