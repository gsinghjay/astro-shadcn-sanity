# Seed Demo Audit — Runbook

**Story:** 23.1 — Audit All 38 CMS Blocks via Sanity MCP Demo Pages
**Target workspace:** `capstone` **Dataset:** `production` **Project ID:** `49nk9b0w`
**Date of author:** 2026-04-14

Reseeds all 39 demo audit pages via Sanity MCP tools. Content references existing docs in `capstone/production` (no new refs created — see "Existing refs" below).

---

## Safety gate — run BEFORE any write

Execute in order. If any assertion fails, **STOP** — do not proceed with writes.

1. `mcp__plugin_sanity-plugin_Sanity__whoami` → confirm authenticated Sanity user.
2. `mcp__plugin_sanity-plugin_Sanity__list_projects` → confirm project `49nk9b0w` named "YWCC Capstone Spring 2026" is present.
3. `mcp__plugin_sanity-plugin_Sanity__list_datasets` with `resource: {projectId: "49nk9b0w"}` → confirm dataset `production` exists.
4. Cross-check `studio/sanity.config.ts:106` — workspace name is still `capstone`, dataset is `production`.

---

## Existing refs (reused — no re-creation)

Per story Open Question default ("reuse if present"), demo fixtures reference existing published docs from capstone/production rather than seed new ones.

### Sponsors (7 published, all tiers represented)
| _id | Name | Tier | Featured |
|---|---|---|---|
| `004122e9-a8d4-40c3-82ab-3e980bd5cb72` | Bank of America | gold | true |
| `0ac25e8d-f75d-478a-8512-994d83fe6177` | Cisco | platinum | true |
| `6f2a7a01-a75e-416d-b219-c59b4c6a2dc5` | Eco-Enterprise | silver | false |
| `72e7a364-fd4e-4b38-9acd-a3314ed4cb95` | Angeles de Medellin Foundation | bronze | false |
| `789cb14e-e72e-4335-b6d5-ac3bb87b022d` | UPS | gold | true |
| `b4aaf35f-dc0d-4567-993b-33bc66820e67` | Verizon | platinum | true |
| `e2febb59-87ae-473f-a91e-60adb83f3e6d` | Forbes | gold | true |

### Projects (10 — 2 featured)
IDs captured in query output; featured: `64bde361-ae0b-4ee5-a0d7-9c29b542a5ff` (YWCC Capstone Website v2), `c46bba9f-41ec-445a-8fd3-5fd875e3bcff` (Azure ML Resource Optimization).

### Events (1 — sufficient for `eventStatus: all`)
`25d4614e-66d0-47a1-9d95-ec2ffd67b823` — Spring 2026 Capstone Showcase (status upcoming, date 2026-05-07).

### Testimonials (9 published — 7 industry + 2 student)
Student refs (for `testimonialSource: student`): `a4e5d85c-1b09-4ce3-bb9c-02e246a10f68` (D'Angelo Morales), `f661cd69-4cdc-444d-88df-dab09a93b0d4` (Filip Mangoski).

### Form (1 published — satisfies `contactForm.form`)
`94f851ab-b59d-4c1c-9940-2a5ca778159c` — Sponsor Inquiry Form.

### Article category + articles
Category: `7ee08c97-701d-437c-a497-0b7fed6b191a` (program-news). Articles auto-fetched by `articleList` when `contentType: all`.

### Image assets (reused from existing CDN — 77 available)
Representative IDs used in fixtures for image fields:
- `image-117be8afe69ff441c417bb9de6e457e82848aaf4-5712x4284-jpg` (large landscape)
- `image-122cafda703c42a605cd9419994b3f326d08bf4c-1424x752-jpg` (OG banner)
- `image-12d1a6a9a872ae7e52390dd8775d592ae228820b-1424x752-jpg` (OG banner blue)
- `image-1523e949aae03ed9e321e5af7a18954133c34a56-1424x752-jpg` (OG banner navy)
- `image-1629d9cf7aed8f62aacc0aaa2665e2d80344a744-307x164-jpg` (small thumb)

Binaries are **not** uploaded by this runbook. If a new asset is needed mid-flight, upload via Studio or `mcp__plugin_sanity-plugin_Sanity__generate_image` first, then patch the referencing doc via `patch_document_from_json`.

---

## Seed order

Demo page fixtures live at `astro-app/src/fixtures/demo-audit/<kebab-type>.json`. Each JSON is a single `page` document (`_type: 'page'`) with `slug.current: 'demo/<kebab-type>'`, `seo.noIndex: true`, and a `blocks` array stacking every variant of the target block.

For each fixture file (39 total: 38 per-block + interactions):

```
mcp__plugin_sanity-plugin_Sanity__create_documents_from_json
  resource: {projectId: "49nk9b0w", dataset: "production"}
  documents: [<contents of fixture JSON>]
  intent: "Seed demo audit page for Story 23.1 — <block-kebab>"
```

Then publish each created draft:

```
mcp__plugin_sanity-plugin_Sanity__publish_documents
  resource: {projectId: "49nk9b0w", dataset: "production"}
  documentIds: ["demo-audit-<kebab>"]
```

Fixture files, in seed order:

1. `divider.json` — simplest (no refs, no images)
2. `rich-text.json` — PortableText shape
3. `pullquote.json` — image + hiddenByVariant
4. `sponsor-cards.json` — refs + displayMode enum
5. (remaining 34 per-block fixtures — see directory listing)
6. `interactions.json` — AC5 cross-block scenarios

---

## Teardown (for re-runs or rollback)

All audit pages share the `_id` prefix `demo-audit-*`. To remove:

```groq
*[_type == "page" && _id match "demo-audit-*"]._id
```

Then use `mcp__plugin_sanity-plugin_Sanity__unpublish_documents` followed by manual deletion in Studio (MCP has no bulk-delete).

---

## Post-seed verification

1. `npm run dev -w astro-app` — dev server up on :4321.
2. For each of 39 pages, `curl -I http://localhost:4321/demo/<kebab-type>` → expect `200`.
3. Spot-check `<meta name="robots" content*="noindex">` via `curl http://localhost:4321/demo/divider | grep 'name="robots"'`.
4. Run Playwright audit spec (`npm run test:chromium`) — artifacts under `astro-app/tests/e2e/block-audit/screenshots/`.
