---
title: "Portal Development Guide: React Islands in Astro"
description: "A beginner-friendly guide for React developers building the sponsor portal. Covers Astro islands, client directives, auth middleware, server endpoints, data flow, and GTM tracking."
lastUpdated: 2026-02-19
---

# Portal Development Guide: React Islands in Astro

This guide is for React developers working on Epic 9 (Sponsor Portal) stories. It assumes you know React (hooks, components, state, effects) but are new to Astro, Cloudflare Workers, and the islands architecture.

**Stories this guide covers:**
- [9.1: Cloudflare Access Configuration](../../_bmad-output/implementation-artifacts/9-1-cloudflare-access-configuration.md)
- [9.2: Portal — Sponsor Project View](../../_bmad-output/planning-artifacts/epics.md)
- [9.3: Portal — Events & Program Information](../../_bmad-output/planning-artifacts/epics.md)
- [9.7: Portal — Submission & Engagement Dashboard](../../_bmad-output/implementation-artifacts/9-7-submission-engagement-dashboard.md)

## Table of Contents

- [How Astro Differs from What You Know](#how-astro-differs-from-what-you-know)
- [Islands Architecture Explained](#islands-architecture-explained)
- [Client Directives Reference](#client-directives-reference)
- [The Portal Auth Flow](#the-portal-auth-flow)
- [Creating a Portal Page (Step by Step)](#creating-a-portal-page-step-by-step)
- [Creating React Components for the Portal](#creating-react-components-for-the-portal)
- [Server Endpoints (API Routes)](#server-endpoints-api-routes)
- [Data Flow: Server to React](#data-flow-server-to-react)
- [Working with Sanity Data](#working-with-sanity-data)
- [GTM Tracking from React](#gtm-tracking-from-react)
- [Local Development Setup](#local-development-setup)
- [Common Gotchas](#common-gotchas)
- [File Structure Reference](#file-structure-reference)
- [Glossary](#glossary)

---

## How Astro Differs from What You Know

If you've used Create React App or Next.js, here's the mental shift:

| Concept | React (CRA / Next.js) | Astro |
|---|---|---|
| **Default output** | JavaScript app — everything is JS | Static HTML — zero JS by default |
| **Components** | Everything is React | `.astro` files for layout/pages, React for interactivity |
| **Rendering** | Client-side (CRA) or server + hydrate (Next) | Static HTML at build time, opt-in server rendering |
| **JS in the browser** | Always | Only where you explicitly add it |
| **Routing** | React Router or file-based (Next) | File-based (`src/pages/`) |
| **Data fetching** | `useEffect`, `getServerSideProps`, etc. | In `.astro` frontmatter (server) or in React components (client) |

**The key difference:** In Astro, your React components don't run in the browser unless you tell them to. By default, Astro renders your React component to HTML at build time and throws away the JavaScript. You must add a `client:*` directive to make it interactive.

---

## Islands Architecture Explained

An "island" is an interactive component embedded in a sea of static HTML. The page is mostly static (fast, no JS), with small interactive React components hydrated independently.

```
┌─────────────────────────────────────────────────┐
│           STATIC HTML (zero JS)                  │
│   ┌──────────────────────────────────────────┐  │
│   │  Header: "Dashboard"                      │  │  ← Astro markup, no hydration
│   │  "Signed in as jay@example.com"           │  │
│   └──────────────────────────────────────────┘  │
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │  🏝 REACT ISLAND: SubmissionsPanel        │  │  ← client:load (hydrates immediately)
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐    │  │
│   │  │Total: 42│ │Week: 7  │ │Month: 18│    │  │     Has state, click handlers,
│   │  └─────────┘ └─────────┘ └─────────┘    │  │     expand/collapse rows
│   │  Name    Email         Date              │  │
│   │  ▸ Alice  alice@co.com  Feb 18           │  │
│   │  ▾ Bob    bob@co.com    Feb 17           │  │
│   │    Full message shown when expanded...   │  │
│   └──────────────────────────────────────────┘  │
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │  🏝 REACT ISLAND: EngagementPanel         │  │  ← client:visible (hydrates on scroll)
│   │  Loading skeleton... (until scrolled to)  │  │
│   │  Then: page views, top pages, form funnel │  │     JS not even downloaded until
│   └──────────────────────────────────────────┘  │     the user scrolls here
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │  Footer                                   │  │  ← Static HTML again
│   └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Why this matters for performance:**
- The header, footer, and page layout ship zero JavaScript
- `SubmissionsPanel` JS loads immediately (it's above the fold, users interact with it right away)
- `EngagementPanel` JS doesn't even download until the user scrolls to it — saving bandwidth and deferring the GA4 API call

**Why this matters for you as a React dev:**
- You write normal React components with `useState`, `useEffect`, etc.
- Astro handles when and how they hydrate — you just pick the right `client:*` directive
- Your components can't talk to each other directly (each island is independent). Use server endpoints or URL state if they need to share data.

---

## Client Directives Reference

Client directives tell Astro *when* to hydrate a React component. You add them where you use the component in an `.astro` file.

```astro
<!-- In an .astro file -->
<MyComponent client:load />      <!-- Hydrate immediately -->
<MyComponent client:visible />   <!-- Hydrate when scrolled into view -->
<MyComponent client:idle />      <!-- Hydrate when browser is idle -->
<MyComponent client:only="react" /> <!-- Client-only, no SSR at all -->
```

### When to use each directive

| Directive | When to Use | Portal Example |
|---|---|---|
| `client:load` | Component is above the fold AND needs immediate interactivity | `SubmissionsPanel` — user clicks rows right away |
| `client:visible` | Component is below the fold OR can wait until seen | `EngagementPanel` — no rush, also defers its API call |
| `client:idle` | Component isn't urgent but should hydrate soon-ish | Sponsor search/filter that isn't above the fold |
| `client:only="react"` | Component uses browser-only APIs (window, document) and CAN'T server-render | `VisualEditingMPA` (existing example in codebase) |
| No directive | Component has no interactivity — just displays data | Sponsor profile header (name, logo, tier) |

### What happens without a directive

```astro
<!-- NO directive — renders to HTML, React JS is discarded -->
<StatCard label="Total" value={42} />
<!-- Output: just <div>Total: 42</div> in the HTML, zero JS -->
```

This is fine for display-only components! If `StatCard` has no click handlers, no state, no effects — skip the directive. Free performance.

### Rules

1. **Directives go in the `.astro` file, not in the React component.** The component itself is just normal React.
2. **You can't use directives in other React components.** Only `.astro` files can add `client:*` directives. If you need a sub-component to be interactive, it must be part of an already-hydrated island.
3. **Each island hydrates independently.** Two `client:load` components on the same page don't share React context or state. They're separate React roots.
4. **Props must be serializable.** You pass data from Astro to React via props. These props are serialized to HTML attributes, so they must be JSON-serializable (no functions, no class instances, no React elements).

---

## The Portal Auth Flow

All portal pages are protected by Cloudflare Access + Astro middleware. Here's the flow:

```
1. User visits /portal/dashboard
           │
           ▼
2. Cloudflare Access (edge)
   - Not authenticated? → Redirect to CF login page
   - Authenticated? → Forward request with JWT header
           │
           ▼
3. Astro middleware (src/middleware.ts)
   - Reads Cf-Access-Jwt-Assertion header
   - Validates JWT signature using jose library
   - Sets: context.locals.user = { email: "jay@example.com" }
   - Calls next() → request continues to the page
           │
           ▼
4. Your .astro page
   - Reads: Astro.locals.user (guaranteed to exist for /portal/* routes)
   - Fetches data, renders HTML + React islands
           │
           ▼
5. Browser
   - Receives HTML with React islands
   - Islands hydrate based on their client:* directives
```

**What this means for you:**
- You never write auth code in your pages or React components
- In `.astro` pages, access the user via `Astro.locals.user`
- In server endpoints, access the user via `locals.user`
- React components don't have direct access to the user — pass it as a prop from the `.astro` page if needed

```astro
---
// In any /portal/*.astro page:
const user = Astro.locals.user!; // { email: string } — guaranteed by middleware
---

<h1>Welcome, {user.email}</h1>
<SponsorProjects client:load userEmail={user.email} projects={data} />
```

---

## Creating a Portal Page (Step by Step)

Let's walk through creating a new portal page from scratch.

### Step 1: Create the .astro page file

All portal pages live in `astro-app/src/pages/portal/`. The filename becomes the URL.

```
src/pages/portal/dashboard.astro  →  /portal/dashboard
src/pages/portal/index.astro      →  /portal/
src/pages/portal/api/me.ts        →  /portal/api/me
```

### Step 2: Opt out of static rendering

Portal pages must be server-rendered (they need auth). Add this at the top:

```astro
---
export const prerender = false;  // This line makes it SSR
---
```

Without this line, Astro tries to build the page at deploy time — which fails because there's no authenticated user at build time.

#### "But the config says `output: 'static'` — how does SSR work?"

Good question. `output: "static"` means **static is the default**, not that the entire site is static. Any page can opt out with `export const prerender = false`. Here's how it works:

```
astro.config.mjs → output: "static"         (default for all pages)
                    adapter: cloudflare()     (generates a Worker for SSR routes)

Public pages (/, /sponsors, /projects)       → built at deploy time → static HTML → CDN
Portal pages (/portal/*, /portal/api/*)      → prerender = false → Worker runs per request → SSR
```

At build time, Astro:
1. Builds all public pages to static HTML files (you see these in the `prerendering static routes` build log)
2. **Skips** portal pages — they don't appear in that list
3. The Cloudflare adapter bundles a Worker that handles any non-prerendered route at request time

This is why portal pages need SSR:
- **Auth:** `Astro.locals.user` is populated by middleware on each request — no user exists at build time
- **Fresh data:** Sanity queries run per-request, not per-deploy
- **Server endpoints:** `GET /portal/api/me` must execute server-side

You **don't** need to change `output` to `"server"` or `"hybrid"`. The `@astrojs/cloudflare` adapter supports per-route SSR with `output: "static"`. This keeps the public site fully static ($0 compute) while portal routes run on the Worker.

### Step 3: Write the page

```astro
---
export const prerender = false;

// Imports
import Layout from "@/layouts/Layout.astro";
import { Section, SectionContent } from "@/components/ui/section";
import MyReactPanel from "@/components/portal/MyReactPanel";
import { loadQuery } from "sanity:client";
import { MY_QUERY } from "@/lib/sanity";

// Auth — guaranteed by middleware
const user = Astro.locals.user!;

// Server-side data fetching (runs on every request)
const { data } = await loadQuery(MY_QUERY);
---

<Layout title="My Page" template="portal">
  <Section>
    <SectionContent>
      {/* Static content — zero JS */}
      <h1>My Page</h1>
      <p class="text-muted-foreground">Signed in as {user.email}</p>

      {/* React island — interactive, JS included */}
      <MyReactPanel client:load items={data} />
    </SectionContent>
  </Section>
</Layout>

<script>
  // Inline scripts run in the browser — use for GTM events
  window.dataLayer?.push({ event: "my_page_view" });
</script>
```

**Key points:**
- The `---` fenced section at the top is called "frontmatter" — it runs on the server (like `getServerSideProps` in Next.js)
- Everything below the `---` is the template — it's like JSX but with some differences (see [Gotchas](#common-gotchas))
- `class` not `className` in `.astro` files (it's closer to HTML than JSX)
- `<script>` tags are processed by Astro and run in the browser

---

## Creating React Components for the Portal

Portal React components live in `astro-app/src/components/portal/`.

### File naming

```
src/components/portal/
├── types.ts              # Shared TypeScript types
├── StatCard.tsx          # Reusable stat display
├── SubmissionsPanel.tsx  # Submissions island
├── EngagementPanel.tsx   # Analytics island
└── SponsorProjects.tsx   # Sponsor's project list
```

### Component pattern — data passed as props

When the `.astro` page already has the data (fetched server-side), pass it as props:

```tsx
// src/components/portal/SubmissionsPanel.tsx
import { useState } from "react";
import type { Submission, SubmissionStats } from "./types";
import { pushEvent } from "@/lib/gtm";

interface Props {
  submissions: Submission[];
  stats: SubmissionStats;
}

export default function SubmissionsPanel({ submissions, stats }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    const opening = expandedId !== id;
    setExpandedId(opening ? id : null);
    if (opening) {
      pushEvent("submission_expand", { submission: { id } });
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Submissions</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        {/* ... more stat cards */}
      </div>
      <div className="divide-y" role="list">
        {submissions.map((s) => (
          <div key={s._id} role="listitem">
            <button
              className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
              onClick={() => toggle(s._id)}
              aria-expanded={expandedId === s._id}
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-muted-foreground ml-2">{s.email}</span>
              <span className="text-sm text-muted-foreground float-right">
                {new Date(s.submittedAt).toLocaleDateString()}
              </span>
            </button>
            {expandedId === s._id && (
              <div className="px-4 pb-4 text-sm">
                <p>{s.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

Used in the `.astro` page:
```astro
<SubmissionsPanel client:load submissions={submissions} stats={stats} />
```

### Component pattern — fetches its own data

When the data is slow to fetch (like GA4 analytics), let the React component fetch it client-side:

```tsx
// src/components/portal/EngagementPanel.tsx
import { useState, useEffect } from "react";
import type { EngagementMetrics } from "./types";

export default function EngagementPanel() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<EngagementMetrics | null>(null);

  useEffect(() => {
    fetch("/portal/api/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <p className="text-muted-foreground">Metrics unavailable</p>;
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Engagement (Last 30 Days)</h2>
      <p className="text-2xl font-bold">{data!.pageViews.toLocaleString()} page views</p>
      {/* ... more metrics */}
    </section>
  );
}
```

Used in the `.astro` page:
```astro
<!-- No props needed — component fetches its own data -->
<EngagementPanel client:visible />
```

### When to use which pattern

| Pattern | When | Example |
|---|---|---|
| **Props from server** | Data is fast to fetch (<100ms), available at request time | Sanity queries (GROQ) |
| **Client-side fetch** | Data is slow, from an external API, or needs to defer | GA4 analytics, GitHub API |

---

## Server Endpoints (API Routes)

Server endpoints are TypeScript files in `src/pages/` that return JSON instead of HTML. They work like Express routes or Next.js API routes.

```typescript
// src/pages/portal/api/submissions.ts
import type { APIRoute } from "astro";
import { loadQuery } from "sanity:client";
import { RECENT_SUBMISSIONS_QUERY } from "@/lib/sanity";

export const prerender = false;  // Must be SSR

export const GET: APIRoute = async ({ locals }) => {
  // locals.user is set by middleware — auth is already handled
  const user = locals.user;

  const { data } = await loadQuery(RECENT_SUBMISSIONS_QUERY);

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
```

**Key points:**
- Export named HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- Must include `export const prerender = false`
- Under `/portal/` — middleware handles auth automatically
- Access the authenticated user via `locals.user`
- Return a `Response` object (standard Web API)

### Accessing Cloudflare secrets in endpoints

Secrets (API keys, tokens) are accessed through `locals.runtime.env`:

```typescript
export const GET: APIRoute = async ({ locals }) => {
  const { env } = locals.runtime;

  // These come from .dev.vars (local) or wrangler secret put (production)
  const apiKey = env.GA4_PRIVATE_KEY;
  const webhookUrl = env.DISCORD_WEBHOOK_URL;

  // Use them server-side — they never reach the browser
};
```

**Never import secrets in React components.** They run in the browser. Always access secrets in server endpoints or `.astro` frontmatter, and expose only the results to the client.

---

## Data Flow: Server to React

Here's the complete data flow for a portal page:

```
                    SERVER                                CLIENT
              (Cloudflare Worker)                        (Browser)

  ┌─────────────────────────────┐          ┌──────────────────────────┐
  │                             │          │                          │
  │  1. middleware.ts           │          │  4. Static HTML renders  │
  │     validates JWT           │          │     immediately          │
  │     sets locals.user        │          │                          │
  │          │                  │          │  5. React islands hydrate │
  │          ▼                  │          │     based on directive:  │
  │  2. dashboard.astro         │  ──HTML──▸│     client:load → now   │
  │     reads locals.user       │          │     client:visible → on  │
  │     fetches Sanity data     │          │       scroll             │
  │     renders HTML template   │          │                          │
  │     serializes React props  │          │  6. EngagementPanel      │
  │          │                  │          │     calls fetch() to     │
  │          │                  │◂──fetch──│     /portal/api/analytics│
  │          ▼                  │          │                          │
  │  3. /portal/api/analytics   │  ──JSON──▸│  7. Panel renders with  │
  │     calls GA4 Data API      │          │     metrics data         │
  │     returns JSON            │          │                          │
  └─────────────────────────────┘          └──────────────────────────┘
```

**Two paths for data:**

1. **Server → Props → React** (fast data like Sanity)
   - `.astro` frontmatter fetches data
   - Data passed as props to `<Component client:load data={data} />`
   - React component receives it immediately on hydration

2. **React → fetch() → Server Endpoint → External API** (slow data like GA4)
   - React component mounts with loading state
   - `useEffect` calls `fetch("/portal/api/analytics")`
   - Server endpoint calls the external API (with secrets)
   - Returns JSON to the component
   - Component re-renders with data

---

## Working with Sanity Data

Sanity is the CMS (Content Management System). Data is queried using GROQ (a query language similar to GraphQL but simpler).

### Where queries live

All GROQ queries live in `astro-app/src/lib/sanity.ts`, wrapped in `defineQuery`:

```typescript
// In sanity.ts
import { defineQuery } from "groq";

export const RECENT_SUBMISSIONS_QUERY = defineQuery(`
  *[_type == "submission"] | order(submittedAt desc)[0...50]{
    _id,
    name,
    email,
    organization,
    message,
    submittedAt,
    form->{ _id, title }
  }
`);
```

**GROQ crash course:**
- `*[_type == "submission"]` — all documents of type "submission"
- `| order(submittedAt desc)` — sort newest first
- `[0...50]` — first 50 results
- `{ _id, name, email }` — select these fields (like SQL SELECT)
- `form->{ _id, title }` — follow a reference and select fields from the linked document

### How to fetch data

In `.astro` frontmatter (server-side):

```astro
---
import { loadQuery } from "sanity:client";
import { RECENT_SUBMISSIONS_QUERY } from "@/lib/sanity";

const { data } = await loadQuery(RECENT_SUBMISSIONS_QUERY);
// data is now typed (after running npm run typegen)
---
```

In server endpoints:

```typescript
import { loadQuery } from "sanity:client";
import { RECENT_SUBMISSIONS_QUERY } from "@/lib/sanity";

export const GET: APIRoute = async () => {
  const { data } = await loadQuery(RECENT_SUBMISSIONS_QUERY);
  return new Response(JSON.stringify(data));
};
```

**Never fetch Sanity data directly in React components.** Use one of the two patterns:
1. Fetch in `.astro` frontmatter → pass as props
2. Fetch in a server endpoint → React component calls `fetch()`

### After changing queries or schemas

```bash
npm run typegen    # Regenerates TypeScript types from Sanity schema + GROQ queries
```

Always run this after modifying a query or schema. It updates `sanity.types.ts` which gives your components type safety.

---

## GTM Tracking from React

Google Tag Manager (GTM) events are tracked by pushing to `window.dataLayer`. We have a shared helper:

```typescript
// src/lib/gtm.ts
export function pushEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    (window as any).dataLayer?.push({ event, ...data });
  }
}
```

### Using it in React components

```tsx
import { pushEvent } from "@/lib/gtm";

function MyComponent() {
  const handleClick = (id: string) => {
    pushEvent("submission_expand", { submission: { id } });
  };

  return <button onClick={() => handleClick("123")}>Expand</button>;
}
```

### Using it in .astro pages

```astro
<script>
  // Inline scripts run in the browser
  window.dataLayer?.push({
    event: "dashboard_view",
    dashboard: { section: "submissions_engagement" },
  });
</script>
```

### For click tracking on HTML elements

Add `data-gtm-*` attributes — GTM picks these up automatically:

```tsx
<a
  href="/projects/ai-chatbot"
  data-gtm-category="project"
  data-gtm-action="detail"
  data-gtm-label="AI Chatbot"
>
  View Project
</a>
```

---

## Local Development Setup

### Prerequisites

```bash
# From the repo root
npm install                      # Install all dependencies
```

### Running the dev servers

```bash
npm run dev -w astro-app         # Astro dev server → http://localhost:4321
npm run dev -w studio            # Sanity Studio → http://localhost:3333
```

### Portal auth in local dev

Cloudflare Access isn't active locally. The middleware will see no JWT header and return 401. To develop portal pages locally, you have two options:

**Option A: Skip auth in dev (recommended for UI work)**

The middleware can check for a dev environment and bypass auth:

```typescript
// In middleware.ts — the Story 9.1 implementation will handle this
if (import.meta.env.DEV) {
  context.locals.user = { email: "dev@localhost" };
  return next();
}
```

**Option B: Use wrangler for full CF simulation**

```bash
cd astro-app
npx wrangler pages dev -- npm run dev
```

This runs the Cloudflare Workers runtime locally, but CF Access still won't intercept (it's an edge service). Useful for testing `locals.runtime.env` access.

### Environment variables

For local development, secrets go in `astro-app/.dev.vars` (not `.env`):

```
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
SANITY_API_WRITE_TOKEN=sk...
GA4_PROPERTY_ID=123456789
GA4_SERVICE_ACCOUNT_EMAIL=sa@project.iam.gserviceaccount.com
GA4_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

Public variables go in `astro-app/.env`:

```
PUBLIC_SANITY_PROJECT_ID=abc123
PUBLIC_SANITY_DATASET=production
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

**Rule:** If it starts with `PUBLIC_`, it's visible in the browser. If not, it's server-only.

---

## Common Gotchas

### 1. "My React component isn't interactive"

You forgot the `client:*` directive:

```astro
<!-- WRONG — renders to HTML only, no interactivity -->
<MyPanel submissions={data} />

<!-- RIGHT — hydrates in the browser -->
<MyPanel client:load submissions={data} />
```

### 2. "className vs class"

- In `.astro` files: use `class` (it's HTML, not JSX)
- In `.tsx` files: use `className` (it's React/JSX)

```astro
<!-- .astro file -->
<div class="text-lg font-bold">Title</div>
```

```tsx
// .tsx file
<div className="text-lg font-bold">Title</div>
```

### 3. "My props are undefined in the React component"

Props must be JSON-serializable. You can't pass:
- Functions
- React elements / JSX
- Class instances
- Dates (pass as ISO string, parse in component)
- Maps/Sets (convert to arrays/objects)

```astro
<!-- WRONG — Date object can't serialize -->
<MyPanel date={new Date()} />

<!-- RIGHT — ISO string serializes fine -->
<MyPanel date={new Date().toISOString()} />
```

### 4. "I need to share state between two islands"

Islands are independent React roots. They can't share React context or state. Options:

- **URL search params** — both islands read from `window.location.search`
- **Custom events** — `window.dispatchEvent(new CustomEvent("my-event", { detail: data }))`
- **Server endpoint** — both islands fetch from the same API endpoint
- **Merge into one island** — if they need tight coupling, make them one component

### 5. "I can't access environment variables in my React component"

React components run in the browser. Server secrets aren't available. Instead:

```tsx
// WRONG — this is undefined in the browser
const key = import.meta.env.GA4_PRIVATE_KEY;

// RIGHT — fetch from a server endpoint
useEffect(() => {
  fetch("/portal/api/analytics").then(/* ... */);
}, []);
```

### 6. "My portal page crashes at build time"

You forgot `export const prerender = false`:

```astro
---
export const prerender = false;  // ← Don't forget this!
// ...
---
```

Without it, Astro tries to build the page at deploy time, but there's no authenticated user, no `locals.user`, and no Cloudflare runtime — so it crashes.

### 7. "TypeScript errors after changing a Sanity query"

Run typegen to regenerate types:

```bash
npm run typegen
```

This updates `sanity.types.ts` based on the current schema and queries.

### 8. "My server endpoint returns HTML instead of JSON"

Make sure you're returning a `Response` object with the correct content type:

```typescript
// WRONG — Astro might try to render this as a page
return data;

// RIGHT
return new Response(JSON.stringify(data), {
  headers: { "Content-Type": "application/json" },
});
```

### 9. "useEffect runs twice in dev mode"

This is React 18 Strict Mode behavior (double-invocation in development). It's normal and doesn't happen in production. Make sure your effects are idempotent.

---

## File Structure Reference

```
astro-app/src/
├── middleware.ts                    # Auth gate for /portal/* routes
├── env.d.ts                        # TypeScript types (App.Locals, Runtime env)
├── lib/
│   ├── auth.ts                     # JWT validation (validateAccessJWT)
│   ├── ga4.ts                      # GA4 Data API client
│   ├── gtm.ts                      # pushEvent() helper for dataLayer
│   └── sanity.ts                   # GROQ queries (defineQuery)
├── components/
│   ├── portal/                     # ★ Portal React components (your home base)
│   │   ├── types.ts                # Shared TypeScript types
│   │   ├── StatCard.tsx            # Reusable stat card
│   │   ├── SubmissionsPanel.tsx    # Submissions island (client:load)
│   │   ├── EngagementPanel.tsx     # Analytics island (client:visible)
│   │   └── SponsorProjects.tsx     # Project list island (client:load)
│   ├── ui/                         # shadcn/ui Astro components (existing)
│   └── blocks/                     # Page builder blocks (existing)
├── pages/
│   └── portal/
│       ├── index.astro             # Portal landing / verification stub
│       ├── dashboard.astro         # Dashboard page (Story 9.7)
│       ├── [sponsor-slug].astro    # Sponsor view (Story 9.2)
│       └── api/
│           ├── me.ts               # GET → { email } (Story 9.1)
│           ├── submissions.ts      # GET → submission data (Story 9.7)
│           ├── analytics.ts        # GET → GA4 metrics (Story 9.7)
│           └── projects.ts         # GET → sponsor's projects (Story 9.2)
└── layouts/
    └── Layout.astro                # Shared page layout
```

**Your work as a React dev will mainly be in `components/portal/`.**

The `.astro` pages and server endpoints are the "glue" — they handle auth, data fetching, and wiring your React components into the page. You may need to modify these too, but the interactive UI logic lives in your `.tsx` files.

---

## Glossary

| Term | What It Means |
|---|---|
| **Astro** | The web framework. Generates static HTML by default, with opt-in interactivity. |
| **Island** | An interactive React component embedded in static HTML. Each island hydrates independently. |
| **Client directive** | `client:load`, `client:visible`, etc. Tells Astro when to hydrate a React component. |
| **Hydration** | The process of attaching JavaScript to server-rendered HTML so it becomes interactive. |
| **SSR** | Server-Side Rendering. The page is rendered on the server for each request (not at build time). |
| **`prerender = false`** | Opt-in to SSR for a specific page. Without this, Astro builds the page at deploy time. |
| **Frontmatter** | The `---` fenced section at the top of `.astro` files. Runs on the server. |
| **GROQ** | Sanity's query language. Like SQL but for JSON documents. |
| **`loadQuery`** | Sanity's data fetching function. Used in `.astro` frontmatter or server endpoints. |
| **`defineQuery`** | Wrapper for GROQ queries that enables TypeScript type generation. |
| **Cloudflare Access** | Cloudflare's auth service. Sits at the edge, requires login before requests reach the server. |
| **JWT** | JSON Web Token. The proof that a user authenticated. Contains their email. |
| **Middleware** | Code that runs before every SSR page/endpoint. Our middleware validates JWTs and sets `locals.user`. |
| **`locals`** | Request-scoped data bag. Middleware puts `user` in it; pages and endpoints read from it. |
| **`.dev.vars`** | Cloudflare's local secrets file. Like `.env` but specifically for Workers secrets. |
| **GTM** | Google Tag Manager. Tracks user interactions by pushing events to `window.dataLayer`. |
| **GA4** | Google Analytics 4. Receives events from GTM. We query it via the GA4 Data API for the dashboard. |
| **TypeGen** | Generates TypeScript types from Sanity schema + GROQ queries. Run after schema/query changes. |
