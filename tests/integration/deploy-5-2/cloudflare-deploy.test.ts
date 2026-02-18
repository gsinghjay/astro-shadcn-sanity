import { describe, test, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

describe('Story 5-2: GA4, Security Headers & Cloudflare Deploy', () => {
  describe('AC5: Cloudflare adapter configuration', () => {
    const configPath = path.resolve(ASTRO_APP, 'astro.config.mjs')
    let configContent: string

    beforeAll(() => {
      configContent = readFileSync(configPath, 'utf-8')
    })

    test('[P0] 5.2-INT-001 — astro.config.mjs imports @astrojs/cloudflare', () => {
      expect(configContent).toContain('from "@astrojs/cloudflare"')
    })

    test('[P0] 5.2-INT-002 — astro.config.mjs does NOT import @astrojs/node', () => {
      expect(configContent).not.toContain('from "@astrojs/node"')
    })

    test('[P0] 5.2-INT-003 — adapter uses cloudflare with platformProxy enabled', () => {
      expect(configContent).toContain('cloudflare(')
      expect(configContent).toContain('platformProxy')
      expect(configContent).toContain('enabled: true')
    })

    test('[P0] 5.2-INT-004 — output defaults to static', () => {
      // Output is conditionally set: isVisualEditing ? "server" : "static"
      expect(configContent).toContain('"static"')
      expect(configContent).toMatch(/output:/)
    })

    test('[P0] 5.2-INT-005 — site property reads PUBLIC_SITE_URL env var', () => {
      expect(configContent).toContain('PUBLIC_SITE_URL')
    })
  })

  describe('AC7: Wrangler configuration', () => {
    const wranglerPath = path.resolve(ASTRO_APP, 'wrangler.jsonc')

    function parseJsonc(content: string): Record<string, unknown> {
      // Strip whole-line comments and inline comments (not inside strings)
      const lines = content.split('\n').map(line => {
        const trimmed = line.trimStart()
        if (trimmed.startsWith('//')) return ''
        return line
      })
      const jsonStr = lines.join('\n').replace(/\/\*[\s\S]*?\*\//g, '')
      return JSON.parse(jsonStr)
    }

    test('[P0] 5.2-INT-006 — wrangler.jsonc exists', () => {
      expect(existsSync(wranglerPath)).toBe(true)
    })

    test('[P0] 5.2-INT-007 — wrangler.jsonc has correct project name', () => {
      const config = parseJsonc(readFileSync(wranglerPath, 'utf-8'))
      expect(config.name).toBe('ywcc-capstone')
    })

    test('[P0] 5.2-INT-008 — wrangler.jsonc has compatibility_date and nodejs_compat', () => {
      const config = parseJsonc(readFileSync(wranglerPath, 'utf-8'))
      expect(config.compatibility_date).toBeDefined()
      expect(config.compatibility_flags).toContain('nodejs_compat')
    })

    test('[P0] 5.2-INT-009 — wrangler.jsonc has pages_build_output_dir pointing to dist', () => {
      const config = parseJsonc(readFileSync(wranglerPath, 'utf-8'))
      expect(config.pages_build_output_dir).toBe('./dist')
    })
  })

  describe('AC8: Deploy script in package.json', () => {
    test('[P0] 5.2-INT-010 — package.json has deploy script with wrangler pages deploy', () => {
      const pkgPath = path.resolve(ASTRO_APP, 'package.json')
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      expect(pkg.scripts.deploy).toBeDefined()
      expect(pkg.scripts.deploy).toContain('wrangler pages deploy')
    })
  })

  describe('AC2: GTM environment variable (migrated from GA4 in Story 5.8)', () => {
    test('[P0] 5.2-INT-011 — .env.example has PUBLIC_GTM_ID placeholder', () => {
      const envExample = readFileSync(path.resolve(ASTRO_APP, '.env.example'), 'utf-8')
      expect(envExample).toContain('PUBLIC_GTM_ID')
    })

    test('[P0] 5.2-INT-011b — .env.example does NOT have old PUBLIC_GA_MEASUREMENT_ID', () => {
      const envExample = readFileSync(path.resolve(ASTRO_APP, '.env.example'), 'utf-8')
      expect(envExample).not.toContain('PUBLIC_GA_MEASUREMENT_ID')
    })

    test('[P0] 5.2-INT-012 — .env.example has PUBLIC_SITE_URL placeholder', () => {
      const envExample = readFileSync(path.resolve(ASTRO_APP, '.env.example'), 'utf-8')
      expect(envExample).toContain('PUBLIC_SITE_URL')
    })
  })

  describe('AC1,AC3: Layout.astro GTM + CSP (migrated from GA4 in Story 5.8)', () => {
    const layoutPath = path.resolve(ASTRO_APP, 'src/layouts/Layout.astro')
    let layoutContent: string

    beforeAll(() => {
      layoutContent = readFileSync(layoutPath, 'utf-8')
    })

    test('[P0] 5.8-INT-001 — Layout.astro reads PUBLIC_GTM_ID from env', () => {
      expect(layoutContent).toContain('import.meta.env.PUBLIC_GTM_ID')
    })

    test('[P0] 5.8-INT-002 — Layout.astro includes GTM container script with gtm.js', () => {
      expect(layoutContent).toContain('https://www.googletagmanager.com/gtm.js')
    })

    test('[P0] 5.8-INT-003 — GTM script is conditionally rendered (only when gtmId is set)', () => {
      expect(layoutContent).toMatch(/gtmId\s*&&/)
    })

    test('[P0] 5.8-INT-004 — GTM uses define:vars to pass container ID', () => {
      expect(layoutContent).toContain('define:vars={{ gtmId }}')
    })

    test('[P0] 5.8-INT-005 — GTM noscript iframe present in body', () => {
      expect(layoutContent).toContain('https://www.googletagmanager.com/ns.html')
      expect(layoutContent).toContain('<noscript>')
      expect(layoutContent).toContain('<iframe')
    })

    test('[P0] 5.8-INT-006 — Old GA4 gtag.js snippet is removed', () => {
      expect(layoutContent).not.toContain('gtag/js')
      expect(layoutContent).not.toContain("gtag('config'")
      expect(layoutContent).not.toContain('PUBLIC_GA_MEASUREMENT_ID')
    })

    test('[P0] 5.8-INT-007 — No gaId variable remains', () => {
      expect(layoutContent).not.toMatch(/\bgaId\b/)
    })

    test('[P0] 5.2-INT-017 — Layout.astro has CSP meta tag', () => {
      expect(layoutContent).toContain('http-equiv="Content-Security-Policy"')
    })

    test('[P0] 5.2-INT-018 — CSP allows googletagmanager in script-src', () => {
      expect(layoutContent).toContain('https://www.googletagmanager.com')
    })

    test('[P0] 5.8-INT-008 — CSP allows googletagmanager in img-src (noscript pixel)', () => {
      const cspMatch = layoutContent.match(/content="([^"]*Content-Security-Policy[^"]*)"/)
        || layoutContent.match(/content="(default-src[^"]*)"/)
      expect(cspMatch).not.toBeNull()
      const csp = cspMatch![1]
      const imgSrc = csp.match(/img-src\s+([^;]+)/)
      expect(imgSrc).not.toBeNull()
      expect(imgSrc![1]).toContain('https://www.googletagmanager.com')
    })

    test('[P0] 5.8-INT-009 — CSP allows googletagmanager in frame-src (noscript iframe)', () => {
      const cspMatch = layoutContent.match(/content="(default-src[^"]*)"/)
      expect(cspMatch).not.toBeNull()
      const csp = cspMatch![1]
      const frameSrc = csp.match(/frame-src\s+([^;]+)/)
      expect(frameSrc).not.toBeNull()
      expect(frameSrc![1]).toContain('https://www.googletagmanager.com')
    })

    test('[P0] 5.2-INT-019 — CSP allows cdn.sanity.io in img-src', () => {
      expect(layoutContent).toContain('https://cdn.sanity.io')
    })

    test('[P0] 5.2-INT-020 — CSP allows *.sanity.io in connect-src', () => {
      expect(layoutContent).toContain('https://*.sanity.io')
    })
  })

  describe('AC4: Cloudflare Pages _headers file', () => {
    const headersPath = path.resolve(ASTRO_APP, 'public/_headers')

    test('[P0] 5.2-INT-021 — _headers file exists in public/', () => {
      expect(existsSync(headersPath)).toBe(true)
    })

    test('[P0] 5.2-INT-022 — _headers sets X-Content-Type-Options: nosniff', () => {
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain('X-Content-Type-Options: nosniff')
    })

    test('[P0] 5.2-INT-023 — _headers sets frame-ancestors CSP for Sanity Studio', () => {
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain("frame-ancestors 'self' https://*.sanity.studio https://*.sanity.io")
    })

    test('[P0] 5.2-INT-024 — _headers sets Referrer-Policy', () => {
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain('Referrer-Policy: strict-origin-when-cross-origin')
    })

    test('[P0] 5.2-INT-025 — _headers sets Permissions-Policy', () => {
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain('Permissions-Policy: camera=(), microphone=(), geolocation=()')
    })

    test('[P0] 5.2-INT-026 — _headers applies to all routes (/*)', () => {
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain('/*')
    })
  })

  describe('AC9,AC10: GitHub Actions CI workflow', () => {
    const workflowPath = path.resolve(__dirname, '../../../.github/workflows/ci.yml')
    let workflowContent: string

    beforeAll(() => {
      workflowContent = readFileSync(workflowPath, 'utf-8')
    })

    test('[P0] 5.2-INT-027 — ci.yml exists', () => {
      expect(existsSync(workflowPath)).toBe(true)
    })

    test('[P0] 5.2-INT-028 — workflow triggers on pull_request', () => {
      expect(workflowContent).toContain('pull_request:')
    })

    test('[P0] 5.2-INT-030 — workflow uses Node.js', () => {
      expect(workflowContent).toContain('node-version')
    })

    test('[P0] 5.2-INT-031 — workflow runs npm ci', () => {
      expect(workflowContent).toContain('npm ci')
    })
  })

  describe('AC5: @astrojs/node removed from dependencies', () => {
    test('[P0] 5.2-INT-038 — package.json does not have @astrojs/node', () => {
      const pkgPath = path.resolve(ASTRO_APP, 'package.json')
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      expect(pkg.dependencies['@astrojs/node']).toBeUndefined()
      expect(pkg.devDependencies?.['@astrojs/node']).toBeUndefined()
    })

    test('[P0] 5.2-INT-039 — package.json has @astrojs/cloudflare', () => {
      const pkgPath = path.resolve(ASTRO_APP, 'package.json')
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      expect(pkg.dependencies['@astrojs/cloudflare']).toBeDefined()
    })

    test('[P0] 5.2-INT-040 — package.json has wrangler as devDependency', () => {
      const pkgPath = path.resolve(ASTRO_APP, 'package.json')
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      expect(pkg.devDependencies?.wrangler).toBeDefined()
    })
  })

  describe('AC12: Build output verification', () => {
    // Build output tests require a prior build (npm run build -w astro-app).
    // These are validated in CI after the build step, not in local integration tests.
    test.skip('[P0] 5.2-INT-041 — build output dist/_headers exists', () => {
      const headersPath = path.resolve(ASTRO_APP, 'dist/_headers')
      expect(existsSync(headersPath)).toBe(true)
    })

    test.skip('[P0] 5.2-INT-042 — build output contains HTML pages', () => {
      const indexPath = path.resolve(ASTRO_APP, 'dist/index.html')
      expect(existsSync(indexPath)).toBe(true)
    })

    test.skip('[P0] 5.2-INT-043 — built HTML contains CSP meta tag', () => {
      const indexHtml = readFileSync(path.resolve(ASTRO_APP, 'dist/index.html'), 'utf-8')
      expect(indexHtml).toContain('Content-Security-Policy')
    })
  })
})

describe('Story 5-8: Migrate GA4 to GTM — astro.config.mjs', () => {
  const configPath = path.resolve(ASTRO_APP, 'astro.config.mjs')
  let configContent: string

  beforeAll(() => {
    configContent = readFileSync(configPath, 'utf-8')
  })

  test('[P0] 5.8-INT-010 — astro.config.mjs reads PUBLIC_GTM_ID env var', () => {
    expect(configContent).toContain('PUBLIC_GTM_ID')
  })

  test('[P0] 5.8-INT-011 — astro.config.mjs passes PUBLIC_GTM_ID through Vite define', () => {
    expect(configContent).toContain('"import.meta.env.PUBLIC_GTM_ID"')
  })

  test('[P0] 5.8-INT-012 — astro.config.mjs does NOT reference old PUBLIC_GA_MEASUREMENT_ID', () => {
    expect(configContent).not.toContain('PUBLIC_GA_MEASUREMENT_ID')
  })
})
