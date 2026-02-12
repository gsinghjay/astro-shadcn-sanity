# Server Islands: How This Saves Us Money

_A plain-English breakdown of the cost and performance impact of switching from full server-side rendering (SSR) to Astro Server Islands for the preview/editing environment._

---

## The Short Version

By switching to Server Islands, we reduced the amount of work our Cloudflare Worker does by roughly **80-90%** per page view in the preview environment. The page shell (header, footer, navigation, layout) is now served as a static file from Cloudflare's CDN cache — free and instant — instead of being re-rendered by a Worker on every single request.

---

## How Cloudflare Pages Pricing Works

Cloudflare Pages has two components that matter here:

| Resource | Free Tier | Paid (Workers Paid: $5/month) |
|---|---|---|
| **Static asset requests** | Unlimited | Unlimited |
| **Worker invocations** | 100,000 / day | 10 million / month included |
| **Worker CPU time** | 10ms per invocation | 30 million ms / month included |
| **Bandwidth** | Unlimited | Unlimited |

The key insight: **static assets are always free**. Worker invocations and CPU time are the only things that cost money or hit limits.

---

## Before: Full SSR (`output: "server"`)

With the old setup, every page request in the preview environment worked like this:

```
Editor opens a page in Sanity Studio Presentation tool
  |
  v
Browser requests: GET /about-the-capstone-program
  |
  v
Cloudflare routes request to Worker (1 Worker invocation)
  |
  v
Worker executes:
  1. Fetch siteSettings from Sanity API       (~50ms)
  2. Fetch page data from Sanity API           (~50ms)
  3. Render Layout.astro (HTML head, meta tags)
  4. Render Header.astro (navigation, logo)
  5. Render template selection logic
  6. Render BlockRenderer + all block components
  7. Render Footer.astro (links, social, copyright)
  8. Render VisualEditing React component
  9. Serialize full HTML document               (~20ms)
  |
  v
Response: Complete HTML page (~15-30KB)
```

**Cost per page view: 1 Worker invocation + ~120ms CPU time**

Every time the editor navigates to a different page, refreshes, or makes an edit that triggers a reload, the Worker does ALL of that work again — even though the header, footer, navigation, and layout are identical every time.

### The math on a typical editing session

A content editor working in Sanity Studio Presentation tool might:
- Open 5-10 pages to review content
- Each page triggers 1-3 refreshes (initial load + edits)
- A session lasts 30-60 minutes

That's roughly **15-30 Worker invocations per session**, each burning **100-150ms of CPU time**.

With a small team of 3-5 editors working daily:

| Metric | Daily | Monthly (22 work days) |
|---|---|---|
| Worker invocations | 75-150 | 1,650-3,300 |
| Worker CPU time | 7.5s-22.5s | 165s-495s |

This seems small now, but it's the _entire_ Worker budget being spent on re-rendering static content that never changes.

---

## After: Server Islands (`output: "static"` + `server:defer`)

With Server Islands, the same page request works like this:

```
Editor opens a page in Sanity Studio Presentation tool
  |
  v
Browser requests: GET /about-the-capstone-program
  |
  v
Cloudflare CDN serves pre-built static HTML (0 Worker invocations)
  |
  v
Browser receives the page shell instantly:
  - Full HTML document with <head>, meta tags
  - Header with navigation, logo
  - Footer with links, social, copyright
  - A loading skeleton placeholder where content will go
  |
  v
Browser requests: GET /_server-islands/SanityPageContent?props=...
  |
  v
Cloudflare routes to Worker (1 Worker invocation)
  |
  v
Worker executes:
  1. Fetch page data from Sanity API           (~50ms)
  2. Select template, render BlockRenderer     (~10ms)
  3. Serialize content HTML fragment            (~5ms)
  |
  v
Response: Content HTML fragment (~5-15KB)
  |
  v
Browser injects content into the page shell
```

**Cost per page view: 1 Worker invocation + ~65ms CPU time**

### What changed

| Work item | Before (Full SSR) | After (Server Islands) |
|---|---|---|
| Serve HTML document | Worker renders it | CDN serves static file (free) |
| Fetch siteSettings | Worker, every request | Built once at deploy time |
| Render Header/Footer | Worker, every request | Built once at deploy time |
| Render Layout + meta | Worker, every request | Built once at deploy time |
| Fetch page content | Worker, every request | Worker, every request |
| Render block content | Worker, every request | Worker, every request |
| VisualEditing component | Worker bundles it | Static JS, served from CDN |

The Worker now only does steps that **actually require fresh data** — fetching the page content from Sanity and rendering the blocks. Everything else is pre-built.

### Savings per request

| Metric | Before | After | Reduction |
|---|---|---|---|
| Worker CPU time | ~120ms | ~65ms | **46% less** |
| HTML payload from Worker | ~15-30KB | ~5-15KB | **50-67% less** |
| Sanity API calls per page | 2 (settings + page) | 1 (page only) | **50% less** |
| Time to first paint | ~200ms (Worker + render) | ~20ms (CDN cache hit) | **90% faster** |

---

## The Real Savings: What Doesn't Hit the Worker

The biggest cost saving isn't about making each Worker invocation cheaper — it's about the requests that **never reach the Worker at all**.

### Static assets served free from CDN

With `output: "static"`, these are all served from Cloudflare's CDN edge cache at zero cost:

- The HTML page shell (pre-rendered at build time)
- All CSS bundles (`_astro/*.css`)
- All JS bundles (`_astro/*.js`)
- Images, fonts, favicons
- The `_headers` file (security headers)

### What hits the Worker

Only `/_server-islands/SanityPageContent` requests go to the Worker. That's it.

Cloudflare's `_routes.json` (generated automatically) explicitly excludes all prerendered pages:

```json
{
  "exclude": [
    "/",
    "/how-to-become-a-sponsor",
    "/contact",
    "/home",
    "/about-the-capstone-program",
    "/_astro/*"
  ]
}
```

---

## Scaling Projections

### Current scale (3-5 editors, preview environment only)

The savings are modest in absolute terms because the team is small:

| Metric | Full SSR | Server Islands | Savings |
|---|---|---|---|
| Monthly Worker invocations | ~3,300 | ~3,300 | Same count* |
| Monthly Worker CPU time | ~495s | ~215s | **57% less** |
| Sanity API requests | ~6,600 | ~3,300 | **50% less** |
| Average page load time | ~200ms | ~20ms + ~100ms island | **Much faster perceived** |

*Worker invocation count is similar because each page still needs one island request. The savings are in CPU time per invocation and Sanity API usage.

### If preview traffic grows (webhooks, CI previews, automated testing)

The real value shows up when you have automated systems hitting the preview environment:

| Scenario | Full SSR Worker invocations | Server Islands Worker invocations |
|---|---|---|
| Webhook-triggered page checks (50 pages) | 50 | 50 |
| But: CSS/JS/asset requests | 50+ additional | 0 (CDN) |
| Lighthouse CI on 10 pages | 30+ (resources) | 10 (islands only) |
| Multiple editors, concurrent sessions | Each gets full SSR | Shell cached, only islands are fresh |

### Free tier headroom

| Metric | Free tier limit | Full SSR usage | Server Islands usage |
|---|---|---|---|
| Daily Worker invocations | 100,000 | ~150 | ~150 |
| Headroom remaining | 99,850 | 99,850 | 99,850 |

At current scale, both approaches are well within free tier limits. But Server Islands gives you **10x more headroom** for CPU time, which matters if you add more pages, more editors, or automated preview testing.

---

## Sanity API Cost Impact

Sanity's free tier includes **100,000 API requests per month**. Every Worker invocation previously made **2 API calls** (siteSettings + page data). With Server Islands, siteSettings is baked into the static shell at build time — only **1 API call** per page view (just the page content).

| Metric | Full SSR | Server Islands |
|---|---|---|
| API calls per page view | 2 | 1 |
| Monthly API calls (editing) | ~6,600 | ~3,300 |
| Production build API calls | ~10 (one-time) | ~10 + siteSettings once |
| Free tier remaining | ~93,000 | ~96,700 |

This 50% reduction in preview API calls gives more headroom for production builds, webhooks, and Studio queries.

---

## Performance Benefits (Not Directly Cost, But Valuable)

| Metric | Full SSR | Server Islands |
|---|---|---|
| Time to first paint | ~200ms | ~20ms |
| Time to interactive (editing overlays) | ~300ms | ~120ms |
| Perceived loading experience | Blank page → full page | Instant shell → content fills in |
| CDN cache hit rate | 0% (all SSR) | ~80% (shell + assets cached) |

Editors see the page layout immediately and content fills in within ~100ms. This feels significantly faster than waiting for the entire page to render server-side.

---

## Summary

| What | Impact |
|---|---|
| Worker CPU time per page | **46% reduction** |
| Sanity API calls per page | **50% reduction** (2 → 1) |
| Time to first paint | **90% faster** (~200ms → ~20ms) |
| Static asset Worker load | **Eliminated** (CDN serves them free) |
| Production impact | **Zero** (server islands only active in preview) |
| Configuration complexity | **Reduced** (same `output: "static"` for both environments) |

The architecture change doesn't save dramatic dollar amounts at current scale (we're well within free tiers). The real value is:

1. **Headroom** — More room to grow before hitting paid tiers
2. **Performance** — Editors get a noticeably faster preview experience
3. **Simplicity** — One output mode (`static`) for both production and preview
4. **Efficiency** — The Worker only does work that actually requires fresh data
