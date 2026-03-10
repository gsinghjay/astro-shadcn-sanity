---
title: "GTM & Analytics Strategy: How Tracking Works"
description: "Explains how Google Tag Manager integrates with the site, what events are tracked, how data flows from components to GA4, and how to add new tracking without code changes."
date: 2026-03-01
---

# GTM & Analytics Strategy: How Tracking Works

The YWCC Capstone site uses Google Tag Manager (GTM) as its analytics layer. GTM sits between the site's HTML and Google Analytics 4 (GA4), giving business users a web dashboard to create, modify, and deploy tracking tags without touching code. This page covers how data flows, what is tracked, and how both non-technical and technical team members extend tracking.

## Why GTM Instead of Raw GA4

The site previously loaded the GA4 `gtag.js` snippet directly. Every new tracking event required a code change, a pull request, a build, and a deploy. GTM removes that bottleneck.

| Capability | Raw GA4 (`gtag.js`) | Google Tag Manager |
|:-----------|:--------------------|:-------------------|
| **Add a new event** | Code change + deploy | GTM dashboard (no code) |
| **Track a button click** | Write JavaScript, merge PR | Point-and-click trigger in GTM |
| **A/B test a conversion goal** | Redeploy with new logic | GTM workspace draft + preview |
| **Add a third-party pixel** | Edit CSP + Layout.astro | Add tag in GTM dashboard |
| **Who can do it** | Developer only | Any GTM dashboard user |

GTM does not replace GA4. GA4 remains the analytics destination. GTM is the delivery mechanism that fires GA4 tags (and any other tags) based on triggers you define in the dashboard.

## How Data Flows

```text
User clicks a CTA button
        |
        v
+-------------------------------+
|  HTML element has attributes  |
|  data-gtm-category="cta"     |
|  data-gtm-action="click"     |
|  data-gtm-label="Get Started" |
+-------------------------------+
        |
        v
+-------------------------------+
|  GTM reads DOM attributes     |
|  (Click trigger + variables)  |
|                               |
|  OR                           |
|                               |
|  JavaScript pushes event to   |
|  window.dataLayer             |
+-------------------------------+
        |
        v
+-------------------------------+
|  GTM fires matching tags      |
|  (GA4 event, conversion       |
|   pixel, etc.)                |
+-------------------------------+
        |
        v
+-------------------------------+
|  GA4 receives event data      |
|  Reports, funnels, audiences  |
+-------------------------------+
```

Two mechanisms feed data into GTM:

1. **DOM attributes** (`data-gtm-*`) -- GTM reads these directly from HTML elements when click or visibility triggers fire. No JavaScript required.
2. **DataLayer pushes** (`window.dataLayer.push()`) -- JavaScript pushes structured event objects for interactions that need richer data (form submissions, accordion expansions, carousel navigation).

## The GTM Script and Performance

The GTM container loads asynchronously in `Layout.astro` and only renders when the `PUBLIC_GTM_ID` environment variable is set:

```astro
{gtmId && (
  <script define:vars={{ gtmId }}>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',gtmId);
  </script>
)}
```

**Key performance details:**

- The `j.async=true` flag ensures the GTM script never blocks page rendering
- The `<noscript>` iframe fallback in `<body>` handles users with JavaScript disabled
- All `dataLayer.push()` calls use inline scripts or event listeners -- none add render-blocking resources
- The site maintains LCP under 2 seconds and Lighthouse Performance at 89+ with GTM active

## What Gets Tracked

### Page Views (automatic)

Every page load pushes a `page_view` event to the dataLayer with path, title, and template type:

```javascript
window.dataLayer.push({
  event: 'page_view',
  page: {
    path: '/sponsors',
    title: 'Sponsors | YWCC Industry Capstone',
    template: 'default'
  }
});
```

The `template` value distinguishes page types (`default`, `landing`, `detail`) so you can segment analytics by template.

### DOM Attribute Tracking (click and visibility triggers)

GTM reads `data-gtm-*` attributes directly from the DOM. No dataLayer push is needed -- you configure triggers in the GTM dashboard to fire on clicks or element visibility.

| Attribute | Purpose | Example Values |
|:----------|:--------|:---------------|
| `data-gtm-category` | Groups the element by context | `cta`, `navigation`, `footer`, `social`, `sponsor`, `project`, `event`, `testimonial` |
| `data-gtm-action` | Describes the interaction type | `click`, `detail`, `external` |
| `data-gtm-label` | Human-readable identifier | Button text, sponsor name, link label |
| `data-gtm-section` | Identifies the page block type | `heroBanner`, `ctaBanner`, `faqSection`, `sponsorGrid` |

Real example from `Header.astro` -- a navigation link:

```astro
<a
  href={item.href}
  data-gtm-category="navigation"
  data-gtm-label={stegaClean(item.label)}
>
  {item.label}
</a>
```

Real example from `HeroBanner.astro` -- a CTA button:

```astro
<Button
  href={btn.url}
  data-gtm-category="cta"
  data-gtm-action="click"
  data-gtm-label={stegaClean(btn.text)}
>
  {btn.text}
</Button>
```

### Interaction Events (dataLayer pushes)

These events fire via JavaScript in `main.ts` when the user performs specific interactions:

| Event Name | Trigger | Data |
|:-----------|:--------|:-----|
| `form_start` | First field focus on the contact form | `form.name: 'contact'` |
| `form_submit` | Successful form submission | `form.name: 'contact'` |
| `faq_expand` | FAQ accordion item opened | `faq.question: '<question text>'` |
| `carousel_navigate` | Hero carousel dot clicked | `carousel.index: <number>` |

Example from `main.ts` -- FAQ accordion tracking:

```typescript
document.querySelectorAll('[data-slot="accordion-item"]').forEach((item) => {
  item.addEventListener('toggle', () => {
    if ((item as HTMLDetailsElement).open) {
      const question = item.querySelector('[data-slot="accordion-trigger"]')?.textContent?.trim() || '';
      window.dataLayer.push({ event: 'faq_expand', faq: { question } });
    }
  });
});
```

All interaction pushes are guarded with `if (!window.dataLayer) return` so the site works normally when GTM is not loaded (local development, staging without a GTM ID).

## The stegaClean Requirement

Sanity Visual Editing injects invisible Unicode characters ("stega encoding") into content strings. These characters let the Visual Editing overlay know which field each piece of text came from. The encoding is invisible to users but corrupts analytics labels.

Without cleaning, a `data-gtm-label` value might contain hidden characters that make GTM variable extraction unreliable. Every `data-gtm-*` value derived from Sanity content must pass through `stegaClean()`:

```astro
<!-- CORRECT: cleaned value for tracking -->
data-gtm-label={stegaClean(sponsor.name)}

<!-- WRONG: stega encoding corrupts the label -->
data-gtm-label={sponsor.name}
```

The `stegaClean` function is imported from `@sanity/client/stega` and is already present in every component that renders Sanity content.

## How to Add Tracking Without Code Changes (GTM Dashboard)

This workflow is for GTM dashboard users (business analysts, marketing) who want to track new interactions using existing `data-gtm-*` attributes.

**Step 1: Identify the element.** Use your browser's developer tools to inspect the element. Look for `data-gtm-category`, `data-gtm-action`, and `data-gtm-label` attributes.

**Step 2: Create a GTM trigger.** In the GTM dashboard, create a Click trigger filtered by the `data-gtm-*` attribute values. For example, to track all sponsor card clicks:

- Trigger type: Click - All Elements
- Fire on: `Click Element` matches CSS selector `[data-gtm-category="sponsor"]`

**Step 3: Create a GTM tag.** Create a GA4 Event tag that fires on your new trigger. Map the `data-gtm-label` value to a GA4 event parameter using a GTM variable (Data Layer Variable or DOM Element Variable).

**Step 4: Preview and publish.** Use GTM's Preview mode to verify the tag fires correctly, then publish the workspace.

## How to Add Tracking for New Components (Developer Workflow)

When building a new component that needs tracking, follow these patterns:

### Add DOM attributes for click/visibility tracking

Use `data-gtm-category`, `data-gtm-action`, and `data-gtm-label` on interactive elements. Derive label values from Sanity content and clean them with `stegaClean()`:

```astro
---
import { stegaClean } from '@sanity/client/stega';
const { title, url } = Astro.props;
---
<a
  href={url}
  data-gtm-category="resource"
  data-gtm-action="click"
  data-gtm-label={stegaClean(title)}
>
  {title}
</a>
```

### Add dataLayer pushes for richer interactions

For interactions that need more context than DOM attributes provide (multi-step flows, computed values), push directly to the dataLayer in `main.ts`:

```typescript
// In initGtmEvents() within main.ts
const widget = document.querySelector('[data-my-widget]');
if (widget) {
  widget.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'widget_interact',
      widget: { name: 'my-widget', action: 'expand' }
    });
  });
}
```

### Rules to follow

- Never hardcode label values -- derive them from Sanity content at render time
- Always wrap Sanity-derived values in `stegaClean()`
- Guard all `dataLayer.push()` calls with `if (window.dataLayer)`
- Do not add tracking fields to Sanity schemas -- all tracking data is derived from existing content fields
- Do not re-initialize `window.dataLayer = []` -- the GTM snippet handles initialization
- Existing `data-*` attributes (`data-animate`, `data-carousel`, `data-contact-form`, `data-slot`) are for UI functionality -- GTM attributes are additive, not replacements

## Components with Tracking Attributes

| Component | Category | What is tracked |
|:----------|:---------|:----------------|
| `Header.astro` | `navigation` | Desktop and mobile nav links, header CTA button |
| `Footer.astro` | `footer`, `social` | Program links, resource links, social icons, contact links |
| `HeroBanner.astro` | `cta` | CTA buttons with action and label |
| `CtaBanner.astro` | `cta` | CTA buttons with action and label |
| `SponsorSteps.astro` | `cta` | CTA buttons with action and label |
| `SponsorCard.astro` | `sponsor` | Name link (detail), website link (external) |
| `ProjectCard.astro` | `project` | Title link, sponsor link |
| `EventCard.astro` | `event` | Title link |
| `TestimonialCard.astro` | `testimonial` | Project link |
| `ContactForm.astro` | form events | `form_start`, `form_submit` via dataLayer |
| `BlockWrapper.astro` | `data-gtm-section` | Block type identifier for visibility triggers |

## When This Strategy Gets Revisited

This setup stays correct as long as:

- GTM remains the tag management platform
- GA4 remains the primary analytics destination
- The site uses Sanity Visual Editing (which requires the `stegaClean` pattern)

| Trigger | Action |
|:--------|:-------|
| Switch to a different analytics platform | Update GTM tags in the dashboard -- no code changes |
| Add server-side tracking | Extend the Astro middleware or Cloudflare Worker to push events server-side |
| Remove Sanity Visual Editing | The `stegaClean` calls become no-ops but cause no harm -- remove at your discretion |
| GTM is removed entirely | The `if (window.dataLayer)` guards ensure all tracking code degrades silently |
