# UX Documentation: YWCC Industry Capstone Program

**Status:** Existing UX Audit (Demo/POC Phase)
**Date:** 2026-02-08
**Design System:** Swiss International Typographic Style + NJIT Branding
**Component Library:** fulldotdev/ui (Astro) + 12 Custom Blocks

---

## 1. Product Overview

### What This Is

A public-facing website for the **NJIT Ying Wu College of Computing (YWCC) Industry Capstone Program** — a year-long partnership where industry sponsors fund student teams to build real software solutions.

### Who It's For

| Audience | Goal | Primary Journey |
|---|---|---|
| **Industry Sponsors** (primary) | Evaluate the program and apply to sponsor a team | Home -> About -> Sponsors -> Contact |
| **Prospective Students** | Understand the capstone experience | Home -> Projects -> About |
| **Current Participants** | Find team/project information | Projects |
| **University Stakeholders** | Showcase program to visitors | Home (overview) |

### Current State

**Demo/POC** — The frontend renders with **placeholder data** (hardcoded TypeScript objects in `src/lib/data/`). Sanity CMS schemas exist but are not wired to the frontend via GROQ queries yet. The goal is a polished visual demo while the block component library is built up.

---

## 1b. NJIT.edu Design Reference

The NJIT main site ([njit.edu](https://www.njit.edu/)) and YWCC sub-site ([computing.njit.edu](https://computing.njit.edu/)) share the Swiss design DNA that our capstone site inherits:

### Shared Patterns with njit.edu
- **Full-bleed hero** with video/image background + bold uppercase headline ("EXPLORE NJIT")
- **Stats row** with oversized numerals (#1, TOP 40) and source citations
- **Red CTA buttons** ("HOW TO APPLY", "BROWSE ALL OF OUR PROGRAMS", "APPLY NOW")
- **Uppercase section labels** with wide tracking ("WHAT'S HAPPENING", "GETTING STARTED", "TAKE THE NEXT STEP")
- **Dark footer** with multi-column link groups + social icons
- **News carousel** with thumbnail navigation
- **Red accent on black/white** — same editorial palette

### YWCC-Specific Patterns (computing.njit.edu)
- **NJIT logo + "Ying Wu College of Computing" text** in header (the pattern our site should follow)
- **Red nav bar** beneath header
- **Red accent boxes** for callouts ("YWCC has the largest and most comprehensive computing program in the region.")
- **Student spotlight** cards with photos + quotes
- **Department links** grid (Computer Science, Data Science, Informatics)

### Logo Assets (Downloaded)

Official NJIT SVG logos saved to `astro-app/public/logos/`:

| File | Usage | Size |
|---|---|---|
| `njit-logo.svg` | Header (dark bg compatible, includes "New Jersey Institute of Technology" text) | 29KB |
| `njit-logo-light.svg` | Header on dark backgrounds (white version with full text) | 30KB |
| `njit-logo-plain.svg` | Compact mark (just "NJIT" with swoosh arc, dark) | 6KB |
| `njit-logo-plain-light.svg` | Footer/dark bg compact mark (white "NJIT" with swoosh) | 6KB |

**Recommendation:** Replace the current placeholder "YW" red square logo with:
- **Header:** `njit-logo-plain.svg` (compact "NJIT" mark) + "YWCC Industry Capstone" text
- **Footer:** `njit-logo-plain-light.svg` (white mark on dark footer)
- This aligns with how computing.njit.edu uses the NJIT mark + college name text

---

## 2. Design System: Swiss + NJIT

### Design Philosophy

The site uses **Swiss International Typographic Style** — characterized by:

- **Clean grid-based layouts** with generous whitespace
- **Bold sans-serif typography** (Helvetica Neue) with tight tracking
- **High-contrast color usage** — predominantly black/white with a single vibrant accent (Swiss Red)
- **Uppercase labels** with wide letter-spacing for categorization
- **Zero border-radius** (`--radius: 0`) — sharp corners everywhere
- **Minimal ornamentation** — content speaks through typography hierarchy

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--swiss-red` | `#E30613` | Primary accent, CTAs, active states, selection highlight |
| `--swiss-red-dark` | `#B00510` | Destructive/hover states |
| `--swiss-black` | `#0A0A0A` | Primary foreground, hero backgrounds |
| `--swiss-white` | `#FFFFFF` | Primary background |
| `--swiss-100` through `--swiss-900` | Neutral gray scale | Content hierarchy, borders, muted text |
| `--njit-red` | `#D22630` | NJIT institutional red (secondary brand) |
| `--njit-navy` | `#003366` | Chart/accent color |
| `--njit-gold` | `#E89B32` | Chart/accent color |

**Key decisions:**
- `--primary` maps to Swiss Red (`#E30613`), not NJIT Red
- Text selection is Swiss Red on white
- Dark mode is defined but not actively toggled (dark class-based)
- `--radius: 0` — intentionally sharp, no rounded corners

### Typography

| Element | Style |
|---|---|
| Font family | `Helvetica Neue`, Helvetica, Arial, sans-serif |
| Body | 16px, line-height 1.5, letter-spacing -0.01em |
| Headings | font-weight 700, line-height 1.05, tracking -0.03em |
| Hero H1 | 5xl -> 7xl -> 8xl responsive, tracking -0.04em |
| Labels | `.label-caps` utility: 11px, bold, uppercase, tracking 0.12em |
| Smallest | `text-2xs` (10px) for header sub-labels |

### Spacing & Layout

- **Sections** use the `Section` compound component with `size="lg"` for heroes
- **Content containers** max-width varies by block (prose caps at `max-w-2xl`, grids at `max-w-3xl`)
- **Page structure** is flat: `Layout > Header + main > BlockRenderer > [Block, Block, ...]  + Footer`
- **No sidebar** — single-column with full-width sections
- **Mobile-first** responsive breakpoints: default (mobile) -> `md:` (tablet) -> `lg:` (desktop)

---

## 3. Site Map & Page Architecture

```
/ (Home)
├── /about (Program)
├── /sponsors (Our Sponsors)
├── /projects (Projects & Teams)
└── /contact (Contact)
```

All pages follow the identical pattern:

```
Layout.astro
├── Header.astro (sticky, border-bottom)
├── <main>
│   └── BlockRenderer.astro
│       ├── Block 1 (typically HeroBanner)
│       ├── Block 2
│       ├── ...
│       └── Block N (typically CtaBanner)
└── Footer.astro (dark bg, 5-column grid)
```

### Page Compositions

#### Home (`/`)
1. **HeroBanner** — Full-bleed carousel (4 slides), "Industry Capstone Program", dual CTAs
2. **StatsRow** — Dark variant, 4 stats (150+ projects, 50+ partners, 600+ students, 12 years)
3. **FeatureGrid** — 3-column, "Why Sponsor" with icons + stat badges
4. **TextWithImage** — "A Structured Path From Problem to Prototype", image right
5. **LogoCloud** — 8 sponsor logos in marquee
6. **Timeline** — 7 milestones, June 2025 through May 2026
7. **CtaBanner** — Red variant, "Ready to Sponsor a Capstone Team?"

#### About / Program (`/about`)
1. **HeroBanner** — Centered layout, no carousel, "The Program"
2. **TextWithImage** — "Bridging Industry and Education", image right
3. **FeatureGrid** — 2-column, "How It Works" (4 features)
4. **FaqSection** — 7 accordion items
5. **CtaBanner** — Light variant, "Have More Questions?"

#### Sponsors (`/sponsors`)
1. **HeroBanner** — Centered, "Our Sponsors"
2. **SponsorCards** — Platinum tier (2 cards: JPMorgan, Prudential)
3. **SponsorCards** — Gold tier (4 cards: ADP, Verizon, Panasonic, Broadridge)
4. **SponsorCards** — Silver tier (3 cards: BD, MetLife, Realogy)
5. **StatsRow** — Light variant, sponsor satisfaction metrics
6. **CtaBanner** — Dark variant, "Join Our Sponsor Network"

#### Projects & Teams (`/projects`)
1. **HeroBanner** — Centered, "Projects & Teams"
2. **TeamGrid** — 4 teams with member avatars, roles, sponsors
3. **CtaBanner** — Dark variant, "Want Your Project Here?"

#### Contact (`/contact`)
1. **HeroBanner** — Centered, "Get in Touch"
2. **ContactForm** — 6 fields (name, email, org, role, interest dropdown, message)
3. **FeatureGrid** — 3-column contact info (office, email, phone)

---

## 4. Navigation & Wayfinding

### Header
- **Fixed position**, border-bottom (2px solid foreground)
- **Logo**: Red square with "YW" + "YWCC / Industry Capstone" text stack
- **Desktop nav**: 4 links in uppercase, bold, wide tracking — `Program | Sponsors | Projects | Contact`
- **Active state**: Swiss Red text color
- **CTA button**: "Become a Sponsor" (links to /contact)
- **Mobile**: Hamburger -> Sheet (slide-out drawer) with full nav + separator + CTA

### Footer
- **Dark background** (foreground/background inverted)
- **5-column grid** (lg): About (col-span-4) | Navigation (col-span-2) | Programs (col-span-2) | Resources (col-span-2) | Contact (col-span-2)
- **Bottom bar**: Copyright + Privacy/Terms/Accessibility/NJIT.edu links
- **Logo repeats** in footer with larger square
- **All footer links**: 60-80% opacity, hover to full

### User Flows

**Primary flow (Sponsor acquisition):**
```
Home (hero CTA "Become a Sponsor")
  -> Contact page (form submission)

Home (secondary CTA "View Projects")
  -> Projects page (see current teams)
  -> Contact page (CTA "Propose a Project")
```

**Secondary flow (Program evaluation):**
```
Home -> About (FAQ, how it works)
  -> Sponsors (see who else participates)
  -> Contact
```

Every page ends with a **CtaBanner** that drives toward `/contact` — consistent funnel pattern.

---

## 5. Block Component Library

### Two Systems

The project has **two distinct block component systems** that coexist:

#### Custom Blocks (12) — `blocks/custom/`
Purpose-built for the YWCC capstone program. Accept a `block` prop object. Wired to placeholder data, will connect to Sanity schemas.

| Block | Used On | Description |
|---|---|---|
| `HeroBanner` | All pages | Full-bleed hero with optional carousel, centered/full layouts |
| `StatsRow` | Home, Sponsors | Horizontal stat counters, dark/light variants |
| `FeatureGrid` | Home, About, Contact | Icon + title + description cards, 2-3 column |
| `TextWithImage` | Home, About | Split content: text + image, left/right position |
| `LogoCloud` | Home | Sponsor logo marquee with names |
| `Timeline` | Home | Vertical timeline with date/title/description |
| `CtaBanner` | All pages | Call-to-action banner, dark/light/red variants |
| `FaqSection` | About | Accordion-based FAQ |
| `SponsorCards` | Sponsors | Tiered sponsor cards with themes, year joined |
| `TeamGrid` | Projects | Team cards with member avatars and roles |
| `ContactForm` | Contact | Dynamic form with data-state driven success |
| `RichText` | (unused) | Portable text renderer with prose styling |

#### fulldotdev/ui Blocks (96) — `blocks/`
Generic marketing/SaaS blocks from the fulldev/ui library. Accept flat props + slots. Frontend-only (no Sanity schema). Used as a reference palette / future expansion.

| Category | Variants | Examples |
|---|---|---|
| Hero | 14 | Split image, centered, background video, etc. |
| CTA | 8 | Banner, card, inline, etc. |
| Features | 6 | Grid, list, alternating, etc. |
| Services | 7 | Cards, icon grid, etc. |
| Content | 6 | Long-form, columns, etc. |
| Products | 5 + 1 detail | Catalog grid, carousel, etc. |
| Reviews | 5 | Testimonial cards, walls, etc. |
| Articles | 4 + 2 detail | Blog grids, list, etc. |
| FAQs | 4 | Accordion, grid, etc. |
| Pricing | 3 | Tiers, comparison table, etc. |
| Stats | 3 | Counter rows, infographic, etc. |
| Steps | 3 | Numbered process, timeline, etc. |
| Contact | 3 | Form + map, split, etc. |
| Video(s) | 3 + 4 gallery | Player, showcase, etc. |
| Header | 3 | Navigation variations |
| Footer | 3 | Column layouts |
| Banner | 2 | Notification banners |
| Logos | 3 | Logo clouds/marquees |
| Images | 2 | Gallery, masonry |
| Links | 2 | Link lists |
| Blocks | 4 | Generic content blocks |
| Table | 1 | Data table |
| Skeletons | 1 | Loading placeholder |

All 96 are registered in `BlockRenderer.astro` via an object map, viewable in Storybook.

---

## 6. Interaction Patterns

### Client-Side Behaviors (vanilla JS, < 5KB budget)

| Pattern | Mechanism | Where |
|---|---|---|
| **Scroll animations** | IntersectionObserver on `[data-animate]` | All blocks |
| **Hero carousel** | 5-second auto-play, `data-state="active/inactive"` on slides/dots | Home page hero |
| **Carousel dots** | Click to navigate, expand width on active | Home page hero |
| **Accordion** | `data-state="open/closed"` toggle | FAQ section |
| **Mobile nav** | Sheet component (slide-out drawer) | All pages (mobile) |
| **Contact form** | `data-form-state="success"` after mock submit | Contact page |
| **Selection highlight** | CSS `::selection` in Swiss Red | Global |

### State Management Pattern
- **Zero client-side framework** — all vanilla JS
- **Data attributes for state** — never `classList.add/remove`
- **CSS targets data attributes** — `[data-state="active"] { ... }`
- **Scoped selectors** — always `[data-{block}-trigger]` pattern

---

## 7. UI Primitive Library (38 Families)

All from **fulldotdev/ui** (Astro port of shadcn/ui). Key families:

| Family | Components | Usage |
|---|---|---|
| **Section** | Section, SectionContent, SectionGrid, SectionSplit, SectionActions, etc. | Every block wraps in Section |
| **Tile** | Tile, TileContent, TileTitle, TileDescription, TileMedia, etc. | Cards throughout |
| **Button** | Button (variants: default, outline, ghost; sizes: default, sm, lg, icon) | All CTAs |
| **Accordion** | Accordion, AccordionItem, AccordionTrigger, AccordionContent | FAQ blocks |
| **Sheet** | Sheet, SheetTrigger, SheetContent, etc. | Mobile navigation |
| **Header/Footer** | Compound layout components | Site chrome |
| **Avatar** | Avatar, AvatarImage, AvatarFallback | Team member photos |
| **Badge** | Badge (variants) | Sponsor tier labels |
| **Icon** | Icon (wraps astro-icon) | Throughout |
| **Image** | Image | Throughout |
| **Marquee** | Marquee, MarqueeContent | Logo animations |
| **Field** | Field, FieldSet, FieldLabel, FieldError, etc. | Contact form |

New additions (for fulldotdev/ui blocks): Table, Tabs, Video, Price, Rating, Radio Group, Checkbox, Skeleton, Sidebar, Navigation Menu, Native Carousel, Collapsible, Banner, Alert, Empty, Theme Toggle.

---

## 8. Accessibility Profile

### What's Implemented
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`
- `aria-label="Main navigation"` on desktop/mobile navs
- `aria-label` on carousel dots
- `aria-expanded`, `aria-controls` on accordion items
- `role="alert"` on form error component
- All images have `alt` text (enforced in data)
- Keyboard-accessible accordion and sheet components

### Gaps (for future)
- No skip link in Layout.astro (documented as requirement, not implemented)
- Carousel not keyboard navigable (no arrow key support)
- No focus management on form success state transition
- No `prefers-reduced-motion` media query for carousel auto-play
- Contact form mock doesn't announce success to screen readers

### Targets
- WCAG 2.1 AA compliance
- Lighthouse Accessibility 90+

---

## 9. Performance Profile

### Architecture Advantages
- **100% static site generation** (Astro SSG) — zero runtime JS framework
- **Build-time data resolution** — no client-side API calls
- **< 5KB JS budget** — only scroll animations, carousel, and form handler
- **CSS-only interactions** where possible (data-attribute driven)
- **astro-icon inlines SVGs** at build — no icon font/network requests

### Targets
- Lighthouse 95+ mobile/desktop
- FCP < 1s, LCP < 2s, TBT < 100ms, CLS < 0.05
- CSS budget: < 15KB after purge
- Build time: < 60 seconds

---

## 10. Visual Identity Summary

Imagine a user landing on the site for the first time:

**The hero hits them with confident, editorial presence.** A full-bleed image carousel auto-plays behind semi-transparent dark content. "NJIT Ying Wu College of Computing" in tiny uppercase red letters. "Industry Capstone Program" in massive 8xl bold white type. The text sits on a blurred dark card — modern but grounded. Two buttons: a solid Swiss Red "Become a Sponsor" and a ghost-outlined "View Projects."

**Scrolling down feels decisive.** A dark stats bar punches with "150+ Projects Completed" in large numerals. Feature cards are clean and flat — no gradients, no shadows, no rounded corners. Everything snaps to a grid. Labels are tiny, uppercase, tracked-out. Headlines are huge and tight-tracked. Body text is measured and restrained.

**The palette is binary with a single accent.** Black and white dominate. Swiss Red (#E30613) appears sparingly but powerfully — primary buttons, active nav states, text selection, the thin line at the bottom of the hero. It's a *punctuation mark*, not a wallpaper.

**Typography does the heavy lifting.** Helvetica Neue at various weights and sizes creates all the hierarchy needed. No decorative fonts, no scripts, no display faces. The Swiss tradition of "the typeface IS the design system."

**The CTA pattern is relentless.** Every page funnels toward `/contact`. Red, dark, or light CTA banners close each page. "Become a Sponsor" appears in the header, the hero, and the footer. The message is clear: this site exists to convert visitors into sponsors.

---

## 11. Current Limitations & Future State

| Area | Current (Demo/POC) | Future |
|---|---|---|
| **Data** | Hardcoded TypeScript placeholder objects | Sanity CMS via GROQ queries at build time |
| **Images** | External Pexels URLs | Sanity CDN with `urlFor()` pipeline |
| **Forms** | Mock submit with 1.5s delay | Cloudflare Pages function or external service |
| **Block Selection** | 12 custom + 96 fulldev/ui (unconnected) | Curated subset wired to Sanity schemas |
| **Dark Mode** | CSS defined, not toggled | Theme toggle component available |
| **Search** | None | Potential semantic search via Sanity embeddings |
| **Blog/Articles** | Block components exist, no content | Article document type + pages |
| **Hosting** | GitHub Pages (static) | Cloudflare Pages (with server functions for forms) |
