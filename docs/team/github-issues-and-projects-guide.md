# GitHub Issues & Projects Guide

**Project:** YWCC Capstone Websites
**Board:** [Project #11](https://github.com/users/gsinghjay/projects/11)
**Repo:** `gsinghjay/astro-shadcn-sanity`

---

## Issue Structure

### Parent Issues (5 total)

Each parent represents one block schema story. Parent issues contain:
- Numbered acceptance criteria (12 ACs)
- Required reading links
- Process per block (7 steps)
- Critical patterns
- Block inventory table
- Branch strategy

| # | Title | Blocks | Total SP | Branch |
|---|-------|:------:|:--------:|--------|
| #121 | Hero & Banner | 22 + fdLink | ~52 | `feat/2.4-ui-blocks-hero-banner` |
| #37 | Content & Articles | 19 | ~37 | `feat/2.5-ui-blocks-content-articles` |
| #38 | CTA & Features | 21 | ~31 | `feat/2.6-ui-blocks-cta-features` |
| #39 | Products & Services | 21 | ~38 | `feat/2.7-ui-blocks-products-services` |
| #40 | Media & Misc | 19 | ~36 | `feat/2.8-ui-blocks-media-misc` |

### Sub-Issues (103 total)

Each sub-issue is one block conversion. Sub-issues are linked as GitHub sub-issues (not just body references) to their parent, so progress rolls up on the board.

| Parent | Sub-issue Range | Count |
|--------|-----------------|:-----:|
| #121 | #122 (fdLink) + #123-#144 | 23 |
| #37 | #41-#59 | 19 |
| #38 | #60-#80 | 21 |
| #39 | #81-#101 | 21 |
| #40 | #102-#120 | 19 |

### Story Point Labels

| Label | Meaning | Typical Block |
|-------|---------|---------------|
| `SP:1` | Simple — flat props, no images, GROQ passthrough | faqs, banners, links, steps, stats |
| `SP:2` | Medium — images needing GROQ reshaping or nested arrays | content, features, products, reviews |
| `SP:3` | Complex — multi-level image reshaping, design decisions | articles, logos, headers, footers, contact |

### Other Labels

| Label | Purpose |
|-------|---------|
| `block-conversion` | All block schema conversion issues |
| `enhancement` | Parent issues |

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
| Date (due) | DATE | `PVTF_lAHOAz5-bs4BO-Rdzg9hLqc` |
| Start Date | DATE | `PVTF_lAHOAz5-bs4BO-Rdzg9hUnE` |

### Status Options

| Status | Option ID |
|--------|-----------|
| Todo | `f75ad846` |
| In Progress | `47fc9ee4` |
| Done | `98236657` |

---

## Current Timeline

Dates are set on the project board via the `Start Date` and `Date` (due) fields.

| Parent | Start | Due | Sprint |
|--------|-------|-----|--------|
| #121 Hero & Banner | 2026-03-01 | 2026-03-12 | Sprint 2-3 |
| #37 Content & Articles | 2026-03-02 | 2026-03-12 | Sprint 2-3 |
| #38 CTA & Features | 2026-03-02 | 2026-03-13 | Sprint 3 |
| #39 Products & Services | 2026-03-05 | 2026-03-16 | Sprint 3 |
| #40 Media & Misc | 2026-03-13 | 2026-03-19 | Sprint 3 |

Special: **#122 (fdLink shared type)** has dates Feb 28 - Mar 1 (prerequisite for all blocks).

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

# Then for each issue in the range, update dates
for num in $(seq 41 59); do  # Replace with your issue range
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

### Shift all stories by N days

```python
#!/usr/bin/env python3
"""Shift all block conversion dates by N days."""
from datetime import datetime, timedelta

SHIFT_DAYS = 7  # Change this

current_dates = {
    # (parent, start_issues, end_issues): (current_start, current_due)
    (121, 123, 144): ("2026-03-01", "2026-03-12"),
    (122, 122, 122): ("2026-02-28", "2026-03-01"),  # fdLink
    (37, 41, 59):    ("2026-03-02", "2026-03-12"),
    (38, 60, 80):    ("2026-03-02", "2026-03-13"),
    (39, 81, 101):   ("2026-03-05", "2026-03-16"),
    (40, 102, 120):  ("2026-03-13", "2026-03-19"),
}

for (parent, start_range, end_range), (start_str, due_str) in current_dates.items():
    new_start = (datetime.strptime(start_str, "%Y-%m-%d") + timedelta(days=SHIFT_DAYS)).strftime("%Y-%m-%d")
    new_due = (datetime.strptime(due_str, "%Y-%m-%d") + timedelta(days=SHIFT_DAYS)).strftime("%Y-%m-%d")
    print(f"Parent #{parent} (issues #{start_range}-#{end_range}): {start_str} → {new_start}, {due_str} → {new_due}")
```

### Update status for a batch

```bash
# Mark all sub-issues of parent #37 as "In Progress"
STATUS_FIELD="PVTSSF_lAHOAz5-bs4BO-Rdzg9hLfk"
IN_PROGRESS_ID="47fc9ee4"

for num in $(seq 41 59); do
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

## Quick Reference: Issue Ranges

```
fdLink shared type:     #122
Hero & Banner blocks:   #123 - #144  (parent #121)
Content & Articles:     #41  - #59   (parent #37)
CTA & Features:         #60  - #80   (parent #38)
Products & Services:    #81  - #101  (parent #39)
Media & Misc:           #102 - #120  (parent #40)
```

## Quick Reference: gh Commands

```bash
# List all block-conversion issues
gh issue list --label block-conversion --limit 120

# View a parent with sub-issue progress
gh issue view 121

# Close an issue when done
gh issue close 41

# Add an issue to the project
gh project item-add 11 --owner gsinghjay --url https://github.com/gsinghjay/astro-shadcn-sanity/issues/41

# Bulk close a range (e.g., all content blocks done)
for n in $(seq 41 59); do gh issue close $n; done
```
