# Design System: NJIT Astro + Sanity

## 1. Visual Theme & Atmosphere

The design language draws directly from **NJIT's institutional identity** layered on a Swiss International Style grid. The aesthetic is **bold, high-contrast, and engineered**: white surfaces, dark charcoal text, and NJIT Red as the singular vivid accent. The system communicates a research university's precision and authority.

Corners are **sharp everywhere** (`--radius: 0`) -- buttons, inputs, cards, and containers all use squared-off edges, matching njit.edu exactly. There is zero decorative rounding in the system.

Depth is **completely flat**. No box-shadows on primary UI elements. Shadows appear only on "floating" layout variants (headers, sections) as a subtle structural cue, never as decoration. The interface trusts color contrast, weight, and whitespace to establish hierarchy.

The overall mood: **institutional confidence** -- the visual equivalent of a well-designed research paper or engineering specification.

## 2. Color Palette & Roles

### Primary Brand

| Name | Hex | Role |
|------|-----|------|
| **NJIT Red** | `#CC0000` | Primary actions (CTAs, buttons), focus rings, active navigation, text links, accent dividers, selection highlight, carousel indicators. The anchor of the entire visual system. |
| **NJIT Red Dark** | `#990000` | Destructive / danger actions. Darker shade for alerts and error states. |

### Neutrals

| Name | Hex | Role |
|------|-----|------|
| **Charcoal** | `#222222` | Primary foreground text (headings, labels). Dark section/footer backgrounds (`bg-foreground`). The dominant text color throughout. |
| **White** | `#FFFFFF` | Page background, button text on red, card surfaces. |
| **Cloud** | `#F7F7F7` | Secondary/muted/accent backgrounds. Sidebar fill. Alternating section tint for visual rhythm. |
| **Chalk** | `#E5E5E5` | Borders, dividers, structural lines. |
| **Ash** | `#D4D4D4` | Input borders. Slightly heavier than structural borders for form affordance. |
| **Fossil** | `#6B6B6B` | Muted foreground -- captions, secondary labels, timestamps, attribution text. |

### Institutional Accents

| Name | Hex | Role |
|------|-----|------|
| **NJIT Navy** | `#003366` | Chart color 2. Deep blue for data visualization contrast. |
| **NJIT Gold** | `#E89B32` | Chart color 3. Warm amber for tertiary data series. |
| **Alert Gold** | `#FFC82D` | Announcement/alert banners. Vivid warm gold for time-sensitive notices. |

### Extended Gray Scale (Brand Swatches)

Available for fine-grained design needs:

| Token | Hex |
|-------|-----|
| `swiss-100` | `#F7F7F7` |
| `swiss-200` | `#E5E5E5` |
| `swiss-300` | `#D4D4D4` |
| `swiss-400` | `#A3A3A3` |
| `swiss-500` | `#737373` |
| `swiss-600` | `#525252` |
| `swiss-700` | `#404040` |
| `swiss-800` | `#262626` |
| `swiss-900` | `#171717` |

### Theme Overrides

The primary color is swappable at the site level via `data-site-theme`:

| Theme | Primary | Character |
|-------|---------|-----------|
| **Red** (default) | `#CC0000` | NJIT institutional identity |
| **Blue** | `#2563EB` | Computing / corporate contexts |
| **Green** | `#059669` | Sustainability / growth contexts |

### Dark Mode

Dark mode inverts the canvas to near-black (`#0A0A0A`) with soft-white text (`#F7F7F7`). Cards elevate to `#171717`. Borders become translucent white (`rgba(255,255,255,0.1)`). NJIT Red carries through unchanged, ensuring brand consistency across modes.

## 3. Typography Rules

**Display Font** (`--font-display`): Helvetica Neue, Helvetica, Arial, sans-serif. Used for all headings (h1-h6). Matches NJIT's use of Helvetica Neue LT for display text.

**Body Font** (`--font-sans`): Helvetica Neue, Helvetica, Arial, sans-serif. Neutral, professional, and universally legible.

**Monospace** (`--font-mono`): Courier New, Courier, monospace. For code blocks and technical content.

**Body Text:** 16px base, line-height 1.5, letter-spacing -0.01em. Slightly tightened tracking for a modern, compact feel.

**Headings:** Weight **750** (extra-bold), letter-spacing -0.03em, line-height 1.05. Heavier than standard bold (700), matching NJIT's institutional heading weight. Dense, authoritative display text.

**Prose Headings:** Semibold (600 weight) within content areas, line-height 1.1, with `scroll-mt-20` for anchor navigation.

**Prose Paragraphs:** Line-height 1.6 within content blocks for sustained reading comfort.

**Label Caps:** 11px, weight 750, uppercase, 0.12em tracking, line-height 1. Used for navigation items, button labels, category tags, and micro-copy. Matches NJIT's button/nav label treatment.

### Typographic Scale (Prose Variants)

| Element | Small (`max-w-2xl`) | Default (`max-w-3xl`) | Large (`max-w-4xl`) |
|---------|------|---------|-------|
| Body | text-sm (14px) | text-base (16px) | text-lg (18px) |
| H1 | text-3xl | text-4xl | text-4xl / text-5xl (at @5xl) |
| H2 | text-2xl | text-3xl | text-4xl |
| H3 | text-xl | text-2xl | text-3xl |
| H4 | text-lg | text-xl | text-2xl |
| H5 | text-base | text-lg | text-xl |
| H6 | text-sm | text-base | text-lg |

## 4. Component Stylings

### Buttons

Sharp-cornered rectangles (`rounded-md`) with medium weight text at 14px. No shadows. Six intent variants:

- **Default:** NJIT Red fill (`#CC0000`) with white text. Darkens to 90% opacity on hover. The primary call-to-action.
- **Destructive:** Deep red fill (`#990000`). Signals irreversible or dangerous actions.
- **Outline:** Transparent with a thin border and whisper shadow. Hover fills with accent background. Secondary action style.
- **Secondary:** Cloud fill (`#F7F7F7`) with charcoal text. For supporting actions.
- **Ghost:** Completely transparent until hovered. For tertiary or inline actions.
- **Link:** Inline text in NJIT Red with underline on hover. No background or border.

**Sizes:** Compact (h-8, 32px), Default (h-9, 36px), Large (h-10, 40px), plus three icon-only sizes.

**Focus:** 3px ring in NJIT Red at 50% opacity.

### Cards (Tiles)

- **Default:** Transparent, borderless. Content floats on the page surface. On hover (when linked), a soft ring blooms outward.
- **Floating:** Card background, thin border, subtle shadow (`shadow-sm`), 24px internal padding. Slightly rounded (`rounded-sm`). An elevated, self-contained content unit.

### Inputs & Forms

- **Text Inputs:** 36px height, transparent background, Ash border (`#D4D4D4`), whisper shadow. Focus brings border to NJIT Red with a 3px glow. Sharp corners.
- **Textareas:** Same styling, minimum 64px height, auto-growing.
- **Labels:** 14px, medium weight, flex-aligned.

### Badges

Compact (`rounded-md`, `px-2 py-0.5`) at 12px with medium weight. Variants: default (primary), secondary, destructive, outline.

### Accent Dividers

A signature NJIT pattern: thin 1px red bottom-borders used as decorative separators. Available via the `accent-divider` utility class. Used under stat numbers, between content sections, and as visual anchors.

### Navigation Items

Extra-bold (750), uppercase, wide-tracked (0.12em) at 11px via `label-caps`. Active state turns NJIT Red. Background stays transparent -- navigation is purely typographic.

## 5. Layout Principles

### Responsive Gutter System

A single CSS custom property (`--gutter`) governs all edge padding:

| Breakpoint | Gutter | Character |
|------------|--------|-----------|
| Mobile (<640px) | 16px | Tight, content-forward |
| Tablet (640px+) | 24px | Comfortable breathing room |
| Desktop (1024px+) | 32px | Generous margin for wide screens |

### Section Rhythm

Sections use CSS custom properties for vertical padding that scales with breakpoints:

| Size | Mobile | Desktop (1024px+) |
|------|--------|--------------------|
| Small | `spacing * 8` (32px) | `spacing * 12` (48px) |
| Default | `spacing * 12` (48px) | `spacing * 16` (64px) |
| Large | `spacing * 24` (96px) | `spacing * 32` (128px) |

Horizontal padding is dynamically calculated to center content within a max-width (default: `breakpoint-xl`, 1280px) while respecting the gutter minimum.

### Content Gap

Within a section, child elements are separated by a consistent `gap-16` (64px), establishing a strong vertical rhythm.

### Block Backgrounds

Page-builder blocks support four surface treatments:

- **White:** No additional styling (transparent on page background).
- **Light:** Cloud (`bg-muted`) tint for alternating emphasis.
- **Dark:** Inverted -- Charcoal background (`#222222`) with white text. Matches NJIT's footer treatment.
- **Primary:** NJIT Red background with white text for high-impact callouts.

### Header

Sticky, 64px tall, full-width with dynamic horizontal padding. Two variants: **default** (full-width, transparent border-bottom) and **floating** (constrained width, visible border, slight top offset).

### Footer

Mirrors the section padding system. Typically rendered inverted (`bg-foreground text-background`) -- Charcoal background with white text, matching NJIT's `#222222` footer.

### Container Queries

Sections, tiles, and block grids use `@container` queries for component-level responsive design. Layout adapts to available width rather than viewport alone.

### Whitespace Philosophy

Whitespace is structural. Large vertical gaps between sections create reading rhythm. Extra-bold headings with tight tracking allow generous surrounding space without feeling sparse. The system trusts emptiness to communicate hierarchy -- an engineering-informed approach to visual information architecture.
