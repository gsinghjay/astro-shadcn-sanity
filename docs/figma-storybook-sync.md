# Figma + Storybook Sync

## Overview
Capturing all 153 Storybook components into a Figma design file for visual reference and design-code linking.

## Current Status: 31/153 captured — READY TO RESUME

- 30 from original batch + Faqs2 confirmed in Figma
- 122 remaining components with capture IDs assigned
- Script patched with 90s timeout — needs to be launched

## Next Step (copy-paste this into a new Claude Code session)

```
Continue Figma-Storybook capture. Tracking doc: docs/figma-storybook-sync.md

Status:
- 31/153 components captured in Figma (30 original + Faqs2)
- 122 remaining, all 123 capture IDs generated and mapped
- Script at /tmp/figma-capture.mjs just patched with 90s Promise.race timeout
  (captureForDesign() succeeds server-side but promise hangs client-side)
- Progress file /tmp/capture-progress.json has faqs2 marked done
- Storybook running on port 6006

What to do:
1. Verify the script fix looks correct: cat /tmp/figma-capture.mjs
2. Launch: node /tmp/figma-capture.mjs 2>&1 | tee /tmp/figma-capture.log
3. Monitor progress — each capture should take ~90s max now (timeout assumes success)
4. After completion, check /tmp/capture-progress.json for final counts
5. Update docs/figma-storybook-sync.md with results
```

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
print(f'Done: {done}, Errors: {err}, Remaining: {123-done-err}')
"
```

## How to Resume (if script dies mid-run)

The script is **resumable** — it reads `/tmp/capture-progress.json` and skips completed entries.

```bash
# Just re-run:
node /tmp/figma-capture.mjs 2>&1 | tee /tmp/figma-capture.log
```

If all 123 capture IDs have been used (check progress file), generate new IDs for failures:
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
- Captures DO succeed even when they appear to "timeout" on the client side — 31 components confirmed in Figma
- Script is **resumable** via `/tmp/capture-progress.json`

### Critical discovery: captureForDesign() promise hangs
- `captureForDesign()` successfully POSTs the DOM to Figma (component appears in file)
- But the JavaScript promise **never resolves** — it hangs indefinitely
- Original fix removed timeout entirely → script stuck on first capture forever
- **Current fix:** 90s `Promise.race` timeout that assumes success and moves on
- This means every capture takes exactly 90s (the POST completes much faster but we can't detect it)

### What doesn't work
- **Capture IDs are single-use and expire** — burnt IDs from previous sessions can't be reused
- **Generating IDs is slow** — requires Figma MCP tool calls (max 5 parallel per batch)

## 31 Components Already in Figma
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
blocks-faqs-faqs1--default             blocks-faqs-faqs2--default
ui-button--default
```

## Scripts

| File | Purpose |
|------|---------|
| `/tmp/figma-capture.mjs` | Playwright capture script (90s Promise.race timeout) |
| `/tmp/capture-map.json` | 123-entry component-to-captureId mapping |
| `/tmp/capture-ids.txt` | 123 fresh capture IDs (all generated) |
| `/tmp/capture-progress.json` | Resumable progress tracker (faqs2 = done) |
| `/tmp/component-stories.json` | All 153 components with Storybook story IDs |
| `/tmp/figma-capture.log` | Capture output log |

## Completed Tasks

### 1. ~~Fix the capture script~~ DONE (twice)
- First fix: removed Promise.race entirely → script hung forever
- Second fix: 90s Promise.race that assumes success (captures succeed server-side)
- Removed `page.goto('about:blank')` after errors
- Kept CSP stripping (`page.route`) and progress tracking

### 2. ~~Generate 123 capture IDs~~ DONE
- Generated 63 new IDs across 13 batches of 5-parallel Figma MCP calls
- Total: 123 IDs in `/tmp/capture-ids.txt`

### 3. ~~Build capture map~~ DONE
- Built `/tmp/capture-map.json` — 123 entries pairing remaining components with IDs

### 4. Run captures (READY — not yet launched with fixed script)
- Script patched, progress file has faqs2 marked done
- Expected: 122 remaining x 90s each = ~3 hours
- Storybook must be running on port 6006

### 5. Organize in Figma (TODO — manual)
- Each captured component becomes a page in the Figma file
- Rename/organize pages as needed
- Optionally set up Code Connect

## Prerequisites
- Storybook running on port 6006: `docker compose --profile storybook up storybook -d`
- Playwright installed (available at project root `node_modules/playwright`)
- Figma MCP connected for capture ID generation
