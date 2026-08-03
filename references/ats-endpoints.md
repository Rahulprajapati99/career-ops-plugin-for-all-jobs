# ATS Detection & Search Patterns

What `scan` and `batch-scanner` need: identify which applicant tracking system a
company uses, pull its slug from the URL, and build a search query that finds the
postings.

The direct ATS APIs are documented in the appendix, but **the plugin does not
call them** — they're blocked by the Cowork network proxy. Search is the path.

## Detect the ATS from a URL

| URL pattern | ATS | Slug is |
|---|---|---|
| `boards.greenhouse.io/{slug}` | Greenhouse | `{slug}` |
| `job-boards.greenhouse.io/{slug}` | Greenhouse | `{slug}` |
| `job-boards.eu.greenhouse.io/{slug}` | Greenhouse (EU) | `{slug}` |
| `{company}.greenhouse.io` | Greenhouse | `{company}` |
| `jobs.lever.co/{slug}` | Lever | `{slug}` |
| `jobs.eu.lever.co/{slug}` | Lever (EU) | `{slug}` |
| `jobs.ashbyhq.com/{slug}` | Ashby | `{slug}` |
| `{company}.ashbyhq.com` | Ashby | `{company}` |
| `jobs.smartrecruiters.com/{slug}` | SmartRecruiters | `{slug}` |
| `apply.workable.com/{slug}` | Workable | `{slug}` |
| `{company}.recruitee.com` | Recruitee | `{company}` |
| `{tenant}.{wdN}.myworkdayjobs.com` | Workday | `{tenant}` |
| anything else | Unknown | — |

A company's *branded* careers page (`https://company.com/careers`) often
redirects to one of these, or embeds it. When the branded URL doesn't reveal the
ATS, search `{company} careers` and check where the job links point.

Unknown is a normal outcome, not a failure. Plenty of employers — especially
smaller ones, government, and healthcare systems — run their own job pages. The
generic query below works for them.

## Search query per ATS

| ATS | Query |
|---|---|
| Greenhouse | `site:job-boards.greenhouse.io/{slug} {role keywords}` |
| Greenhouse (EU) | `site:job-boards.eu.greenhouse.io/{slug} {role keywords}` |
| Lever | `site:jobs.lever.co/{slug} {role keywords}` |
| Ashby | `site:jobs.ashbyhq.com/{slug} {role keywords}` |
| SmartRecruiters | `site:jobs.smartrecruiters.com/{slug} {role keywords}` |
| Workable | `site:apply.workable.com/{slug} {role keywords}` |
| Recruitee | `site:{company}.recruitee.com {role keywords}` |
| Workday | `site:{tenant}.{wdN}.myworkdayjobs.com {role keywords}` |
| Unknown | `{company} careers {role keywords} {current year}` |

### Coverage caveats

These matter because an empty result means different things on different
platforms:

- **Greenhouse** boards index poorly. An empty site-scoped query usually means
  the crawler hasn't reached the board, not that nobody's hiring. Retry once as
  `{company} careers {role keywords} greenhouse`.
- **Workday** renders client-side and indexes badly. Expect to fall back to the
  generic query, or to hand the user the careers URL to browse.
- **Lever** and **Ashby** index well. An empty result there is usually real.
- **Recruitee** has no public API and only shallow indexing; treat results as
  partial.

Say which case you're in when reporting no results. "No openings match your
profile" and "I couldn't see their board" lead the user to different next moves.

## Extracting a slug without a URL

Given only a company name, search `{company} careers` and read the ATS domain
out of the top result. Company name and slug often differ — punctuation,
spacing, and legal suffixes get dropped, and acquired companies frequently keep
the acquirer's slug. Verify against a real result rather than transforming the
name and hoping.

## Rate limiting

One search per company per scan. Two if the Greenhouse retry fires. Record every
posting seen in scan history so the next run doesn't repeat the work.

---

## Appendix: direct ATS APIs

Blocked in the Cowork sandbox and unused by this plugin. Kept for reference, and
for anyone running these skills in an environment where the domains are
reachable.

**Greenhouse** — `GET https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true`
Returns a JSON array: `id`, `title`, `location.name`, `content` (HTML),
`departments[]`, `offices[]`, `absolute_url`, `updated_at`.

**Lever** — `GET https://api.lever.co/v0/postings/{slug}` (EU: `api.eu.lever.co`)
Returns a JSON array: `id`, `text` (title), `categories`, `descriptionPlain`,
`hostedUrl`, `applyUrl`, `workplaceType`, `salaryRange`.
Filters: `?location=`, `?team=`, `?department=`, `?commitment=`.

**Ashby** — `GET https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true`
Returns `jobs[]`: `title`, `location`, `departmentName`, `descriptionPlain`,
`jobUrl`, `applyUrl`, `isRemote`, `workplaceType`, `compensationTierSummary`.

**SmartRecruiters** — `GET https://api.smartrecruiters.com/v1/companies/{slug}/postings`
Returns `content[]`: `name`, `location`, `department`, `refNumber`. Auth
requirements are ambiguous in their docs; a 401 means fall back to search.

**Workday** — `POST https://{tenant}.{wdN}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs`
with body `{"appliedFacets": {}, "limit": 20, "offset": 0, "searchText": ""}`.
Undocumented, subject to change, and `tenant`/`wdN`/`site` must all come from the
company's real careers URL. Best-effort at most.
