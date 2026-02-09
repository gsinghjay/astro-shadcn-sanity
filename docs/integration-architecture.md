# Integration Architecture — YWCC Capstone Sponsors

**Generated:** 2026-02-09 | **Scan Level:** Exhaustive

## Part Communication Overview

```
┌──────────────────────────────────────────────────────────────┐
│                       MONOREPO ROOT                          │
│  package.json (npm workspaces: ["studio", "astro-app"])      │
│  playwright.config.ts, tests/                                │
└──────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────────────┐
│     studio/          │    │          astro-app/               │
│                      │    │                                   │
│  Sanity Studio       │    │  Astro Frontend (SSG)             │
│  (React SPA)         │    │                                   │
│                      │    │  ┌─────────────────────────────┐  │
│  Writes content to   │    │  │ src/lib/sanity.ts            │  │
│  Sanity Cloud API    │───▶│  │ - GROQ queries               │  │
│                      │    │  │ - loadQuery() with stega      │  │
│  Serves on :3333     │    │  │ - getSiteSettings() memoized  │  │
│                      │    │  └─────────────────────────────┘  │
│  Presentation Tool   │    │                                   │
│  previews at :4321   │◀───│  Serves on :4321                  │
│                      │    │                                   │
└──────────────────────┘    └──────────────────────────────────┘
              │                              │
              ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     Sanity Cloud API                         │
│  Project: 49nk9b0w | Dataset: production                    │
│  Content Delivery Network + Real-time API                    │
└──────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Content Delivery (studio → Sanity Cloud → astro-app)

| Attribute | Value |
|---|---|
| **From** | studio (content editing) |
| **To** | astro-app (content consumption) |
| **Protocol** | Sanity Content Lake API (HTTPS) |
| **Data Format** | JSON (GROQ query results) |
| **Auth** | Read token (`SANITY_API_READ_TOKEN`) for drafts; public CDN for published |
| **API Version** | 2024-12-08 |

**Flow:**
1. Content editor creates/updates content in Studio
2. Content is stored in Sanity Content Lake (cloud)
3. At build time, Astro fetches content via GROQ queries
4. Content is baked into static HTML (zero runtime API calls)

### 2. Visual Editing (studio ↔ astro-app)

| Attribute | Value |
|---|---|
| **From** | studio (Presentation tool) |
| **To** | astro-app (preview iframe) |
| **Protocol** | Stega encoding + iframe communication |
| **Preview URL** | http://localhost:4321 (dev) |

**Flow:**
1. Studio's Presentation tool loads astro-app in an iframe
2. Astro renders content with stega-encoded invisible markers
3. Studio detects markers and enables click-to-edit on content elements
4. Edits update content in Sanity, astro-app re-renders with draft perspective

**Configuration:**
- `studio/sanity.config.ts` → `presentationTool({ previewUrl: { origin: 'http://localhost:4321' } })`
- `astro-app/astro.config.mjs` → `sanity({ stega: { studioUrl: 'http://localhost:3333' } })`
- `studio/src/presentation/resolve.ts` → Maps page documents to frontend URLs

### 3. Schema Sharing (studio → tests)

| Attribute | Value |
|---|---|
| **From** | studio (schema definitions) |
| **To** | tests (integration tests) |
| **Protocol** | Direct ESM imports |
| **Method** | Static `import` statements |

**Flow:**
1. Integration tests import schema definitions directly from `studio/src/schemaTypes/`
2. Tests validate schema structure, field types, and relationships
3. No browser or network required (pure Node.js execution)

**Important rule:** Tests MUST use static `import` (never dynamic `await import()`) and studio must keep `"type": "module"` in package.json.

### 4. Shared Dependencies

| Dependency | studio | astro-app | Purpose |
|---|---|---|---|
| react | 19.x | 19.x | Studio UI + Astro islands |
| react-dom | 19.x | 19.x | DOM rendering |
| typescript | 5.x | 5.x | Type checking |

### 5. CI/CD (GitHub Actions → GitHub Pages)

| Attribute | Value |
|---|---|
| **Trigger** | Push to main (astro-app/src/**, .storybook/**, package.json) |
| **Build** | `npm run build-storybook --workspace=astro-app` |
| **Deploy** | GitHub Pages artifact upload |
| **Base Path** | `/astro-shadcn-sanity/` |

## Environment Variable Mapping

| Variable | Used In | Purpose |
|---|---|---|
| `PUBLIC_SANITY_STUDIO_PROJECT_ID` | astro-app | Sanity project ID for content fetching |
| `PUBLIC_SANITY_STUDIO_DATASET` | astro-app | Sanity dataset name |
| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` | astro-app | Enable stega visual editing |
| `SANITY_API_READ_TOKEN` | astro-app | API token for draft content |
| `SANITY_STUDIO_PROJECT_ID` | studio | Sanity project ID for Studio |
| `SANITY_STUDIO_DATASET` | studio | Sanity dataset name |
| `SANITY_STUDIO_PREVIEW_ORIGIN` | studio | Astro preview URL for Presentation tool |
| `SANITY_STUDIO_STUDIO_HOST` | studio | Optional Studio deployment hostname |

## Data Flow Summary

```
Content Editor → Studio → Sanity Cloud
                                ↓
                     Astro SSG Build (GROQ)
                                ↓
                        Static HTML + CSS
                                ↓
                    CDN (GitHub Pages / Cloudflare)
                                ↓
                          Site Visitor
```

Zero runtime API calls. All content is pre-rendered at build time.
