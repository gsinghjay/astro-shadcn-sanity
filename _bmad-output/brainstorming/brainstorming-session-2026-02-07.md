---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['/home/jay/github/astro-shadcn-sanity/initial-brainstorm.md']
session_topic: 'Base Astro + Sanity template with shadcn/ui block components for modular page builder'
session_goals: 'Define core block library, component architecture, and Sanity schemas so content editors can hit the ground running'
selected_approach: 'ai-recommended'
techniques_used: ['SCAMPER Method', 'Morphological Analysis']
ideas_generated: 11
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Jay
**Date:** 2026-02-07

## Session Overview

**Topic:** Base Astro + Sanity template with shadcn/ui block components for a modular page builder (YWCC Capstone Sponsors Platform)
**Goals:** Define the core block library, component architecture, and Sanity schemas needed so content editors can start composing pages immediately

### Context Guidance

_Existing project brief defines a $0/month modular CMS-driven platform for NJIT YWCC Industry Capstone program. Tech stack: Astro + Sanity.io + Tailwind/shadcn + Cloudflare Pages. Reference site: ywcccapstone1.com. Current focus is building the reusable base template, not full content._

### Session Setup

_Jay has a detailed initial brainstorm document covering the full vision. The session narrows focus to the base template layer — the reusable shadcn component blocks and Sanity schemas that form the foundation for content assembly. Hosting confirmed as Cloudflare Pages (Option B). Analytics via GA4 + Monsido._

---

## Technique Execution Results

### SCAMPER Method

**S — Substitute:** Identified that carousel behavior should be a generic `CarouselWrapper` layout variant rather than baked into 3 separate block components (Hero, Testimonials, Project Showcase). One vanilla JS implementation, reused everywhere.

**C — Combine (Reframed):** Instead of consolidating blocks, the goal shifted to incorporating ALL shadcn components. The architecture maps editor-friendly block names to shadcn internals — editors never see component names, only visual outcomes.

**A — Adapt:** Mapped 17 editor-facing blocks to ~20 shadcn components. Block names describe intent ("FAQ Section" not "Accordion"), making shadcn invisible to non-technical users.

**M — Modify:** Established a shared block base schema — every block inherits background variant, spacing, and max-width options as constrained presets (no color pickers, no pixel values).

**E — Eliminate:** No custom styling exposure, no nested blocks. Pages are flat arrays of blocks. Design system is locked — editors choose variants, not values.

**R — Reverse:** Validated that all 6+ page types on ywcccapstone1.com can be fully reproduced using the 17-block library with zero custom code.

### Morphological Analysis

Full parameter matrix completed — every block specified with editor fields, shadcn components consumed, JS requirements, and variant options. Complete shadcn coverage audit performed to ensure no component falls through the cracks.

---

## Idea Organization and Prioritization

### Theme 1: Architecture Principles

- **[Architecture #1] Toolkit, Not Website:** The template delivers reliable, composable building blocks — not opinionated page layouts. Content decisions belong entirely to editors in Sanity Studio.
- **[Architecture #4] Editor-Friendly Block Granularity:** Blocks map to visual outcomes editors can picture. shadcn component names disappear from the editor's vocabulary entirely.
- **[Architecture #7] No Custom Styling Exposure:** Editors get zero access to custom CSS, arbitrary colors, or font overrides. Brand colors, typography, and spacing are baked into the Tailwind theme config.
- **[Architecture #8] No Nested Blocks:** Pages are flat arrays of blocks. No block-inside-block nesting. Keeps schemas simple, rendering predictable, and editor experience clean.

### Theme 2: Component Architecture

- **[Architecture #2] CarouselWrapper as Layout Variant:** Generic CarouselWrapper that any block can opt into. One vanilla JS implementation, reused across Hero, Testimonials, and any future carousel need.
- **[Architecture #3] Full shadcn Coverage:** Every shadcn/ui component gets incorporated — either as a standalone CMS block or as a primitive used within blocks.
- **[Architecture #5] 17-Block Library with shadcn Mapping:** Complete block library maps editor-friendly names to shadcn internals. 17 blocks consuming ~20 shadcn components.
- **[Architecture #6] Shared Block Base Schema:** Every block inherits a common Sanity schema with background (White/Muted/Primary/Dark), spacing (Compact/Default/Spacious), and width (Narrow/Default/Full) options.
- **[Architecture #11] shadcn Coverage Audit:** Every shadcn component accounted for — in a block, in Layout, consumed as a primitive, or explicitly deferred.

### Theme 3: Validation

- **[Architecture #9] Full Page Coverage Validated:** All page types on ywcccapstone1.com can be reproduced using the 17-block library.
- **[Architecture #10] Complete Morphological Matrix:** Every block fully specified — editor fields, shadcn internals, JS requirements, and variant options.

---

## Block Library Specification

### Shared Block Base Schema (all blocks inherit)

| Field | Options | Maps To |
|---|---|---|
| Background | White / Muted / Primary / Dark | Tailwind bg classes |
| Spacing | Compact / Default / Spacious | Tailwind padding presets |
| Max Width | Narrow / Default / Full | Tailwind max-w classes |

### P0 Blocks (MVP)

| Block | Editor Fields | shadcn Components | JS | Variants |
|---|---|---|---|---|
| Hero Banner | heading, subheading, backgroundImage, buttons[], alignment, overlay | Button, Carousel | Optional | Static / Carousel / Video bg |
| Feature Grid | heading, subheading, items[] (icon, title, description, link), columns | Card, Badge | No | Icons / Images / Text-only |
| Sponsor Cards | heading, sponsors[] (ref), layout, showTierBadge, filterByTier | Card, Badge, Avatar | Yes | Grid / List / Compact |
| Rich Text | content (Portable Text), maxWidth | Alert (callouts) | No | Standard / Sidebar / Callouts |
| CTA Banner | heading, description, buttons[], background | Card, Button | No | Centered / Left+image / Split |
| FAQ Section | heading, subheading, items[] (question, answer) | Accordion | Yes | Single-open / Multi / Grouped |
| Contact Form | heading, description, fields, successMessage, formType | Input, Label, Textarea, Select, Button, Sonner | Yes | Simple / Full |
| Timeline | heading, items[] (title, date, description, status), highlightCurrent | Card, Separator | No | Vertical / Horizontal / Alternating |
| Logo Cloud | heading, logos[] (image, alt, url), size | Avatar, Separator | No | Static / Marquee / Grid |

### P1 Blocks (Second Wave)

| Block | Editor Fields | shadcn Components | JS | Variants |
|---|---|---|---|---|
| Tabbed Content | heading, tabs[] (label, content, icon) | Tabs | Yes | Horizontal / Vertical / Pills |
| Testimonials | heading, items[] (quote, name, role, org, photo), autoplay | Carousel, Card, Avatar | Yes | Carousel / Grid / Featured |
| Stats Row | heading, stats[] (value, label, prefix, suffix), animateOnScroll | Card | Optional | Inline / Card grid / Icons |
| Data Table | heading, columns[], rows[] or documentSource, searchable, pageSize | Table, Badge, Input | Yes | Static / Sortable / Searchable |
| Team Grid | heading, subheading, members[] (ref or inline) | Card, Avatar, HoverCard | Yes | Grid / List / Compact |

### P2 Blocks (Third Wave)

| Block | Editor Fields | shadcn Components | JS | Variants |
|---|---|---|---|---|
| Image Gallery | heading, images[] (image, caption, alt), columns | Dialog, Card | Yes | Grid / Masonry / Carousel |
| Video Embed | heading, videoUrl, aspectRatio, caption, poster | Card | No | Inline / Text beside / Full-width |
| Alert/Notice | title, message, type (info/warning/success/error), dismissible | Alert, Button | Optional | Info / Warning / Success / Error |

### shadcn Components in Layout (Not Blocks)

| Component | Location |
|---|---|
| Navigation Menu | Site header |
| Sheet / Drawer | Mobile navigation |
| Breadcrumb | Page header |
| Skeleton | Loading states |
| Scroll Area | Layout utility |

### shadcn Components as Primitives (Inside Blocks)

| Component | Used By |
|---|---|
| Button | Hero, CTA, Forms, Alert |
| Badge | Feature Grid, Sponsor Cards, Data Table |
| Avatar | Sponsor Cards, Testimonials, Team Grid, Logo Cloud |
| Separator | Timeline, Logo Cloud |
| Input, Label, Textarea, Select | Contact Form |
| Sonner (Toast) | Contact Form feedback |
| HoverCard | Team Grid |
| Popover | Various (tooltips, info) |
| Toggle / Toggle Group | Filter UIs inside blocks |
| Pagination | Data Table |

### shadcn Components Deferred

| Component | Reason |
|---|---|
| Calendar / Date Picker | Admin-side or future form need |
| Command / Combobox | Sanity Studio only |
| Context Menu / Dropdown Menu / Menubar | No current block need |
| Radio Group / Checkbox / Switch / Slider | Future form extensions |
| Progress | Niche — add when needed |
| Resizable | Layout utility — add when needed |
| Collapsible | Covered by Accordion |

---

## Key Decisions Made

1. **Hosting:** Cloudflare Pages (Option B) — single deploy target
2. **Analytics:** GA4 + Monsido (free)
3. **Block philosophy:** Toolkit, not website — editors compose, developers provide blocks
4. **Naming:** Editor-friendly intent names, shadcn invisible
5. **Styling:** Constrained presets only, no custom CSS exposure
6. **Structure:** Flat block arrays, no nesting
7. **shadcn coverage:** Every component accounted for across blocks, layout, primitives, or deferred
8. **Reference site:** ywcccapstone1.com — all pages reproducible with this block set

## Next Steps

1. Proceed to **Create Product Brief** (`/bmad-bmm-create-product-brief`) or **Create PRD** (`/bmad-bmm-create-prd`) to formalize these decisions
2. Use this brainstorm as input to the PRD — the block library spec and architecture principles are implementation-ready
3. Each step should be run in a **fresh context window**
