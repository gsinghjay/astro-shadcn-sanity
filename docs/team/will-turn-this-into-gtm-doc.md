Great question, Jay. Making a site "GTM-friendly" is all about giving the GTM dashboard user clean, predictable hooks to work with so they're not constantly asking you for code changes. Here's the approach:

## 1. Install the GTM Container Properly

Place the snippets exactly as Google specifies — the `<script>` in `<head>` and the `<noscript>` iframe right after `<body>`. For SPAs (like Astro with client-side routing), make sure GTM loads on initial page load and you push route changes to the data layer.

## 2. Implement a Rich `dataLayer`

This is the single biggest thing you can do. Instead of making the GTM person scrape the DOM for info, **push structured data to `window.dataLayer`** proactively:

```javascript
// Push on page load
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'page_view',
  page: {
    title: document.title,
    type: 'program-page',       // e.g., 'homepage', 'event', 'news-article'
    department: 'Nursing',
    audience: 'prospective-students'
  },
  user: {
    loginStatus: 'logged-out',
    role: 'visitor'
  }
});
```

Then for interactions:

```javascript
// CTA clicks, form submissions, video plays, etc.
document.querySelector('.apply-btn').addEventListener('click', () => {
  dataLayer.push({
    event: 'cta_click',
    cta: {
      text: 'Apply Now',
      location: 'hero-banner',
      destination: '/admissions/apply'
    }
  });
});
```

The GTM person can then just create triggers based on `event equals 'cta_click'` and pull variables from `cta.text`, `cta.location`, etc. — no custom JS in GTM needed.

## 3. Use Consistent, Semantic `data-` Attributes

For anything the GTM user might want to track via CSS selectors or element visibility triggers, add predictable attributes:

```html
<button 
  data-gtm-category="engagement" 
  data-gtm-action="click" 
  data-gtm-label="request-info-form"
  class="btn btn-primary">
  Request Info
</button>

<section 
  data-gtm-section="testimonials" 
  data-gtm-visibility="track">
  ...
</section>
```

This way the GTM person can set up a single "All Elements" click trigger filtered by `data-gtm-category` existing, and pull all the context from attributes — no brittle CSS selectors tied to your class names.

## 4. Fire Custom Events for Dynamic/SPA Behavior

If you're using Astro with view transitions or any client-side routing:

```javascript
// After route change completes
document.addEventListener('astro:page-load', () => {
  dataLayer.push({
    event: 'virtual_pageview',
    page: {
      path: window.location.pathname,
      title: document.title
    }
  });
});
```

Same for modals, tabs, accordions, infinite scroll loads — anything that changes content without a full page reload.

## 5. Standardize a Naming Convention

Document and stick to a schema. Something like:

| dataLayer key | Purpose | Example values |
|---|---|---|
| `event` | What happened | `form_submit`, `cta_click`, `video_play` |
| `page.type` | Page template | `program-page`, `news-article`, `event` |
| `cta.location` | Where on page | `hero`, `sidebar`, `footer` |
| `form.name` | Which form | `request-info`, `apply`, `contact` |

Hand this doc to the GTM person. They can build their entire tagging strategy around it without touching code.

## 6. Avoid Common Anti-Patterns

- **Don't use auto-generated or hashed class names** as the only identifiers (common with CSS modules/Tailwind JIT). Always pair with `data-` attributes.
- **Don't fire GTM events before the container loads.** If you push to `dataLayer` before GTM initializes, the events queue up fine, but make sure the container snippet is above your custom scripts.
- **Don't put tracking logic in GTM that belongs in the site.** Business logic (calculating form field values, user segmentation) should be pushed from your code. GTM should just route that data to GA4/Meta/etc.

## Quick Checklist for Any New Page/Component

1. Does it push a `dataLayer` event on load with page metadata?
2. Do interactive elements have `data-gtm-*` attributes?
3. Do key user actions (clicks, submits, plays) fire named `dataLayer` events?
4. Is the naming consistent with your documented schema?

If you hit all four, the GTM dashboard person can self-serve almost everything — new tags, new conversion tracking, new audiences — without filing a ticket with you. That's the goal.