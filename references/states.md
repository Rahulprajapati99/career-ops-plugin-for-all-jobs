# Application States

Source of truth for the Status field in the tracker.

## State machine

| State | Meaning | Can move to |
|---|---|---|
| Evaluated | Scored, no action taken yet | Resume Ready, Applied, Skipped |
| Resume Ready | Resume tailored for this role | Applied, Skipped |
| Applied | Application submitted | Responded, Interview, Rejected, Withdrawn |
| Responded | Company replied, not yet an interview | Interview, Rejected, Withdrawn |
| Interview | Interview scheduled or underway | Offer, Rejected, Withdrawn |
| Offer | Offer received | Accepted, Rejected, Withdrawn |
| Accepted | Offer accepted | terminal |
| Rejected | Rejected at any stage | terminal |
| Withdrawn | The user withdrew | terminal |
| Skipped | Decided not to apply after evaluating | terminal |

`Withdrawn` is reachable from any non-terminal state — a candidate can walk away
at any point.

`Evaluated → Applied` skips `Resume Ready` deliberately. People apply with a
resume they already have, and forcing the intermediate state would make the
tracker describe something that didn't happen.

## Rules

1. Status holds exactly one of these values.
2. Read case-insensitively; write in Title Case.
3. Only change a status when the user says the thing actually happened. Drafting
   an application is not applying; scheduling an interview is not attending one.
4. A rejection after an interview is still `Rejected`. Which stage it died at
   belongs in the notes, not in the status.

## Terminal states and follow-up

`follow-up` only considers non-terminal rows, so moving a row to a terminal state
is what stops its reminders. That's why a wrong status costs more than a stale
one: a role left at `Applied` after a rejection keeps generating nudges for a
dead application, and the user stops trusting the list.

## career-ops mapping

In host mode, write career-ops's state vocabulary instead of this one. Its states
are `Evaluated → Applied → Responded → Interview → Offer / Rejected / Discarded /
SKIP`. The full mapping is in
`${CLAUDE_PLUGIN_ROOT}/references/data-layout.md`.

Two states have no direct equivalent there:

- **Resume Ready** — career-ops records the tailored resume in its `PDF` column
  and leaves the status at `Evaluated`.
- **Accepted** — career-ops stops at `Offer`. Record acceptance in the notes as
  `Accepted {date}`.
