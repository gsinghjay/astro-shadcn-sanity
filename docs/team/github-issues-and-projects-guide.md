# GitHub Issues & Projects Guide

**Project:** YWCC Capstone Websites
**Board:** [Project #11](https://github.com/users/gsinghjay/projects/11)
**Repo:** `gsinghjay/astro-shadcn-sanity`

---

## Issue Structure

### Approach Change (2026-02-19)

The original plan (Stories 2.4–2.8) created 103 sub-issues to convert ~98 FullDev UI block variants into individual Sanity schema types. This was replaced with **Path 1: Layout Variants** — adding a `variant` field to existing blocks so editors choose layout styles without schema sprawl.

**Impact:** 103 old sub-issues closed. 26 new sub-issues created. 1 new block type (videoEmbed) instead of 98.

See `docs/block-layout-catalog.md` for the full FullDev UI layout inventory that informed this decision.

### Parent Issues (5 total)

Each parent represents one layout variant story. Parents are **repurposed** from the original issues (same numbers, updated titles and bodies).

| # | Title (NEW) | Scope | Est. Sub-issues | Branch |
|---|-------------|-------|:---------------:|--------|
| #121 | Variant Infrastructure | defineBlock variants, VariantLayout helper, conditional field hiding | ~6 | `feat/2.4-variant-infrastructure` |
| #37 | Hero & CTA Variants | heroBanner (5 variants), ctaBanner (4 variants) | ~6 | `feat/2.5-hero-cta-variants` |
| #38 | Content & Feature Variants | textWithImage (4), featureGrid (5), richText (3) | ~7 | `feat/2.6-content-feature-variants` |
| #39 | FAQ, Steps, Stats & Testimonial Variants | faqSection (4), sponsorSteps (3), statsRow (3), testimonials (5) | ~5 | `feat/2.7-faq-steps-stats-testimonial-variants` |
| #40 | Video Embed + Logo/Contact Variants | NEW videoEmbed (3), logoCloud (3), contactForm (3) | ~7 | `feat/2.8-video-logo-contact-variants` |

### Closed Sub-Issues (103 total — superseded)

All original per-block-conversion sub-issues have been closed as superseded by the variant approach.

| Parent | Old Sub-issue Range | Count | Status |
|--------|---------------------|:-----:|--------|
| #121 | #122 (fdLink) + #123-#144 | 23 | Closed |
| #37 | #41-#59 | 19 | Closed |
| #38 | #60-#80 | 21 | Closed |
| #39 | #81-#101 | 21 | Closed |
| #40 | #102-#120 | 19 | Closed |

### New Sub-Issues (26 total)

| Parent | Sub-issues | Count |
|--------|-----------|:-----:|
| #121 (Story 2.4) | #278-#283 | 6 |
| #37 (Story 2.5) | #284-#289 | 6 |
| #38 (Story 2.6) | #290-#293 | 4 |
| #39 (Story 2.7) | #294-#298 | 5 |
| #40 (Story 2.8) | #299-#303 | 5 |

**Story 2.4 (#121) — Variant Infrastructure:**
- #278 Extend defineBlock helper with variants config
- #279 Create variant layout helper (variant-layouts.ts)
- #280 Create VariantLayout.astro component
- #281 Add conditional field hiding (hiddenByVariant)
- #282 Add variant to GROQ base projection
- #283 Verify infrastructure (tests, typegen, build)

**Story 2.5 (#37) — Hero & CTA Variants:**
- #284 Add variant field to heroBanner schema
- #285 Implement heroBanner variant rendering (5 variants)
- #286 Add variant field to ctaBanner schema
- #287 Implement ctaBanner variant rendering (4 variants)
- #288 Add image field to ctaBanner if missing (schema + GROQ + hiding)
- #289 Verify Hero & CTA variants

**Story 2.6 (#38) — Content & Feature Variants:**
- #290 Add variants to textWithImage (4 variants)
- #291 Add variants to featureGrid (5 variants)
- #292 Add variants to richText (3 variants)
- #293 Verify Content & Feature variants

**Story 2.7 (#39) — FAQ, Steps, Stats & Testimonial Variants:**
- #294 Add variants to faqSection (4 variants)
- #295 Add variants to sponsorSteps (3 variants)
- #296 Add variants to statsRow (3 variants)
- #297 Add variants to testimonials (5 variants incl. carousel/marquee)
- #298 Verify FAQ/Steps/Stats/Testimonial variants

**Story 2.8 (#40) — Video Embed + Logo/Contact Variants:**
- #299 Create videoEmbed schema
- #300 Create VideoEmbed.astro component (3 variants)
- #301 Add variants to logoCloud (3 variants incl. marquee)
- #302 Add variants to contactForm (3 variants)
- #303 Verify Video/Logo/Contact + deploy schema

### Story Point Labels

| Label | Meaning | Typical Task |
|-------|---------|--------------|
| `SP:1` | Simple — single variant addition, no new fields | richText variants, faqSection narrow |
| `SP:2` | Medium — multiple variants with conditional hiding | textWithImage, featureGrid, statsRow |
| `SP:3` | Complex — new block type or carousel/marquee rendering | videoEmbed, testimonials (carousel+marquee) |

### Other Labels

| Label | Purpose |
|-------|---------|
| `block-variant` | All layout variant issues (replaces `block-conversion`) |
| `block-conversion` | Legacy label — old per-block issues (all closed) |
| `enhancement` | Parent issues |
| `gap-analysis` | Native feature gaps from Sanity & Astro gap analysis |

---

## Project Board (Project #11)

### Project ID

```
PVT_kwHOAz5-bs4BO-Rd
```

### Field IDs

These are needed for programmatic updates via `gh api graphql`.

| Field | Type | ID |
|-------|------|-----|
| Title | TITLE | `PVTF_lAHOAz5-bs4BO-Rdzg9hLfc` |
| Assignees | ASSIGNEES | `PVTF_lAHOAz5-bs4BO-Rdzg9hLfg` |
| Status | SINGLE_SELECT | `PVTSSF_lAHOAz5-bs4BO-Rdzg9hLfk` |
| Labels | LABELS | `PVTF_lAHOAz5-bs4BO-Rdzg9hLfo` |
| Linked PRs | LINKED_PULL_REQUESTS | `PVTF_lAHOAz5-bs4BO-Rdzg9hLfs` |
| Milestone | MILESTONE | `PVTF_lAHOAz5-bs4BO-Rdzg9hLfw` |
| Repository | REPOSITORY | `PVTF_lAHOAz5-bs4BO-Rdzg9hLf0` |
| Reviewers | REVIEWERS | `PVTF_lAHOAz5-bs4BO-Rdzg9hLf4` |
| Parent issue | PARENT_ISSUE | `PVTF_lAHOAz5-bs4BO-Rdzg9hLf8` |
| Sub-issues progress | SUB_ISSUES_PROGRESS | `PVTF_lAHOAz5-bs4BO-Rdzg9hLgA` |
| Due Date | DATE | `PVTF_lAHOAz5-bs4BO-Rdzg9hLqc` |
| Start Date | DATE | `PVTF_lAHOAz5-bs4BO-Rdzg9hUnE` |

### Status Options

| Status | Color | Option ID |
|--------|-------|-----------|
| Backlog | Gray | `aeb05804` |
| Ready | Green | `d0f8afa9` |
| In Progress | Yellow | `81800a17` |
| Blocked | Red | `24bd65d4` |
| In Review | Blue | `fe9342ae` |
| Done | Purple | `f43b1261` |

---

## Milestones

| # | Milestone | Due | Issues |
|---|-----------|-----|--------|
| 1 | Sprint 1 - Platform Foundation | Feb 19 | #158-#184 (27 issues: foundation, schemas, queries, infra) |
| 2 | Sprint 2 - Core Content System | Mar 5 | #186 B.1 GA4 Dashboard (+6 sub-issues), #213-#217 #219 #232 gap quick wins (7 issues) |
| 3 | Sprint 3 - Blocks & Content Types | Mar 19 | #121 (infra, blocks 2.5-2.8), #37-#40 (26 variant sub-issues), #187 B.2 Monsido (+5 sub-issues) |
| 4 | Sprint 4 - Feature Completion | Apr 2 | SEO, contact form, #220-#221 #224 #226-#227 #231 #233-#234 gap P2 (8 issues), Epic 9 React components (~11 sub-issues) |
| 5 | Sprint 5 - Multi-Site Launch | Apr 16 | Multi-site infra, RWC US + International, #225 #228-#230 gap P3 (4 issues), #188 B.3 Cross-Site Analytics (+5 sub-issues) |
| 6 | Post-Sprint - Delivery | May 7 | Bug fixes, docs, presentations, #189 B.4 Final Report (+6 sub-issues) |

---

## Current Timeline

Dates are set on the project board via the `Start Date` and `Due Date` fields.

### Layout Variant Schedule

| Parent | Title | Start | Due | Milestone |
|--------|-------|-------|-----|-----------|
| #121 | Variant Infrastructure | 2026-03-01 | 2026-03-05 | Sprint 3 |
| #37 | Hero & CTA Variants | 2026-03-05 | 2026-03-10 | Sprint 3 |
| #38 | Content & Feature Variants | 2026-03-05 | 2026-03-12 | Sprint 3 |
| #39 | FAQ/Steps/Stats/Testimonials | 2026-03-10 | 2026-03-16 | Sprint 3 |
| #40 | Video + Logo/Contact | 2026-03-12 | 2026-03-19 | Sprint 3 |

**Note:** #121 (infrastructure) blocks #37-#40. Stories #37-#40 can run in parallel after #121 completes.

---

## How to Shift Dates

### Shift a single story's dates

To move all sub-issues in a parent to new dates, use this script pattern:

```bash
PROJECT_ID="PVT_kwHOAz5-bs4BO-Rd"
START_FIELD="PVTF_lAHOAz5-bs4BO-Rdzg9hUnE"
DUE_FIELD="PVTF_lAHOAz5-bs4BO-Rdzg9hLqc"

NEW_START="2026-03-15"
NEW_DUE="2026-03-25"

# First get all project items and their issue numbers
gh api graphql -f query='
{
  node(id: "PVT_kwHOAz5-bs4BO-Rd") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content { ... on Issue { number } }
        }
      }
    }
  }
}' --jq '.data.node.items.nodes[] | "\(.content.number) \(.id)"' > /tmp/items.txt

# Then for each issue in your range, update dates
# Replace the issue numbers with actual sub-issue numbers once created
for num in 235 236 237 238 239 240; do
  ITEM_ID=$(grep "^${num} " /tmp/items.txt | cut -d' ' -f2)
  if [ -n "$ITEM_ID" ]; then
    # Set start date
    gh api graphql -f query="
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: \"${PROJECT_ID}\"
        itemId: \"${ITEM_ID}\"
        fieldId: \"${START_FIELD}\"
        value: { date: \"${NEW_START}\" }
      }) { projectV2Item { id } }
    }" --silent

    # Set due date
    gh api graphql -f query="
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: \"${PROJECT_ID}\"
        itemId: \"${ITEM_ID}\"
        fieldId: \"${DUE_FIELD}\"
        value: { date: \"${NEW_DUE}\" }
      }) { projectV2Item { id } }
    }" --silent

    echo "Updated #${num}"
  fi
done
```

### Update status for a batch

```bash
# Mark all sub-issues of a parent as "In Progress"
STATUS_FIELD="PVTSSF_lAHOAz5-bs4BO-Rdzg9hLfk"
IN_PROGRESS_ID="81800a17"

# Replace with actual new sub-issue numbers
for num in 235 236 237 238 239 240; do
  ITEM_ID=$(grep "^${num} " /tmp/items.txt | cut -d' ' -f2)
  if [ -n "$ITEM_ID" ]; then
    gh api graphql -f query="
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: \"PVT_kwHOAz5-bs4BO-Rd\"
        itemId: \"${ITEM_ID}\"
        fieldId: \"${STATUS_FIELD}\"
        value: { singleSelectOptionId: \"${IN_PROGRESS_ID}\" }
      }) { projectV2Item { id } }
    }" --silent
  fi
done
```

---

## Epic 8: Analytics & Monitoring (Dev B)

| Parent | Title | Sub-issues | Milestone | Dates |
|--------|-------|-----------|-----------|-------|
| #185 | Epic 8 (parent) | #186-#189 | — | Feb 24 – Apr 23 |
| #186 | B.1: GA4 Dashboard & Event Tracking | #190-#195 (6) | Sprint 2 | Feb 24 – Mar 5 |
| #187 | B.2: Monsido Accessibility Baseline | #196-#200 (5) | Sprint 3 | Mar 10 – Mar 19 |
| #188 | B.3: Cross-Site Analytics Extension | #201-#205 (5) | Sprint 5 | Mar 24 – Apr 16 |
| #189 | B.4: Final Report & Recommendations | #206-#211 (6) | Post-Sprint | Apr 7 – Apr 23 |

---

## Epic 9: Sponsor Portal — Pure React Components

Standalone React island components a frontend developer can build independently using TypeScript interfaces and fixture data. No Astro, middleware, or infrastructure knowledge required.

**Reference:** [`docs/team/portal-react-islands-guide.md`](portal-react-islands-guide.md)
**Assignee:** Frontend dev (React)
**Milestone:** Sprint 4 — Feature Completion

### Parent Issues (3 total)

| # | Title | Scope | Est. Sub-issues | Branch |
|---|-------|-------|:---:|--------|
| #305 | Story 9.7: Portal Dashboard React Components | types, StatCard, SubmissionsPanel, EngagementPanel | 4 | `feat/9-7-portal-dashboard` |
| #306 | Story 9.4: Dev Dashboard React Components | DevDashboard (tabbed: Issues, PRs, Releases, Resources) | 2 | `feat/9-4-dev-dashboard` |
| #307 | Story 9.6: Site Health Dashboard React Components | ScoreGauge, WebVitalsCard, TrendChart, Pa11yDetail, LighthouseDetail, SiteHealthDashboard | 5 | `feat/9-6-site-health-dashboard` |

### Sprint 4 Schedule

| Parent | Title | Start | Due | Milestone |
|--------|-------|-------|-----|-----------|
| #305 (Story 9.7) | Portal Dashboard React Components | Mar 24 | Mar 30 | Sprint 4 |
| #306 (Story 9.4) | Dev Dashboard React Components | Mar 30 | Apr 2 | Sprint 4 |
| #307 (Story 9.6) | Site Health Dashboard React Components | Apr 2 | Apr 9 | Sprint 4 → Sprint 5 |

**Note:** Story 9.7 (#305) blocks Story 9.4 and 9.6 (establishes component patterns, shared types, and `pushEvent` helper). Stories 9.4 and 9.6 can run in parallel after 9.7 completes. Story 9.6 last 3 sub-issues (#316–#318) overflow into Sprint 5 buffer.

### Sub-Issues — Story 9.7 (#305) — Portal Dashboard

| # | Title | SP | Start | Due |
|---|-------|----|-------|-----|
| #308 | Create `portal/types.ts` (Submission, SubmissionStats, EngagementMetrics) + `StatCard.tsx` (label, value, description props) | 1 | Mar 24 | Mar 25 |
| #309 | Create `SubmissionsPanel.tsx` — stat cards grid, submissions table, expand/collapse rows via `useState`, GTM `pushEvent('submission_expand')`, `aria-expanded` accessibility | 2 | Mar 25 | Mar 27 |
| #310 | Create `EngagementPanel.tsx` — `useEffect` + `fetch('/portal/api/analytics')`, loading skeleton (`animate-pulse`), error fallback, success renders: page views, top pages, form funnel, clicks by category | 2 | Mar 27 | Mar 29 |
| #311 | Verify Story 9.7 components — Container API tests with full + minimal fixture data, keyboard navigation | 1 | Mar 29 | Mar 30 |

### Sub-Issues — Story 9.4 (#306) — Dev Dashboard

| # | Title | SP | Start | Due |
|---|-------|----|-------|-----|
| #312 | Create `DevDashboard.tsx` — `useState` for active tab (Issues / PRs / Releases / Resources), overview section (stars, forks, language dot, relative "last push" date), issues with colored label badges + assignee avatars, PRs with draft badge + reviewer avatars, collapsed "Recently Merged" section, releases with markdown body, conditional Wiki/Discussions cards, per-section error states | 3 | Mar 30 | Apr 1 |
| #313 | Verify Story 9.4 component — Container API test with full data fixture + partial-failure fixture (some sections errored) | 1 | Apr 1 | Apr 2 |

### Sub-Issues — Story 9.6 (#307) — Site Health Dashboard

| # | Title | SP | Start | Due |
|---|-------|----|-------|-----|
| #314 | Create `ScoreGauge.tsx` (SVG circular arc, `strokeDasharray`/`strokeDashoffset`, green ≥90 / amber 50–89 / red <50) + `WebVitalsCard.tsx` (LCP/CLS/INP with Google threshold colors) | 1 | Apr 2 | Apr 3 |
| #315 | Create `Pa11yDetail.tsx` (violations sorted error→warning→notice, WCAG code, element selector, context HTML, color-coded) + `LighthouseDetail.tsx` (failed audits grouped by category, passed collapsed) | 2 | Apr 3 | Apr 5 |
| #316 | Create `TrendChart.tsx` — SVG line chart (4 Lighthouse category lines) + bar chart (Pa11y error counts), x-axis commit SHAs, hover tooltips, responsive resize | 3 | Apr 5 | Apr 7 |
| #317 | Create `SiteHealthDashboard.tsx` — orchestrates ScoreGauge grid, WebVitals cards, Pa11y summary, TrendChart, tab/accordion drill-down to detail views, lazy-fetches full reports on drill-down, empty state ("No audit data yet"), historical run selector | 3 | Apr 7 | Apr 9 |
| #318 | Verify Story 9.6 components — gauge color threshold tests, empty state rendering, chart with <2 data points hidden | 1 | Apr 9 | Apr 9 |

### Story Point Labels

| Label | Meaning | Examples |
|-------|---------|---------|
| `SP:1` | Simple — display-only or single-concern | StatCard, types.ts, ScoreGauge, verify tasks |
| `SP:2` | Medium — state management + multiple UI states | SubmissionsPanel, EngagementPanel, detail views |
| `SP:3` | Complex — multi-section, SVG drawing, or orchestrator | DevDashboard, TrendChart, SiteHealthDashboard |

### Other Labels

| Label | Purpose |
|-------|---------|
| `portal-react` | All Epic 9 pure React component issues |
| `epic-9` | All Epic 9 issues (infra + React) |

### Dependencies

```
Story 9.7 types + StatCard ──▸ SubmissionsPanel ──▸ Verify 9.7
       │                    ──▸ EngagementPanel  ──┘
       │
       ▼
Story 9.4 DevDashboard ──▸ Verify 9.4
       │
Story 9.6 ScoreGauge + WebVitalsCard ──▸ Pa11yDetail + LighthouseDetail
              │                                        │
              └──▸ TrendChart ──▸ SiteHealthDashboard ──▸ Verify 9.6
```

**Infrastructure dependencies (separate track, does NOT block React dev work):**
- Story 9.1 (CF Access + middleware) — blocks `.astro` page wiring and deployed testing
- Story 9.5 (Lighthouse/Pa11y CI pipeline) — blocks real data for Story 9.6
- Story 9.7 server endpoints (`/portal/api/analytics`, `/portal/api/submissions`) — blocks `EngagementPanel` integration testing
- Story 9.8 (D1 database) — blocks transactional features (Stories 9.9–9.13)

React dev builds all components against fixture data; integration with live endpoints happens after infrastructure stories land.

---

## Gap Analysis Issues (20 total, 3 closed)

Issues created from the [Native Features Gap Analysis](../../_bmad-output/planning-artifacts/sanity-astro-native-features-gap-analysis.md) verified via Sanity MCP on 2026-02-13.

### Sprint 2 — P0/P1 Quick Wins (7 open, 1 closed)

| # | Title | SP | Start | Due |
|---|-------|----|-------|-----|
| ~~#212~~ | ~~Deploy 10 missing schema types~~ | ~~1~~ | — | — | Closed: already deployed |
| #213 | View Transitions (ClientRouter) | 1 | Feb 26 | Feb 27 |
| #214 | Prefetch for instant navigation | 1 | Feb 26 | Feb 27 |
| #215 | Custom 404 error page | 1 | Feb 26 | Feb 27 |
| #216 | Custom 500 error page | 1 | Feb 26 | Feb 27 |
| #217 | `astro:env` schema validation | 2 | Feb 28 | Mar 2 |
| #219 | Scheduled Publishing plugin | 1 | Feb 28 | Mar 1 |
| #232 | Astro redirects configuration | 1 | Feb 26 | Feb 27 |

### Sprint 4 — P2 Medium Effort (8 issues)

| # | Title | SP |
|---|-------|----|
| #220 | Astro Middleware (security headers + shared data) | 2 |
| #221 | Astro Actions (type-safe form handling) | 2 |
| #224 | Custom Document Actions (Preview on Live Site) | 2 |
| #226 | Orderable document list for sponsors | 1 |
| #227 | Server Endpoints (API routes) | 2 |
| #231 | Partytown GA4 script offloading | 1 |
| #233 | Client directives expansion (visible/idle) | 2 |
| #234 | CI step for schema deployment validation | 2 |

### Sprint 5 — P3 Later (4 issues)

| # | Title | SP |
|---|-------|----|
| #225 | Document Badges (sponsor tiers, SEO status) | 2 |
| #228 | RSS feed generation | 1 |
| #229 | GROQ `pt::text()` for site search | 2 |
| #230 | SEO Document Inspector panel | 2 |

### Closed — Paid Subscription Required

| # | Title | Reason |
|---|-------|--------|
| ~~#218~~ | ~~AI Assist plugin~~ | Paid Sanity plan |
| ~~#222~~ | ~~Content Releases~~ | Paid Sanity plan |
| ~~#223~~ | ~~Embeddings Index~~ | Paid Sanity plan |

---

## Migration Commands (One-Time)

These commands close the old sub-issues and update parent issues. Run once after confirming the approach change.

### Step 1: Close all old sub-issues

```bash
# Close all 103 old block-conversion sub-issues
# Parent #121: fdLink + hero/banner blocks
gh issue close 122 -c "Superseded by variant approach (Story 2.4 rewrite)"
for n in $(seq 123 144); do gh issue close $n -c "Superseded by variant approach"; done

# Parent #37: content/articles blocks
for n in $(seq 41 59); do gh issue close $n -c "Superseded by variant approach"; done

# Parent #38: CTA/features blocks
for n in $(seq 60 80); do gh issue close $n -c "Superseded by variant approach"; done

# Parent #39: products/services blocks
for n in $(seq 81 101); do gh issue close $n -c "Superseded by variant approach"; done

# Parent #40: media/misc blocks
for n in $(seq 102 120); do gh issue close $n -c "Superseded by variant approach"; done
```

### Step 2: Update parent issue titles

```bash
gh issue edit 121 --title "Story 2.4: Variant Infrastructure"
gh issue edit 37 --title "Story 2.5: Hero & CTA Layout Variants"
gh issue edit 38 --title "Story 2.6: Content & Feature Layout Variants"
gh issue edit 39 --title "Story 2.7: FAQ, Steps, Stats & Testimonial Layout Variants"
gh issue edit 40 --title "Story 2.8: Video Embed + Logo/Contact Layout Variants"
```

### Step 3: Create new sub-issues

New sub-issues will be created with the `block-variant` label and linked to their parents. Issue numbers will be populated once created.

---

## Quick Reference: Issue Ranges

```
Sprint 1 Foundation:    #158 - #184  (27 issues)
Variant Infrastructure: #278 - #283  (parent #121)
Hero & CTA Variants:    #284 - #289  (parent #37)
Content & Feature:      #290 - #293  (parent #38)
FAQ/Steps/Stats/Test:   #294 - #298  (parent #39)
Video/Logo/Contact:     #299 - #303  (parent #40)
Epic 8 Analytics:       #185 - #211  (parent #185, subs under #186-#189)
Gap Analysis:           #212 - #234  (20 created, 4 closed)
Epic 9 React (9.7):    #308 - #311  (parent #305)
Epic 9 React (9.4):    #312 - #313  (parent #306)
Epic 9 React (9.6):    #314 - #318  (parent #307)

CLOSED (old approach):
  fdLink + hero/banner:   #122 - #144  (23 issues, all closed)
  content/articles:       #41  - #59   (19 issues, all closed)
  CTA/features:           #60  - #80   (21 issues, all closed)
  products/services:      #81  - #101  (21 issues, all closed)
  media/misc:             #102 - #120  (19 issues, all closed)
```

## Quick Reference: gh Commands

```bash
# List all variant issues (new approach)
gh issue list --label block-variant --limit 50

# List old closed block-conversion issues
gh issue list --label block-conversion --state closed --limit 120

# View a parent with sub-issue progress
gh issue view 121

# Close an issue when done
gh issue close <number>

# Add an issue to the project
gh project item-add 11 --owner gsinghjay --url https://github.com/gsinghjay/astro-shadcn-sanity/issues/<number>

# List all Epic 9 portal React component issues
gh issue list --label portal-react --limit 20

# List all Epic 9 issues (infra + React)
gh issue list --label epic-9 --limit 30
```
