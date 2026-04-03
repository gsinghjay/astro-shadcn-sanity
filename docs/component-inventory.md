# Component Inventory

*Generated: 2026-03-11 | Scan Level: deep*

## Summary

| Category | Count | Location |
|----------|-------|----------|
| Custom Sanity Blocks | 23 | src/components/blocks/custom/ |
| Generic UI Blocks | 115+ | src/components/blocks/ |
| UI Primitive Families | 39 | src/components/ui/ |
| Top-Level Components | 15 | src/components/ |
| Portal Components (React) | 8 | src/components/portal/ |
| Storybook Stories | 120+ | *.stories.ts files |
| **Total Component Files** | **508+** | |

---

## Custom Sanity Block Components

These components render page builder blocks from Sanity content. Each maps to a schema block type.

| Component | Schema Type | Variants | Story | Test |
|-----------|------------|----------|-------|------|
| HeroBanner.astro | heroBanner | centered, split, split-asymmetric, overlay, spread | 2.1 | Yes |
| FeatureGrid.astro | featureGrid | - | 2.1 | Yes |
| CtaBanner.astro | ctaBanner | centered, split, spread, overlay | 2.1 | Yes |
| StatsRow.astro | statsRow | - | 2.1 | Yes |
| TextWithImage.astro | textWithImage | - | 2.1 | Yes |
| LogoCloud.astro | logoCloud | - | 2.1 | Yes |
| SponsorSteps.astro | sponsorSteps | - | 2.1 | Yes |
| RichText.astro | richText | - | 2.1b | Yes |
| FaqSection.astro | faqSection | - | 2.1b | Yes |
| ContactForm.astro | contactForm | - | 2.1b | Yes |
| SponsorCards.astro | sponsorCards | - | 2.14 | Yes |
| Testimonials.astro | testimonials | - | 2.1b | Yes |
| EventList.astro | eventList | - | 2.1b | Yes |
| ProjectCards.astro | projectCards | - | 2.16 | Yes |
| TeamGrid.astro | teamGrid | grid, grid-compact, split | 2.9 | Yes |
| ImageGallery.astro | imageGallery | grid, masonry, single | 2.9 | Yes |
| ArticleList.astro | articleList | grid, split-featured, list | 2.9 | Yes |
| ComparisonTable.astro | comparisonTable | table, stacked | 2.10 | Yes |
| Timeline.astro | timeline | vertical, split, horizontal | 2.10 | Yes |
| Pullquote.astro | pullquote | centered, split, sidebar | 2.10 | Yes |
| Divider.astro | divider | line, short, labeled | 2.11 | Yes |
| AnnouncementBar.astro | announcementBar | inline, floating | 2.11 | Yes |
| SponsorshipTiers.astro | sponsorshipTiers | - | 2.17 | Yes |

### Block Dispatch Flow

```
Page data (Sanity) → BlockRenderer.astro → block-registry.ts → CustomBlock.astro
                           │                      │
                           ▼                      ▼
                     BlockWrapper.astro    import.meta.glob()
                     (spacing, bg,        auto-discovers all
                      maxWidth)           blocks/custom/*.astro
```

---

## Generic UI Block Variants

Pre-built layout variants from fulldev-ui registry. Used as visual templates that custom blocks can reference.

| Category | Count | Files |
|----------|-------|-------|
| Hero sections | 14 | hero-1.astro through hero-14.astro |
| CTA sections | 8 | cta-1.astro through cta-8.astro |
| Services | 7 | services-1.astro through services-7.astro |
| Features | 6 | features-1.astro through features-6.astro |
| Content | 6 | content-1.astro through content-6.astro |
| Reviews | 5 | reviews-1.astro through reviews-5.astro |
| Products | 5 | products-1.astro through products-5.astro |
| FAQs | 4 | faqs-1.astro through faqs-4.astro |
| Videos | 4 | videos-1.astro through videos-4.astro |
| Articles | 4+2 | articles-1..4.astro + article-1..2.astro |
| Stats | 3 | stats-1.astro through stats-3.astro |
| Steps | 3 | steps-1.astro through steps-3.astro |
| Footers | 3 | footer-1.astro through footer-3.astro |
| Headers | 3 | header-1.astro through header-3.astro |
| Logos | 3 | logos-1.astro through logos-3.astro |
| Pricing | 3 | pricings-1.astro through pricings-3.astro |
| Video (single) | 3 | video-1.astro through video-3.astro |
| Contact | 3 | contact-1.astro through contact-3.astro |
| Images | 2 | images-1.astro, images-2.astro |
| Banners | 2 | banner-1.astro, banner-2.astro |
| Links | 2 | links-1.astro, links-2.astro |
| Table | 1 | table-1.astro |
| Block utilities | 4 | blocks-1..4.astro |
| Product (single) | 1 | product-1.astro |
| **Total** | **115+** | |

---

## UI Primitive Families (39)

shadcn-style composable primitives. Each family has an index.ts barrel export and optional sub-components.

| Family | Key Sub-Components | Purpose |
|--------|-------------------|---------|
| accordion | accordion, accordion-item, accordion-content | Expandable sections |
| alert | alert-title, alert-description | Status messages |
| auto-form | auto-form | Dynamic form generation |
| avatar | avatar-image | Profile pictures |
| badge | badge | Labels and tags |
| banner | banner-close, banner-content, banner-title, banner-description | Dismissible banners |
| button | button | CTAs (default, secondary, outline, ghost) |
| checkbox | checkbox | Form checkbox input |
| collapsible | collapsible, collapsible-trigger, collapsible-content | Toggle panels |
| empty | empty-header, empty-title, empty-description, empty-content | Empty/zero states |
| field | field, field-set, field-group, field-label, field-title, field-legend, field-description, field-content, field-error, field-separator | Form field layouts |
| footer | footer-content, footer-copyright, footer-menu, footer-group, footer-group-label, footer-menu-item, footer-menu-link, footer-actions, footer-split, footer-grid, footer-spread, footer-description | Footer structure |
| header | header-content, header-actions | Header structure |
| icon | icon | Lucide SVG icon system |
| image | image | Responsive images |
| input | input | Text input |
| item | item, item-group, item-content, item-media, item-title, item-description, item-actions | List/grid items |
| label | label | Form labels |
| list | list, list-item | Ordered/unordered lists |
| logo | logo, logo-image, logo-text | Brand logos |
| marquee | marquee, marquee-content | Scrolling content |
| native-carousel | native-carousel, native-carousel-content, native-carousel-previous | Image carousel |
| native-select | native-select, native-select-option, native-select-optgroup | Dropdown |
| navigation-menu | navigation structure | Primary nav |
| price | price | Pricing display |
| radio-group | radio-group | Radio inputs |
| rating | rating | Star ratings |
| section | section-provider, section-content, section-split, section-spread, section-grid, section-masonry, section-actions | **Core layout container** |
| separator | separator | Visual dividers |
| sheet | sheet-header, sheet-footer, sheet-title, sheet-description, sheet-trigger | Modal/drawer |
| sidebar | sidebar | Navigation sidebar |
| skeleton | skeleton | Loading placeholders |
| spinner | spinner | Loading indicator |
| table | table | Data tables |
| tabs | tabs | Tab navigation |
| textarea | textarea | Multi-line text input |
| theme-toggle | theme-toggle | Dark/light mode switch |
| tile | tile, tile-content, tile-split, tile-spread, tile-title, tile-description, tile-actions | Grid tiles |
| video | video | Video player |

### Section Primitive (Critical)

The `section` family is the core layout primitive. All page content is wrapped in Section components:

```astro
<Section>
  <SectionContent>
    <!-- Content here -->
  </SectionContent>
</Section>
```

**Important:** Each `<Section>` adds 48-64px vertical padding. Do NOT stack multiple Sections for content that should appear together — use a single Section with natural gap spacing.

---

## Top-Level Application Components (15)

| Component | Type | Purpose | Test |
|-----------|------|---------|------|
| BlockRenderer.astro | Astro | Block type dispatcher (page builder core) | Yes |
| BlockWrapper.astro | Astro | Block spacing/styling wrapper | Yes |
| block.astro | Astro | Block utilities | No |
| Breadcrumb.astro | Astro | Navigation breadcrumbs | Yes |
| BreadcrumbItem.astro | Astro | Individual breadcrumb | No |
| EventCard.astro | Astro | Event card display | Yes |
| Footer.astro | Astro | Site-wide footer | No |
| Header.astro | Astro | Site-wide header (GTM tests only) | Partial |
| ProjectCard.astro | Astro | Project card display | Yes |
| SanityImage.astro | Astro | Optimized Sanity image (urlFor + LQIP) | Yes |
| SanityLiveUpdater.astro | Astro | Live content subscription | No |
| SanityPageContent.astro | Astro | Dynamic page renderer | No |
| SponsorCard.astro | Astro | Sponsor card display | Yes |
| TestimonialCard.astro | Astro | Testimonial display | No |
| VariantLayout.astro | Astro | Layout variant dispatcher | Yes |

---

## Portal Components (React)

Hydrated React islands for the authenticated sponsor/student portal.

| Component | Hydration | Purpose |
|-----------|-----------|---------|
| PortalCard.tsx | client:load | Card with icon, title, badge |
| PortalIcon.tsx | (child) | Lucide icon renderer |
| PortalSkeleton.tsx | (child) | Animated loading placeholders |
| SponsorProjects.tsx | client:load | Projects list panel |
| PortalCalendar.tsx | client:visible | Schedule-X event calendar |
| EventDetailPopover.tsx | client:load | Event details overlay |
| types.ts | - | PortalUser, PortalNavItem types |

**Architecture Rule:** No direct Sanity fetching in React components. Fetch in `.astro` frontmatter or API endpoints, pass as props.

---

## Design System

### Theme Tokens

| Token | Light | Dark |
|-------|-------|------|
| Primary | Swiss red #e30613 | Same |
| Background | white | neutral-950 |
| Foreground | neutral-950 | neutral-50 |
| Card | white | neutral-900 |
| Muted | neutral-100 | neutral-800 |
| Border | neutral-200 | neutral-800 |

### Multi-Site Themes

| Theme | Primary Color | Data Attribute |
|-------|---------------|----------------|
| Red (Capstone) | #e30613 | default |
| Blue (RWC US) | #2563eb | [data-site-theme="blue"] |
| Green (RWC Intl) | #059669 | [data-site-theme="green"] |

### Typography

- Sans: Helvetica Neue
- Mono: Courier New
- Headings: letter-spacing -0.03em, line-height 1.05
- Body: letter-spacing -0.01em, line-height 1.5

---

## Test Coverage

### Components With Tests (42)

All 23 custom Sanity blocks have dedicated test files plus 19 additional component tests covering BlockRenderer, BlockWrapper, Breadcrumb, Header, SanityImage, EventCard, ProjectCard, SponsorCard, VariantLayout, and events page.

### Components Without Tests

- Footer.astro
- SanityPageContent.astro
- SanityLiveUpdater.astro
- BreadcrumbItem.astro
- block.astro
- TestimonialCard.astro

### Test Fixtures (16+)

Pre-built Sanity content fixtures for each block type, used across component tests.

---
*Generated: 2026-03-11 | Scan Level: deep | Mode: full_rescan*
