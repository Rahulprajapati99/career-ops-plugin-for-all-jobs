# Industry Archetypes

An archetype is the lens a job posting should be read through. Detect it from
the posting, then load **only that archetype's lens file** — not all fifteen.

## Detection keywords

| Archetype | Lens file | Detection keywords |
|---|---|---|
| Technology/Engineering | `lenses/technology.md` | software, developer, engineer, DevOps, cloud, API, code, data science, ML, AI, product manager (at a tech company), IT, full stack, backend, frontend |
| Finance/Accounting | `lenses/finance.md` | CPA, CFA, audit, compliance, risk, portfolio, financial analyst, controller, bookkeeping, banking, fintech, treasury, tax |
| Healthcare/Medical | `lenses/healthcare.md` | RN, MD, clinical, patient, HIPAA, EMR, nursing, therapy, pharmaceutical, medical device, radiology, surgical |
| Legal/Compliance | `lenses/legal.md` | JD (Juris Doctor), bar admission, litigation, contract, paralegal, regulatory, counsel, compliance officer, IP, patent |
| Creative/Marketing/Design | `lenses/creative.md` | designer, copywriter, content, brand, UX, SEO, social media, art director, creative director, campaign, video, photography |
| Operations/Supply Chain | `lenses/operations.md` | logistics, warehouse, procurement, supply chain, inventory, fleet, distribution, operations manager, fulfillment |
| Sales/Business Development | `lenses/sales.md` | quota, revenue, pipeline, account executive, BDR, SDR, territory, commission, sales engineer, enterprise sales |
| Education/Training | `lenses/education.md` | teacher, professor, curriculum, instructional, K-12, higher ed, training specialist, academic, dean, provost |
| Executive/Leadership | `lenses/executive.md` | CEO, COO, CFO, VP, SVP, senior director, P&L, board, strategy, transformation, C-suite, general manager |
| Trades/Skilled Labor | `lenses/trades.md` | electrician, plumber, HVAC, welder, machinist, carpenter, foreman, journeyman, apprentice, CDL, mechanic |
| Customer Success/Support | `lenses/customer-success.md` | customer success, account manager, implementation, onboarding, retention, NPS, CSAT, support engineer, technical support |
| People/HR | `lenses/people-hr.md` | recruiter, talent acquisition, HRBP, people operations, benefits, compensation, SHRM, PHR, SPHR, DEI, employee relations |
| Government/Nonprofit | `lenses/government-nonprofit.md` | GS-level, clearance, public policy, grant, program officer, civic, federal, state, municipal, NGO, foundation |
| Scientific/R&D | `lenses/scientific.md` | PhD, research, lab, publications, principal investigator, biotech, chemistry, physics, clinical trials, peer review |
| Non-Software Engineering | `lenses/non-software-engineering.md` | PE, civil, mechanical, electrical, structural, chemical engineer, CAD, FEA, project engineer, EIT, construction |

## Detection algorithm

1. Count keyword hits across all archetype rows.
2. Weight by where the hit occurred: **title ×3**, **requirements ×2**,
   **description ×1**.
3. Highest total is the PRIMARY archetype.
4. If the runner-up scores within 50% of the primary, record it as SECONDARY.
5. Read `${CLAUDE_PLUGIN_ROOT}/references/lenses/{primary}.md`. Read the
   secondary's lens too **only** when the two sit in genuinely different domains
   and the secondary changes the advice.

Example: "Marketing Director at a hospital" detects PRIMARY Creative/Marketing,
SECONDARY Healthcare. Read the creative lens for how to evaluate the role. The
healthcare context informs domain-match scoring but does **not** trigger the
PASS/FAIL credential rule, because the role itself is not clinical.

## When PASS/FAIL applies

Healthcare, Legal, Trades, and Non-Software Engineering carry PASS/FAIL
credential rules — but only when that archetype is **PRIMARY**. A marketing role
at a hospital is not subject to nursing licensure. The full rules are in
`${CLAUDE_PLUGIN_ROOT}/references/scoring-rubric.md`.
