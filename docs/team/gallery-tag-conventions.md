# Gallery Tag Conventions

The `/gallery` page on the Capstone site is **automatically populated from the
Sanity Media Library** based on tags applied to image assets. No code changes
or page-builder edits are required to add or remove a photo from the gallery —
just tag the asset.

This document describes the editor contract.

## TL;DR

| Tag | Required? | Effect |
| :-- | :-- | :-- |
| `gallery` | **Yes** | Asset appears on `/gallery`. Without this tag, the asset is invisible to the gallery feed. |
| `gallery-featured` | No | Renders the asset in the featured hero row (top of the gallery grid) instead of the regular grid. |
| `gallery-<year>` (e.g. `gallery-2026`) | No | Populates the **Year** filter pill set. The asset shows under that pill. |
| `gallery-<category>` | No | Populates the **Category** filter pill set. The asset shows under that pill. Canonical slugs only — see below. |

You can apply any combination. An asset with `gallery`, `gallery-featured`,
`gallery-2026`, `gallery-web-apps` will show up:

- in the featured hero row,
- under the **2026** year pill,
- under the **Web Apps** category pill,
- and (always) under the **All** pill.

## Canonical category slugs

Use **only** these category slugs after the `gallery-` prefix:

| Slug | Pill label |
| :-- | :-- |
| `web-apps` | Web Apps |
| `mobile` | Mobile |
| `ai-ml` | AI/ML |
| `data-viz` | Data Viz |
| `iot` | IoT |
| `other` | Other |

A tag like `gallery-typo` or `gallery-future` will be **silently ignored** for
filter purposes — the asset still appears under "All" but not under any
category pill.

## Tagging an image

1. Open the **Media** tool in Sanity Studio (sidebar icon).
2. Click an asset to open its detail panel.
3. In the **Tags** field, start typing `gallery` — pick the existing tag, or
   create it on first use.
4. Repeat for `gallery-featured`, `gallery-<year>`, `gallery-<category>` as
   needed.
5. Click **Save changes**.

## When does the gallery update?

| Environment | Update timing |
| :-- | :-- |
| Studio Presentation (preview Workers) | **Instant** — drafts perspective + SSR. Refresh the iframe. |
| Production (`ywcccapstone1.com`) | **On next code-driven deploy.** The Sanity webhook does not currently fire on asset/tag changes. |

If you need a tag change to land on production immediately, ping the
engineering channel for a manual deploy. Otherwise wait for the next merge.

## Edge cases

- **Year regex is lenient:** `gallery-2099` or `gallery-1234` will successfully
  populate a year pill. The format is `gallery-<4 digits>`. Out-of-range
  values won't be filtered out — be careful what you type.
- **Multiple year tags:** `gallery-2025` + `gallery-2026` on the same asset →
  the **first tag in the asset's tag list wins**. Reorder or delete extras to
  change which year pill the asset sorts under.
- **Multiple category tags:** Same first-match-wins rule applies.
- **Caption fallback:** The visible caption falls back through `description` →
  `title` → empty. Keep the asset description short and descriptive — that's
  what readers see under the thumbnail.
- **Alt text:** Pulled from the asset's native `altText` field. Always fill
  this in for accessibility.

## What about the page builder?

You can still drop an `imageGallery` block onto any **other** page (sponsor
profile, project detail, custom marketing page) and it will continue to work
as before — pick images by hand, set per-image year/category/featured fields
inline. That path is unchanged.

The auto-curate flow only powers the `/gallery` listing page.

## Related files (for engineers)

- `astro-app/src/lib/sanity.ts` — `GALLERY_ASSETS_QUERY`, `getGalleryAssets()`,
  `parseGalleryAssetTags()`.
- `astro-app/src/components/blocks/custom/_partials/GalleryGrid.astro` —
  shared rendering partial.
- `astro-app/src/components/blocks/custom/ImageGallery.astro` — block wrapper.
- `astro-app/src/pages/gallery/index.astro` — listing page route.
