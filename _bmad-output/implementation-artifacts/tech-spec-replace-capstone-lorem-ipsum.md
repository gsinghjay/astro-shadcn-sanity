---
title: 'Replace Capstone Content with Lorem Ipsum Data'
slug: 'replace-capstone-lorem-ipsum'
created: '2026-02-08'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Astro 5.x', 'TypeScript', 'Storybook CSF3']
files_to_modify:
  # Data files (6)
  - 'astro-app/src/lib/data/site-settings.ts'
  - 'astro-app/src/lib/data/home-page.ts'
  - 'astro-app/src/lib/data/about-page.ts'
  - 'astro-app/src/lib/data/sponsors-page.ts'
  - 'astro-app/src/lib/data/projects-page.ts'
  - 'astro-app/src/lib/data/contact-page.ts'
  # Component hardcoded strings (3)
  - 'astro-app/src/layouts/Layout.astro'
  - 'astro-app/src/components/blocks/custom/HeroBanner.astro'
  - 'astro-app/src/components/blocks/custom/ContactForm.astro'
  # Custom block stories (12)
  - 'astro-app/src/components/blocks/custom/HeroBanner.stories.ts'
  - 'astro-app/src/components/blocks/custom/TeamGrid.stories.ts'
  - 'astro-app/src/components/blocks/custom/SponsorCards.stories.ts'
  - 'astro-app/src/components/blocks/custom/LogoCloud.stories.ts'
  - 'astro-app/src/components/blocks/custom/Timeline.stories.ts'
  - 'astro-app/src/components/blocks/custom/FeatureGrid.stories.ts'
  - 'astro-app/src/components/blocks/custom/TextWithImage.stories.ts'
  - 'astro-app/src/components/blocks/custom/CtaBanner.stories.ts'
  - 'astro-app/src/components/blocks/custom/StatsRow.stories.ts'
  - 'astro-app/src/components/blocks/custom/RichText.stories.ts'
  - 'astro-app/src/components/blocks/custom/ContactForm.stories.ts'
  - 'astro-app/src/components/blocks/custom/FaqSection.stories.ts'
  # UI component stories (3)
  - 'astro-app/src/components/ui/tabs/tabs.stories.ts'
  - 'astro-app/src/components/ui/table/table.stories.ts'
  - 'astro-app/src/components/ui/marquee/marquee.stories.ts'
code_patterns:
  - 'Data files export typed Page objects with blocks[] arrays'
  - 'Stories use CSF3 args.block pattern for custom blocks'
  - 'Stories use CSF3 direct args for UI components'
  - 'Block structure keys (_type, _key, layout, variant, columns, tier) are invariant'
  - 'Image URLs use pexels.com or placehold.co — keep or replace with placehold.co'
test_patterns:
  - 'npm run build — TypeScript compilation check'
  - 'npm run storybook — visual rendering verification'
---

# Tech-Spec: Replace Capstone Content with Lorem Ipsum Data

**Created:** 2026-02-08

## Overview

### Problem Statement

The project currently contains real NJIT capstone program data (company names, student names, stats, descriptions, contact info) embedded throughout data files, custom block stories, UI stories, and hardcoded component strings. This needs to be genericized for the project to function as a reusable starter/template.

### Solution

Replace all human-readable content values with Lorem Ipsum placeholder text while preserving all data structures, component architecture, tier hierarchies, and page layouts exactly as they are.

### Scope

**In Scope:**
- 6 data files in `astro-app/src/lib/data/` (home, about, sponsors, projects, contact, site-settings)
- 12 custom block `.stories.ts` files (mock data args)
- 5 UI component `.stories.ts` files (tabs, table, marquee content)
- 1 hardcoded string in `HeroBanner.astro` (line 46)
- `Layout.astro` meta description
- `ContactForm.astro` success message

**Out of Scope:**
- Header/Nav component (keep as-is)
- Footer component (keep as-is)
- Logo / NJIT logo assets (keep as-is)
- All fulldotdev block stories (already generic)
- Component architecture / prop interfaces / types
- Sanity schemas

## Context for Development

### Codebase Patterns

- Data files export typed `Page` objects conforming to `../types` interfaces with `blocks[]` arrays
- Each block has `_type` (string), `_key` (string), plus content-specific fields
- Stories use Storybook CSF3: custom blocks pass `args.block` object, UI components use direct `args`
- Custom blocks receive data via `{ block }` Astro prop destructuring
- All structural keys are invariant: `_type`, `_key`, `layout`, `variant`, `columns`, `tier`, `imagePosition`, `style`
- Pexels image URLs used in data files; placehold.co URLs used in stories
- Navigation labels and routes (`/about`, `/sponsors`, `/projects`, `/contact`) stay unchanged

### Files to Reference

| File | Purpose | Content to Replace |
| ---- | ------- | ------------------ |
| `astro-app/src/lib/data/site-settings.ts` | Global site config | `description`, `footerText` |
| `astro-app/src/lib/data/home-page.ts` | Home page blocks | All block content: hero, stats, features, textWithImage, logoCloud, timeline, ctaBanner |
| `astro-app/src/lib/data/about-page.ts` | About page blocks | All block content: hero, textWithImage, featureGrid, faqSection, ctaBanner |
| `astro-app/src/lib/data/sponsors-page.ts` | Sponsors page blocks | All block content: hero, 3x sponsorCards (with company names, descriptions, themes), statsRow, ctaBanner |
| `astro-app/src/lib/data/projects-page.ts` | Projects page blocks | All block content: hero, teamGrid (team names, member names/roles/majors, project names, sponsors), ctaBanner |
| `astro-app/src/lib/data/contact-page.ts` | Contact page blocks | All block content: hero, contactForm (field placeholders, options), featureGrid (address, email, phone) |
| `astro-app/src/layouts/Layout.astro` | Layout defaults | `description` default prop value |
| `astro-app/src/components/blocks/custom/HeroBanner.astro` | Hero component | Line 46: hardcoded "NJIT Ying Wu College of Computing" label |
| `astro-app/src/components/blocks/custom/ContactForm.astro` | Contact form | Line 90: hardcoded "A program coordinator will respond within two business days." |
| `12x custom block .stories.ts` | Story mock data | All headline, description, name, stat, date, Q&A content in `args.block` |
| `3x UI .stories.ts` | UI story mock data | Company names in table/marquee, program content in tabs |

### Technical Decisions

- Use standard Lorem Ipsum text for body content, descriptions, and paragraphs
- Use generic placeholder company names (e.g., "Acme Corp", "Lorem Industries", "Ipsum Solutions", "Dolor Tech", "Sit Amet Inc")
- Use generic placeholder people names (e.g., "Jane Doe", "John Smith", "Alex Johnson")
- Replace real stats with round placeholder numbers (e.g., "100+", "50+", "99%")
- Replace real contact info with dummy values (e.g., "hello@example.com", "(555) 123-4567", "123 Main Street, Anytown, ST 12345")
- Replace real company URLs with `https://example.com`
- Replace pexels image URLs in data files with `https://placehold.co/WIDTHxHEIGHT` equivalents
- Keep placehold.co URLs in stories as-is (already generic)
- Preserve ALL data structure shapes, array lengths, field names, and structural values exactly
- Replace FAQ answers with Lorem Ipsum paragraphs of similar length
- Replace timeline dates with generic "Month Year" placeholders (e.g., "January 2025", "March 2025")

## Implementation Plan

### Tasks

#### Task 1: Replace hardcoded component strings (3 files)

These are the simplest changes — single-line string replacements in Astro components.

- [ ] Task 1a: Update `Layout.astro` description default
  - File: `astro-app/src/layouts/Layout.astro`
  - Action: Replace `description = "Connecting industry sponsors with capstone teams at NJIT Ying Wu College of Computing"` with `description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit"`
  - Notes: Keep `title` default as-is ("YWCC Industry Capstone Program") per user request to keep branding

- [ ] Task 1b: Update `HeroBanner.astro` hardcoded label
  - File: `astro-app/src/components/blocks/custom/HeroBanner.astro`
  - Action: Line 46 — replace `"NJIT Ying Wu College of Computing"` with `"Lorem Ipsum Dolor Sit Amet"`
  - Notes: This is a `<span>` label above the headline

- [ ] Task 1c: Update `ContactForm.astro` success message
  - File: `astro-app/src/components/blocks/custom/ContactForm.astro`
  - Action: Line 90 — replace `"A program coordinator will respond within two business days."` with `"Lorem ipsum dolor sit amet, consectetur adipiscing elit."`
  - Notes: Displayed inside the form success state div

#### Task 2: Replace site-settings data

- [ ] Task 2: Update site-settings.ts
  - File: `astro-app/src/lib/data/site-settings.ts`
  - Action: Replace content string values only:
    - `description`: Lorem ipsum placeholder
    - `footerText`: Lorem ipsum placeholder
  - Notes: Keep `title: 'YWCC Industry Capstone'` and all `navigation` entries unchanged

#### Task 3: Replace home-page data

- [ ] Task 3: Update home-page.ts
  - File: `astro-app/src/lib/data/home-page.ts`
  - Action: Replace all content values in all blocks while preserving structure:
    - `heroBanner`: Replace `headline`, `subheadline`, `ctaText`, `secondaryCtaText` with Lorem Ipsum. Replace `backgroundImages[].alt` with generic alt text. Replace pexels URLs with `https://placehold.co/1920x1080` equivalents
    - `statsRow`: Replace `stats[].value` and `stats[].label` with generic placeholders (e.g., "100+", "Lorem Ipsum")
    - `featureGrid`: Replace `label`, `headline`, `subtitle`, and all `features[].title`, `features[].description`, `features[].stat` with Lorem Ipsum
    - `textWithImage`: Replace `label`, `headline`, `body`, `ctaText`. Replace pexels URL with placehold.co
    - `logoCloud`: Replace `label` and all `logos[].name` with generic company names. Replace `logos[].website` with `https://example.com`
    - `timeline`: Replace `label`, `headline`, and all `events[].date`, `events[].title`, `events[].description` with generic Lorem content
    - `ctaBanner`: Replace `headline`, `body`, `ctaText`, `secondaryCtaText`
  - Notes: Keep all `_type`, `_key`, `layout`, `variant`, `imagePosition`, `icon` values. Keep `ctaUrl`/`secondaryCtaUrl` path values unchanged. Keep array lengths identical.

#### Task 4: Replace about-page data

- [ ] Task 4: Update about-page.ts
  - File: `astro-app/src/lib/data/about-page.ts`
  - Action: Replace all content values:
    - `heroBanner`: Replace `headline`, `subheadline`
    - `textWithImage`: Replace `label`, `headline`, `body`. Replace pexels URL with placehold.co
    - `featureGrid`: Replace `label`, `headline`, all `features[].title`, `features[].description`
    - `faqSection`: Replace `label`, `headline`, all `items[].question`, `items[].answer` with Lorem Ipsum Q&As of similar length
    - `ctaBanner`: Replace `headline`, `body`, `ctaText`
  - Notes: Keep all structural values. Keep 7 FAQ items, 4 features, same structure.

#### Task 5: Replace sponsors-page data

- [ ] Task 5: Update sponsors-page.ts
  - File: `astro-app/src/lib/data/sponsors-page.ts`
  - Action: Replace all content values:
    - `heroBanner`: Replace `headline`, `subheadline`
    - 3x `sponsorCards`: Replace `label`, `headline`, and for each sponsor: `name` (generic company names), `description` (Lorem Ipsum), `website` → `https://example.com`, `projectThemes[]` (generic tech terms), `yearJoined` (generic years)
    - `statsRow`: Replace `stats[].value` and `stats[].label`
    - `ctaBanner`: Replace `headline`, `body`, `ctaText`
  - Notes: Keep tier values (`platinum`, `gold`, `silver`). Keep same number of sponsors per tier. Keep `_key` values.

#### Task 6: Replace projects-page data

- [ ] Task 6: Update projects-page.ts
  - File: `astro-app/src/lib/data/projects-page.ts`
  - Action: Replace all content values:
    - `heroBanner`: Replace `headline`, `subheadline`
    - `teamGrid`: Replace `label`, `headline`, `subtitle`, and for each team: `teamName` (generic names), `project` (Lorem project names), `sponsor` (generic company names matching sponsors-page), and for each member: `name` (generic names), `role` (keep generic dev roles), `major` (keep generic majors), `imageUrl` → replace pexels with `https://placehold.co/200x200`
    - `ctaBanner`: Replace `headline`, `body`, `ctaText`
  - Notes: Keep 4 teams. Keep member counts (5, 4, 5, 4). Keep all `_key` values.

#### Task 7: Replace contact-page data

- [ ] Task 7: Update contact-page.ts
  - File: `astro-app/src/lib/data/contact-page.ts`
  - Action: Replace all content values:
    - `heroBanner`: Replace `headline`, `subheadline`
    - `contactForm`: Replace `headline`, `subtitle`. Replace `fields[].placeholder` values with generic text. Replace `fields[].options` with generic options (e.g., "Option A", "Option B", "Option C", "Option D", "Option E")
    - `featureGrid`: Replace `label`, and all `features[].title`, `features[].description` — use dummy address, email (hello@example.com), phone ((555) 123-4567)
  - Notes: Keep field `name`, `label`, `type`, `required` values. Keep `_key` values.

#### Task 8: Replace custom block story content (12 files)

- [ ] Task 8a: Update HeroBanner.stories.ts
  - File: `astro-app/src/components/blocks/custom/HeroBanner.stories.ts`
  - Action: Replace all `headline`, `subheadline`, `ctaText`, `secondaryCtaText` values with Lorem Ipsum

- [ ] Task 8b: Update TeamGrid.stories.ts
  - File: `astro-app/src/components/blocks/custom/TeamGrid.stories.ts`
  - Action: Replace `headline`, `subtitle`, all team names, sponsor names, project names, member names, faculty names with generic placeholders

- [ ] Task 8c: Update SponsorCards.stories.ts
  - File: `astro-app/src/components/blocks/custom/SponsorCards.stories.ts`
  - Action: Replace `headline`, all sponsor `name`, `description`, `projectThemes` with generic content

- [ ] Task 8d: Update LogoCloud.stories.ts
  - File: `astro-app/src/components/blocks/custom/LogoCloud.stories.ts`
  - Action: Replace `label` and all `logos[].name` with generic company names. Update placehold.co text params to match new names.

- [ ] Task 8e: Update Timeline.stories.ts
  - File: `astro-app/src/components/blocks/custom/Timeline.stories.ts`
  - Action: Replace `headline`, all `events[].date`, `events[].title`, `events[].description` with generic timeline content

- [ ] Task 8f: Update FeatureGrid.stories.ts
  - File: `astro-app/src/components/blocks/custom/FeatureGrid.stories.ts`
  - Action: Replace all `headline`, `subtitle`, `features[].title`, `features[].description`, `features[].stat` values

- [ ] Task 8g: Update TextWithImage.stories.ts
  - File: `astro-app/src/components/blocks/custom/TextWithImage.stories.ts`
  - Action: Replace all `label`, `headline`, `body`, `ctaText` values

- [ ] Task 8h: Update CtaBanner.stories.ts
  - File: `astro-app/src/components/blocks/custom/CtaBanner.stories.ts`
  - Action: Replace `headline`, `body`, `ctaText`, `secondaryCtaText` values

- [ ] Task 8i: Update StatsRow.stories.ts
  - File: `astro-app/src/components/blocks/custom/StatsRow.stories.ts`
  - Action: Replace all `stats[].value` and `stats[].label` values

- [ ] Task 8j: Update RichText.stories.ts
  - File: `astro-app/src/components/blocks/custom/RichText.stories.ts`
  - Action: Replace all `children[].text` span values with Lorem Ipsum text of similar length

- [ ] Task 8k: Update ContactForm.stories.ts
  - File: `astro-app/src/components/blocks/custom/ContactForm.stories.ts`
  - Action: Replace `headline`, `subtitle`, field `placeholder` values, and `options` array values

- [ ] Task 8l: Update FaqSection.stories.ts
  - File: `astro-app/src/components/blocks/custom/FaqSection.stories.ts`
  - Action: Replace `headline` and all `items[].question`, `items[].answer` with Lorem Ipsum Q&A pairs

#### Task 9: Replace UI component story content (3 files)

- [ ] Task 9a: Update tabs.stories.ts
  - File: `astro-app/src/components/ui/tabs/tabs.stories.ts`
  - Action: Replace all `tabs[].content` values with Lorem Ipsum text. Replace tab `label` and `value` with generic names (e.g., "Tab One", "tab-one")

- [ ] Task 9b: Update table.stories.ts
  - File: `astro-app/src/components/ui/table/table.stories.ts`
  - Action: Replace `rows[].team`, `rows[].sponsor` values with generic names. Replace `caption` value.

- [ ] Task 9c: Update marquee.stories.ts
  - File: `astro-app/src/components/ui/marquee/marquee.stories.ts`
  - Action: Replace the `ScrollRight` items array company names with generic company names. Keep `ScrollLeft` (tech names like React, TypeScript) and `PauseOnHover` as-is since those are generic tech stack names.

#### Task 10: Build verification

- [ ] Task 10: Run build and verify
  - Action: Run `npm run build` to verify TypeScript compiles with no errors
  - Notes: If build fails, fix type mismatches from content changes

### Acceptance Criteria

- [ ] AC 1: Given the project builds, when `npm run build` is run, then it completes with zero TypeScript errors
- [ ] AC 2: Given all data files are updated, when the site is viewed, then no NJIT-specific company names, student names, or contact info appear in page content
- [ ] AC 3: Given all stories are updated, when Storybook is opened, then all custom block and UI component stories render with Lorem Ipsum placeholder content and no capstone-specific text
- [ ] AC 4: Given the Header component is unchanged, when the header is viewed, then it still shows the NJIT logo, "YWCC" text, and "Industry Capstone" branding
- [ ] AC 5: Given the Footer component is unchanged, when the footer is viewed, then it still shows the NJIT logo, YWCC branding, and footer contact/link data
- [ ] AC 6: Given data structures are preserved, when comparing before/after, then all arrays have the same length, all `_type`/`_key`/`layout`/`variant`/`columns`/`tier` values are identical, and all field names are unchanged
- [ ] AC 7: Given image URLs are replaced, when viewing the site, then data files use `placehold.co` URLs (no pexels URLs remain in data files) and stories retain their existing placehold.co URLs
- [ ] AC 8: Given the search is run, when grepping for real company names (JPMorgan, Prudential, ADP, Verizon, Panasonic, BD, Broadridge, MetLife, Realogy) in `astro-app/src/lib/data/` and `astro-app/src/components/blocks/custom/*.stories.ts` and `astro-app/src/components/ui/`, then zero matches are found
- [ ] AC 9: Given the search is run, when grepping for real people names (Sarah Chen, Marcus Williams, Priya Patel, etc.) in the same directories, then zero matches are found
- [ ] AC 10: Given the search is run, when grepping for real contact info (capstone@njit.edu, 973-596-3366, GITC Building) in `astro-app/src/`, then zero matches are found (except Header.astro and Footer.astro which are out of scope)

## Additional Context

### Dependencies

- No external dependencies — pure content replacement
- No package installs needed
- No schema changes needed
- No type interface changes needed (all replacement values conform to existing types)

### Testing Strategy

- **Build check**: `npm run build` — verifies TypeScript compilation with all replaced values
- **Storybook check**: `npm run storybook` — visual verification that all blocks render correctly with new content
- **Grep verification**: Search for real company names, people names, and contact info to confirm complete removal
- **Manual spot-check**: Verify Header, Footer, and Logo remain untouched

### Notes

- **Preserved elements** (per user request): Logo, YWCC capstone branding in Header/Footer/Layout title, footer data, navigation labels/routes
- **Risk**: Minimal — all changes are string value replacements within existing typed structures. No structural, architectural, or logic changes.
- **Future consideration**: When Sanity CMS integration is complete (Epic 2), this static data will be replaced by CMS-driven content, making these Lorem Ipsum values temporary seed data.
