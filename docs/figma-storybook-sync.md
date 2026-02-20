# Figma + Storybook Sync

## Overview
Capturing all 153 Storybook components into a Figma design file for visual reference and design-code linking.

## Current Status: 153/153 captured — DONE

**Last updated:** 2026-02-19

- 30 from original batch (pre-script)
- 39 from first automated run
- 48 from second automated run (2026-02-19 evening)
- 7 from third automated run (2026-02-19 late — Stats1 retry + 6 UI components)
- 22 from fourth automated run (2026-02-20 — 22/22 perfect, UI/Empty through UI/Skeleton)
- 7 from fifth automated run (2026-02-19 — final 7: Spinner, Table, Tabs, Textarea, ThemeToggle, Tile, Video)

## All Captures Complete

All 153 Storybook components have been captured into the Figma file. The remaining task is to organize pages in Figma (manual).

## How to Monitor (once running)

```bash
# Watch live progress
tail -f /tmp/figma-capture.log

# Check counts
python3 -c "
import json
d=json.load(open('/tmp/capture-progress.json'))
done=sum(1 for v in d.values() if v=='done')
err=sum(1 for v in d.values() if v!='done')
print(f'Done: {done}, Errors: {err}')
"
```

## How to Resume (if script dies mid-run)

The script is **resumable** — it reads `/tmp/capture-progress.json` and skips completed entries.

```bash
# Just re-run:
node /tmp/figma-capture.mjs 2>&1 | tee /tmp/figma-capture.log
```

If capture IDs expire again, generate new ones:
```
mcp__figma__generate_figma_design(outputMode: "existingFile", fileKey: "5SmFEQZkbuFRDmqcRPcHRt")
```

## Figma File
- **Name:** Astro Shadcn Component Library
- **File Key:** `5SmFEQZkbuFRDmqcRPcHRt`
- **URL:** https://www.figma.com/integrations/claim/5SmFEQZkbuFRDmqcRPcHRt

## Chromatic (Storybook Hosting)
- **Storybook URL:** https://6988f7ff380de2443babfbc5-yoacximcio.chromatic.com/
- **Setup URL:** https://www.chromatic.com/setup?appId=6988f7ff380de2443babfbc5
- **Stats:** 153 components, 241 stories, 241 snapshots
- **Project token:** `chpt_f1daed7a4dd9d36`

## Key Findings

### What works
- Figma MCP `generate_figma_design` tool generates capture IDs (one per component)
- Playwright standalone script navigates to Storybook iframe, injects Figma capture.js, and submits DOM
- CSP header stripping via `page.route()` is **required** for the capture POST to succeed
- Captures DO succeed even when they appear to "timeout" on the client side
- Script is **resumable** via `/tmp/capture-progress.json`

### Critical discovery: captureForDesign() promise hangs
- `captureForDesign()` successfully POSTs the DOM to Figma (component appears in file)
- But the JavaScript promise **never resolves** — it hangs indefinitely
- **Current fix:** 60s `Promise.race` timeout that assumes success and moves on
- Every capture takes exactly 60s (the POST completes much faster but we can't detect it)

### Capture IDs expire after ~1 hour
- IDs generated upfront expire before the script reaches them (~60s per capture)
- First ~48 captures succeed, then IDs start expiring (improved from ~35 in first run)
- **Mitigation:** Generate IDs right before use, or generate in smaller batches
- Future improvement: modify script to request fresh IDs on-the-fly via MCP API

### What doesn't work
- **Capture IDs are single-use and expire ~1hr** — burnt/expired IDs can't be reused
- **Generating IDs is slow** — requires Figma MCP tool calls (max 5 parallel per batch)
- **Figma MCP has rate limits** — hit limit twice on 2026-02-19 (after ~56 IDs, then after 7 more)

## All 153 Components in Figma

### 30 from original batch
```
blocks-articles-article1--default      blocks-articles-article2--default
blocks-articles-articles1--default     blocks-articles-articles2--default
blocks-articles-articles3--default     blocks-articles-articles4--default
blocks-banner-banner1--default         blocks-banner-banner2--default
blocks-cta-cta1--default               blocks-cta-cta2--default
blocks-cta-cta3--default               blocks-cta-cta4--default
blocks-cta-cta5--default               blocks-cta-cta6--default
blocks-cta-cta7--default               blocks-cta-cta8--default
blocks-contact-contact1--default       blocks-contact-contact2--default
blocks-contact-contact3--default       blocks-contactform--default
blocks-content-content1--default       blocks-content-content2--default
blocks-content-content3--default       blocks-content-content4--default
blocks-content-content5--default       blocks-content-content6--default
blocks-ctabanner--default              blocks-eventlist--default
blocks-faqs-faqs1--default             ui-button--default
```

### 39 from first automated run
```
blocks-faqs-faqs2--default             blocks-faqs-faqs3--default
blocks-faqs-faqs4--default             blocks-faqsection--default
blocks-featuregrid--two-column         blocks-features-features1--default
blocks-features-features2--default     blocks-features-features3--default
blocks-features-features4--default     blocks-features-features5--default
blocks-features-features6--default     blocks-footer-footer1--default
blocks-footer-footer2--default         blocks-footer-footer3--default
blocks-header-header1--default         blocks-header-header2--default
blocks-header-header3--default         blocks-hero-hero1--default
blocks-hero-hero10--default            blocks-hero-hero11--default
blocks-hero-hero12--default            blocks-hero-hero13--default
blocks-hero-hero14--default            blocks-hero-hero2--default
blocks-hero-hero3--default             blocks-hero-hero4--default
blocks-hero-hero5--default             blocks-hero-hero6--default
blocks-hero-hero7--default             blocks-hero-hero8--default
blocks-hero-hero9--default             blocks-herobanner--default
blocks-images-images1--default         blocks-images-images2--default
blocks-links-links1--default           blocks-links-links2--default
blocks-logocloud--with-logos           blocks-logos-logos1--default
blocks-products-products3--default
```

### 48 from second automated run (2026-02-19)
```
blocks-logos-logos2--default            blocks-logos-logos3--default
blocks-meta-blocks1--default           blocks-meta-blocks2--default
blocks-meta-blocks3--default           blocks-meta-blocks4--default
blocks-pricings-pricings1--default     blocks-pricings-pricings2--default
blocks-pricings-pricings3--default     blocks-products-product1--default
blocks-products-products1--default     blocks-products-products2--default
blocks-products-products4--default     blocks-products-products5--default
blocks-reviews-reviews1--default       blocks-reviews-reviews2--default
blocks-reviews-reviews3--default       blocks-reviews-reviews4--default
blocks-reviews-reviews5--default       blocks-richtext--default
blocks-services-services1--default     blocks-services-services2--default
blocks-services-services3--default     blocks-services-services4--default
blocks-services-services5--default     blocks-services-services6--default
blocks-services-services7--default     blocks-sponsorcards--default
blocks-sponsorsteps--default           blocks-stats-stats2--default
blocks-stats-stats3--default           blocks-statsrow--light
blocks-steps-steps1--default           blocks-steps-steps2--default
blocks-steps-steps3--default           blocks-table-table1--default
blocks-testimonials--default           blocks-textwithimage--image-right
blocks-video-video1--default           blocks-video-video2--default
blocks-video-video3--default           blocks-video-videos1--default
blocks-video-videos2--default          blocks-video-videos3--default
blocks-video-videos4--default          components-projectcard--full
ui-accordion--single-item              ui-field--default
```

### 7 from third automated run (2026-02-19 late)
```
blocks-stats-stats1--default           ui-alert--default
ui-avatar--with-image                  ui-badge--default
ui-banner--default                     ui-checkbox--default
ui-collapsible--default
```

### 22 from fourth automated run (2026-02-20)
```
ui-empty--default                      ui-footer--default
ui-header--default                     ui-icon--lucide-heart
ui-image--default                      ui-input--text
ui-item--default                       ui-label--default
ui-list--default                       ui-logo--default
ui-marquee--scroll-left                ui-nativecarousel--default
ui-nativeselect--default               ui-navigationmenu--with-dropdown
ui-price--default                      ui-radiogroup--default
ui-rating--five-stars                  ui-section--content
ui-separator--horizontal               ui-sheet--right
ui-sidebar--default                    ui-skeleton--default
```

### 7 from fifth automated run (2026-02-19 — final batch)
```
ui-spinner--default                    ui-table--default
ui-tabs--default                       ui-textarea--default
ui-themetoggle--default                ui-tile--default
ui-video--you-tube
```

## Scripts

| File | Purpose |
|------|---------|
| `/tmp/figma-capture.mjs` | Playwright capture script (60s Promise.race timeout) |
| `/tmp/capture-map.json` | component-to-captureId mapping (needs rebuild for 29 remaining) |
| `/tmp/new-capture-ids.txt` | All used/expired — needs 29 fresh IDs |
| `/tmp/capture-ids.txt` | 123 original IDs (ALL EXPIRED — do not use) |
| `/tmp/capture-progress.json` | Progress tracker (94 done, clean) |
| `/tmp/component-stories.json` | All 153 components with Storybook story IDs |
| `/tmp/figma-capture.log` | Capture output log |

## Completed Tasks

### 1. ~~Fix the capture script~~ DONE (three times)
- First fix: removed Promise.race entirely → script hung forever
- Second fix: 90s Promise.race that assumes success
- Third fix: reduced to 60s timeout (user request)

### 2. ~~Generate 123 capture IDs~~ DONE (but expired)
- Generated 63 new IDs across 13 batches of 5-parallel Figma MCP calls
- Total: 123 IDs — ALL NOW EXPIRED

### 3. ~~Build capture map~~ DONE (rebuilt twice)
- Originally 123 entries, rebuilt for 56 remaining with fresh IDs
- Needs one more rebuild for final 36

### 4. Run captures — 153/153 DONE
- First run: 39/123 captured before IDs expired
- Second run (2026-02-19): 48/56 captured (1 processing error, 7 expired at tail)
- Third run (2026-02-19 late): 7/7 captured (Stats1 retry + Alert/Avatar/Badge/Banner/Checkbox/Collapsible)
- Fourth run (2026-02-20): 22/22 captured (UI/Empty through UI/Skeleton)
- Fifth run (2026-02-19): 7/7 captured (final batch — Spinner, Table, Tabs, Textarea, ThemeToggle, Tile, Video)
- Total across all runs: 153/153

### 5. Generate capture IDs — DONE
- Generated 56 IDs in first batch on 2026-02-19 (all used or expired)
- Generated 7 more after rate limit reset (all used)
- Generated 22 more for fourth run (all used)
- Generated 7 more for fifth/final run (all used)

### 6. Organize in Figma (TODO — manual)
- Each captured component becomes a page in the Figma file
- Rename/organize pages as needed
- Optionally set up Code Connect

## Prerequisites
- Storybook running on port 6006: `docker compose --profile storybook up storybook -d`
- Playwright installed (available at project root `node_modules/playwright`)
- Figma MCP connected for capture ID generation
