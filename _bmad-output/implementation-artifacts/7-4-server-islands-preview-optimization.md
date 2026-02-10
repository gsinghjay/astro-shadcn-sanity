# Story 7: Server Islands for Preview Branch Optimization

Status: draft

## Story

As a developer,
I want the preview branch to use Astro Server Islands (`server:defer`) with `output: "static"` instead of full `output: "server"`,
So that the page shell (Header, Footer, Layout) is prerendered at build time for fast initial load while Sanity content blocks render on-demand with fresh draft data.

## Background

The current preview branch uses `output: "server"`, meaning every page is rendered on-demand by Cloudflare Workers. This works but has drawbacks:
- Every page request (including the static shell) hits the Worker runtime
- No CDN caching for the page skeleton
- Higher Worker invocation count (Cloudflare free tier: 100K/day)

Astro 5's **Server Islands** (`server:defer`) let you keep `output: "static"` while deferring specific components to SSR. The `@astrojs/cloudflare` adapter explicitly supports this.

### Architecture

```
Current (output: "server"):
  Request → Worker → Render full page (Header + Content + Footer) → Response

Proposed (output: "static" + server:defer):
  Request → CDN serves static shell (Header + Footer + fallback)
         → Browser fetches /_server-islands/SanityContent
         → Worker renders only Sanity content blocks
         → Content injected into page
```

### Benefits

- **Faster initial paint** — static shell loads from CDN edge cache
- **Lower Worker usage** — only content area hits the Worker, not the full page
- **Consistent output mode** — both `main` and `preview` use `output: "static"`
- **Better caching** — static assets aggressively cached, dynamic content always fresh

## Acceptance Criteria

1. Preview branch uses `output: "static"` (same as production `main` branch)
2. Sanity content area renders via `server:defer` with fresh draft data on each request
3. `<VisualEditing />` component works correctly with server islands (stega overlays functional)
4. Click-to-edit overlays work in the Presentation tool
5. Fallback content (loading skeleton) displays while server island loads
6. Prerendered pages (about, contact, projects, sponsors) continue to work with no regressions
7. Production (`main`) builds unchanged — no server islands, fully static

## Tasks / Subtasks

- [ ] Task 1: Create `SanityPageContent.astro` wrapper component
  - [ ] 1.1 Create component that accepts page slug/data and wraps `BlockRenderer`
  - [ ] 1.2 Component fetches fresh Sanity data using `getPage()` with `previewDrafts` perspective
  - [ ] 1.3 Ensure stega encoding is active for Visual Editing overlays
  - [ ] 1.4 Props must be serializable (slug string, not functions/complex objects)

- [ ] Task 2: Update page templates to use `server:defer`
  - [ ] 2.1 Update `[...slug].astro` to render `<SanityPageContent server:defer>` when Visual Editing enabled
  - [ ] 2.2 Update `index.astro` similarly
  - [ ] 2.3 Add fallback skeleton content with `slot="fallback"`
  - [ ] 2.4 Conditionally apply `server:defer` only when `PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true`

- [ ] Task 3: Update astro.config.mjs
  - [ ] 3.1 Remove conditional `output: "server"` — always `output: "static"`
  - [ ] 3.2 Keep `adapter: cloudflare(...)` (required for server islands)
  - [ ] 3.3 Verify server islands work with Cloudflare adapter

- [ ] Task 4: Test Visual Editing integration
  - [ ] 4.1 Verify `<VisualEditing />` component initializes after server island loads
  - [ ] 4.2 Verify stega-encoded content renders click-to-edit overlays
  - [ ] 4.3 Test in Sanity Studio Presentation tool — iframe + edit workflow
  - [ ] 4.4 Verify content refreshes when edits made in Studio

- [ ] Task 5: Deploy and verify
  - [ ] 5.1 Push to preview branch
  - [ ] 5.2 Verify preview.ywcc-capstone.pages.dev loads all pages
  - [ ] 5.3 Verify SSR content area loads dynamically
  - [ ] 5.4 Verify production main branch unaffected

## Dev Notes

### Key Considerations

**Server Island Props:**
- Props must be serializable (string, number, plain object, Array)
- Cannot pass functions or Astro component references
- Pass the slug/page ID, let the server island fetch its own data

**`Astro.url` in Server Islands:**
- Server islands have their own URL (`/_server-islands/ComponentName`)
- Use `Referer` header to access the original page URL if needed
- Pass page-specific data via props instead

**`<VisualEditing />` Placement:**
- Currently in `Layout.astro` (static shell) — may need to move into the server island
- OR: keep in Layout and verify it picks up stega content after island injection
- Test both approaches

**Caching:**
- Server island data is fetched via GET request with encrypted props in URL
- Can use `Cache-Control` headers for caching if desired
- For preview (draft content), set `Cache-Control: no-cache` to always get fresh data

### References

- [Astro Server Islands docs](https://docs.astro.build/en/guides/server-islands/)
- [Cloudflare adapter — supports server islands](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Sanity Visual Editing — Astro classified as "Basic Support"](https://www.sanity.io/docs/visual-editing/fetching-content-for-visual-editing)
- Implementation artifact: `5-2-ga4-security-headers-cloudflare-deploy.md` — SSR fix history

### Risk: Visual Editing Overlay Timing

The `<VisualEditing />` React component scans the DOM for stega-encoded strings to create overlays. With server islands, the content HTML is injected after initial page load. The overlay component needs to either:
1. Re-scan the DOM after server island content loads (mutation observer)
2. Be placed inside the server island so it renders alongside the content

This is the main unknown — test early.

### Dependencies

- **Requires:** astro-icon → @iconify/utils migration (completed in Story 5.2 addendum)
- **Does NOT require:** any Sanity schema changes
- **Does NOT require:** any Studio configuration changes
