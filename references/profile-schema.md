# Profile Schema Reference

Every field in the profile file. Edit it directly, or run the **setup** command
to fill it conversationally.

The profile lives at `data/profile.yml` in standalone mode. Inside a career-ops
checkout the plugin reads career-ops's own `config/profile.yml` instead — see
`${CLAUDE_PLUGIN_ROOT}/references/data-layout.md`. That file uses different field
names; the plugin reads them where they overlap and asks about the rest rather
than rewriting a file the user maintains.

## Fields

```yaml
# === Identity ===
name: "Your Name"
email: "your@email.com"           # Optional. Used in resume header.
phone: ""                          # Optional. Used in resume header.
linkedin_url: ""                   # Optional. Used in resume + outreach.
portfolio_url: ""                  # Optional. Used in creative/tech resumes.
location: "City, State/Country"
work_preference: "remote"          # remote | hybrid | onsite | flexible
visa_status: ""                    # Optional. "US Citizen", "H-1B", "Green Card", etc.

# === Current State ===
current:
  title: "Current Job Title"
  company: "Current Company"
  years_experience: 8              # Total years of professional experience

# === Target ===
target:
  primary_role: "Senior Product Manager"
  secondary_roles:
    - "Director of Product"
    - "Head of Product"
  industries:
    - "SaaS"
    - "Healthcare Tech"
  seniority: "senior"              # entry | mid | senior | lead | director | vp | c-suite
  exclude_keywords:                # Optional. Roles to skip in scanning.
    - "Junior"
    - "Intern"

# === Skills ===
skills:
  - "Product Strategy"
  - "SQL"
  - "User Research"
  # List your top 10-15 skills

# === Credentials (for regulated industries) ===
credentials:                       # Optional. Critical for Healthcare, Legal, Trades, Engineering.
  - type: "PMP"                    # Certification/license type
    status: "Active"               # Active | Expired | In Progress
    state: ""                      # Jurisdiction if applicable
    number: ""                     # Optional. License number.
    expiry: ""                     # Optional. Expiration date.

# === Narrative ===
narrative:
  headline: "Product leader who turns user research into revenue"
  story: "Transitioned from engineering to product after building internal tools that became the company's main product line."
  superpowers: "Data-driven decisions, cross-functional leadership, 0-to-1 product launches"

# === Work History (parsed from resume) ===
work_history:
  - title: "Senior Product Manager"
    company: "Acme Corp"
    dates: "Jan 2022 - Present"
    highlights:
      - "Launched 3 products generating $4M ARR"
      - "Led cross-functional team of 12"
      - "Reduced churn 25% through data-driven feature prioritization"
  - title: "Product Manager"
    company: "StartupCo"
    dates: "Mar 2019 - Dec 2021"
    highlights:
      - "Built product from 0 to 10K users in 8 months"
      - "Defined and executed product roadmap for Series A pitch"

# === Education ===
education:
  - degree: "BS Computer Science"
    school: "State University"
    year: 2018
  - degree: "MBA"                  # Optional additional degrees
    school: "Business School"
    year: 2022

# === Compensation ===
compensation:
  target: "$160,000"
  minimum: "$140,000"
  currency: "USD"

# === Proof Points ===
proof_points:
  - "Launched 3 products totaling $4M ARR at Acme Corp"
  - "Grew user base from 0 to 10K in 8 months at StartupCo"
  - "PMP certified, 2023"

# === Portfolio / Projects ===
portfolio:
  - url: "https://yoursite.com/case-study"
    description: "Product case study: Acme onboarding redesign"

# === Persona Modifiers ===
persona:                           # Optional. Triggers special scoring adjustments.
  recent_graduate: false
  career_changer: false
  career_returner: false
  international: false
  gap_explanation: ""              # If career_returner, brief explanation

# === Follow-up Cadence ===
followup_cadence:                  # Optional. Days. Omit to use the defaults shown.
  applied_first_days: 7            # Wait this long before the first nudge
  applied_subsequent_days: 7       # And this long between later ones
  applied_max_followups: 2         # Stop after this many with no reply
  responded_initial_days: 1        # They replied — respond within a day
  responded_subsequent_days: 3
  interview_thankyou_days: 1       # Thank-you note window after an interview
```

## Notes

- `work_history` carries more weight than any other field. Evaluations match JD
  requirements against these entries, so titles alone produce vague scores —
  the bullets are what make a match specific. Setup populates it from a pasted
  resume.
- `credentials` matter for regulated industries: Healthcare, Legal, Trades,
  Non-Software Engineering, Finance, Education, Government. In the first four,
  a missing required license caps the score at 2.0 regardless of everything
  else. Leave it empty if your field doesn't license.
- `persona` modifiers change scoring weights for every job you evaluate. See
  `scoring-rubric.md`.
- `followup_cadence` uses the same key names as career-ops's `config/profile.yml`,
  so a cadence tuned in either place works in both.
