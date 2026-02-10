import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

test.describe('Story 5-4: Preview & Publish Architecture', () => {
  test.describe('AC7: Perspective deprecation fix', () => {
    const sanityPath = path.resolve(ASTRO_APP, 'src/lib/sanity.ts')
    let sanityContent: string

    test.beforeAll(() => {
      sanityContent = readFileSync(sanityPath, 'utf-8')
    })

    test('[P0] 5.4-INT-001 — loadQuery uses "drafts" perspective, not deprecated "previewDrafts"', () => {
      // AC7: The perspective should be "drafts" (renamed from deprecated "previewDrafts")
      expect(sanityContent).not.toContain('"previewDrafts"')
    })

    test('[P0] 5.4-INT-002 — perspective is conditional on visualEditingEnabled', () => {
      // AC7: Should use "drafts" when visual editing is enabled, "published" otherwise
      expect(sanityContent).toMatch(/visualEditingEnabled\s*\?\s*["']drafts["']/)
    })

    test('[P0] 5.4-INT-003 — perspective includes "published" for production', () => {
      // AC7: Production (non-preview) should use "published" perspective
      expect(sanityContent).toContain('"published"')
    })
  })

  test.describe('AC5: SSR cache invalidation', () => {
    const sanityPath = path.resolve(ASTRO_APP, 'src/lib/sanity.ts')
    let sanityContent: string

    test.beforeAll(() => {
      sanityContent = readFileSync(sanityPath, 'utf-8')
    })

    test('[P0] 5.4-INT-004 — getSiteSettings bypasses cache when visualEditingEnabled is true', () => {
      // AC5: In SSR mode (visualEditingEnabled), cache must be bypassed so editors see fresh data.
      // The cache check must guard on !visualEditingEnabled before returning cached value.
      expect(sanityContent).toMatch(/!visualEditingEnabled\s*&&\s*_siteSettingsCache/)
    })

    test('[P0] 5.4-INT-005 — getSiteSettings does NOT unconditionally return cache', () => {
      // AC5: The old pattern "if (_siteSettingsCache) return _siteSettingsCache" without
      // the visualEditingEnabled guard is a bug in SSR mode. It must not be present.
      expect(sanityContent).not.toMatch(
        /if\s*\(\s*_siteSettingsCache\s*\)\s*return\s+_siteSettingsCache/
      )
    })

    test('[P0] 5.4-INT-006 — module-level _siteSettingsCache variable exists', () => {
      // AC5: The cache variable itself should still exist (it's used for static builds)
      expect(sanityContent).toContain('let _siteSettingsCache')
    })
  })

  test.describe('AC6: Preview CSP for Visual Editing', () => {
    const layoutPath = path.resolve(ASTRO_APP, 'src/layouts/Layout.astro')
    let layoutContent: string

    test.beforeAll(() => {
      layoutContent = readFileSync(layoutPath, 'utf-8')
    })

    test('[P0] 5.4-INT-007 — CSP connect-src includes wss://*.sanity.io for WebSocket', () => {
      // AC6: Visual Editing uses WebSocket for real-time content updates
      expect(layoutContent).toContain('wss://*.sanity.io')
    })

    test('[P0] 5.4-INT-008 — CSP connect-src includes https://*.sanity.io', () => {
      // AC6: Visual Editing needs HTTPS access to Sanity API
      expect(layoutContent).toContain('https://*.sanity.io')
    })

    test('[P0] 5.4-INT-009 — Layout renders VisualEditing component', () => {
      // AC6: The VisualEditing component must be present for overlays and click-to-edit
      expect(layoutContent).toContain('<VisualEditing')
      expect(layoutContent).toContain('enabled={visualEditingEnabled}')
    })

    test('[P0] 5.4-INT-010 — Layout imports VisualEditing from @sanity/astro', () => {
      // AC6: Correct import path for the Astro Visual Editing integration
      expect(layoutContent).toContain('from "@sanity/astro/visual-editing"')
    })
  })

  test.describe('AC6: Cloudflare _headers for iframe embedding', () => {
    const headersPath = path.resolve(ASTRO_APP, 'public/_headers')

    test('[P0] 5.4-INT-011 — _headers file exists', () => {
      expect(existsSync(headersPath)).toBe(true)
    })

    test('[P0] 5.4-INT-012 — _headers sets frame-ancestors for Sanity Studio embedding', () => {
      // AC6: Sanity Presentation tool loads the preview site in an iframe.
      // frame-ancestors must allow sanity.studio and sanity.io origins.
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain("frame-ancestors 'self' https://*.sanity.studio https://*.sanity.io")
    })
  })

  test.describe('Sanity client configuration guards', () => {
    const sanityPath = path.resolve(ASTRO_APP, 'src/lib/sanity.ts')
    let sanityContent: string

    test.beforeAll(() => {
      sanityContent = readFileSync(sanityPath, 'utf-8')
    })

    test('[P1] 5.4-INT-013 — loadQuery uses token only when visualEditingEnabled', () => {
      // Security: API read token should only be sent during preview, not in production builds
      expect(sanityContent).toMatch(/visualEditingEnabled\s*\?\s*\{\s*token\s*\}/)
    })

    test('[P1] 5.4-INT-014 — loadQuery enables stega only when visualEditingEnabled', () => {
      // Stega encoding (invisible characters for click-to-edit) must only be active in preview
      expect(sanityContent).toMatch(/stega:\s*visualEditingEnabled/)
    })

    test('[P1] 5.4-INT-015 — visualEditingEnabled reads from PUBLIC_SANITY_VISUAL_EDITING_ENABLED', () => {
      // The env var controls the preview/production split
      expect(sanityContent).toContain('PUBLIC_SANITY_VISUAL_EDITING_ENABLED')
    })

    test('[P1] 5.4-INT-016 — loadQuery throws if token missing during visual editing', () => {
      // Safety: Should error loudly rather than silently fail with unauthorized requests
      expect(sanityContent).toContain('SANITY_API_READ_TOKEN')
      expect(sanityContent).toMatch(/throw new Error/)
    })
  })
})
