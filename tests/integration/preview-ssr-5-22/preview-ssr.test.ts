import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app');

// The 14 routes Story 5.22 promises to flip to SSR on preview Workers.
// Production builds keep them prerendered; preview Workers (PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true)
// override `prerender = false` via the astro:route:setup hook in astro.config.mjs.
// Bare suffixes matching the hook's `endsWith` check (see astro.config.mjs
// PREVIEW_SSR_ROUTES).
const PREVIEW_SSR_ROUTES = [
  'src/pages/index.astro',
  'src/pages/[...slug].astro',
  'src/pages/events/index.astro',
  'src/pages/events/[slug].astro',
  'src/pages/sponsors/index.astro',
  'src/pages/sponsors/[slug].astro',
  'src/pages/articles/index.astro',
  'src/pages/articles/[slug].astro',
  'src/pages/articles/category/[slug].astro',
  'src/pages/authors/index.astro',
  'src/pages/authors/[slug].astro',
  'src/pages/projects/index.astro',
  'src/pages/projects/[slug].astro',
  'src/pages/gallery/index.astro',
] as const;

describe('Story 5.22: Preview Worker SSR Mode for Content Freshness', () => {
  describe('AC-1 / AC-4: Production routes stay prerendered', () => {
    test.each(PREVIEW_SSR_ROUTES)(
      '[P0] 5-22-INT-001 — %s exports prerender = true (production behaviour)',
      (routePath) => {
        const filePath = path.join(ASTRO_APP, routePath);
        expect(existsSync(filePath)).toBe(true);
        const content = readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/^\s*export\s+const\s+prerender\s*=\s*true\s*;/m);
      },
    );
  });

  describe('AC-1 / AC-2 / AC-3: astro.config.mjs flips listed routes to SSR when VE is on', () => {
    let configContent: string;

    beforeAll(() => {
      configContent = readFileSync(path.resolve(ASTRO_APP, 'astro.config.mjs'), 'utf-8');
    });

    test('[P0] 5-22-INT-010 — defines previewSsrIntegration with astro:route:setup hook', () => {
      expect(configContent).toContain("name: 'preview-ssr-content-routes'");
      expect(configContent).toContain("'astro:route:setup'");
    });

    test('[P0] 5-22-INT-011 — hook gates on visualEditingEnabled === "true"', () => {
      // The hook must be a no-op outside preview Workers — production stays prerendered.
      expect(configContent).toMatch(/visualEditingEnabled\s*!==\s*['"]true['"]/);
    });

    test('[P0] 5-22-INT-012 — hook sets route.prerender = false on matched routes', () => {
      expect(configContent).toMatch(/route\.prerender\s*=\s*false/);
    });

    test('[P0] 5-22-INT-012b — hook matches via route.component.endsWith (docs idiom)', () => {
      // The official Astro docs example uses `route.component.endsWith(...)`.
      // Holding to that idiom keeps the integration robust to any path
      // separator differences and matches the documented contract.
      expect(configContent).toMatch(/route\.component\.endsWith\(/);
    });

    test('[P0] 5-22-INT-013 — integration is registered before sanity() in integrations[]', () => {
      // Order matters: route-setup runs once per route at config-resolve time.
      const integrationsBlockMatch = configContent.match(/integrations:\s*\[([\s\S]*?)\]/);
      expect(integrationsBlockMatch).toBeTruthy();
      const block = integrationsBlockMatch![1];
      const previewIdx = block.indexOf('previewSsrIntegration');
      const sanityIdx = block.indexOf('sanity(');
      expect(previewIdx).toBeGreaterThanOrEqual(0);
      expect(sanityIdx).toBeGreaterThan(previewIdx);
    });

    test.each(PREVIEW_SSR_ROUTES)(
      '[P0] 5-22-INT-014 — PREVIEW_SSR_ROUTES allowlist includes %s',
      (routePath) => {
        // Allowlist is the source of truth for which routes flip to SSR.
        // Adding a new content route requires updating this list — the test
        // catches drift between the file-level prerender opt-in and the hook.
        expect(configContent).toContain(`'${routePath}'`);
      },
    );
  });

  describe('AC-5: Sanity client + caches honour VE flag (regression)', () => {
    let sanityContent: string;

    beforeAll(() => {
      sanityContent = readFileSync(path.resolve(ASTRO_APP, 'src/lib/sanity.ts'), 'utf-8');
    });

    test('[P0] 5-22-INT-020 — drafts perspective stays gated on visualEditingEnabled', () => {
      // Same gate Story 5.4 introduced. Per-request SSR rendering must not
      // accidentally use the published perspective on preview.
      expect(sanityContent).toMatch(/visualEditingEnabled\s*\?\s*['"]drafts['"]/);
    });

    test('[P0] 5-22-INT-021 — _siteSettingsCache bypasses when VE is on', () => {
      // SSR mode hits this cache check on every request. The bypass guard
      // is what makes published-after-deploy siteSettings edits visible
      // on preview without a redeploy.
      expect(sanityContent).toMatch(/!visualEditingEnabled\s*&&\s*_siteSettingsCache/);
    });

    test('[P0] 5-22-INT-022 — SanityPageContent island sets Cache-Control: no-store', () => {
      // The detail-route bodies that defer to <SanityPageContent server:defer>
      // rely on this header to prevent CDN/browser caching of preview content.
      const islandPath = path.resolve(ASTRO_APP, 'src/components/SanityPageContent.astro');
      const islandContent = readFileSync(islandPath, 'utf-8');
      expect(islandContent).toMatch(/Cache-Control['"]\s*,\s*['"][^'"]*no-store/);
    });
  });
});
