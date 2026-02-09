import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

test.describe('Story 5-2: GA4, Security Headers & Cloudflare Deploy', () => {
  test.describe('AC5: Cloudflare adapter configuration', () => {
    const configPath = path.resolve(ASTRO_APP, 'astro.config.mjs')
    let configContent: string

    test.beforeAll(() => {
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

    test('[P0] 5.2-INT-004 — output is explicitly set to static', () => {
      expect(configContent).toMatch(/output:\s*["']static["']/)
    })

    test('[P0] 5.2-INT-005 — site property reads PUBLIC_SITE_URL env var', () => {
      expect(configContent).toContain('PUBLIC_SITE_URL')
      expect(configContent).toMatch(/site:\s*PUBLIC_SITE_URL/)
    })
  })

  test.describe('AC7: Wrangler configuration', () => {
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

  test.describe('AC8: Deploy script in package.json', () => {
    test('[P0] 5.2-INT-010 — package.json has deploy script with wrangler pages deploy', () => {
      const pkgPath = path.resolve(ASTRO_APP, 'package.json')
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      expect(pkg.scripts.deploy).toBeDefined()
      expect(pkg.scripts.deploy).toContain('wrangler pages deploy')
    })
  })

  test.describe('AC2: GA4 environment variable', () => {
    test('[P0] 5.2-INT-011 — .env.example has PUBLIC_GA_MEASUREMENT_ID placeholder', () => {
      const envExample = readFileSync(path.resolve(ASTRO_APP, '.env.example'), 'utf-8')
      expect(envExample).toContain('PUBLIC_GA_MEASUREMENT_ID')
    })

    test('[P0] 5.2-INT-012 — .env.example has PUBLIC_SITE_URL placeholder', () => {
      const envExample = readFileSync(path.resolve(ASTRO_APP, '.env.example'), 'utf-8')
      expect(envExample).toContain('PUBLIC_SITE_URL')
    })
  })

  test.describe('AC1,AC3: Layout.astro GA4 + CSP', () => {
    const layoutPath = path.resolve(ASTRO_APP, 'src/layouts/Layout.astro')
    let layoutContent: string

    test.beforeAll(() => {
      layoutContent = readFileSync(layoutPath, 'utf-8')
    })

    test('[P0] 5.2-INT-013 — Layout.astro reads PUBLIC_GA_MEASUREMENT_ID from env', () => {
      expect(layoutContent).toContain('import.meta.env.PUBLIC_GA_MEASUREMENT_ID')
    })

    test('[P0] 5.2-INT-014 — Layout.astro includes GA4 async script with googletagmanager', () => {
      expect(layoutContent).toContain('https://www.googletagmanager.com/gtag/js')
      expect(layoutContent).toContain('async')
    })

    test('[P0] 5.2-INT-015 — GA4 script is conditionally rendered (only when gaId is set)', () => {
      expect(layoutContent).toMatch(/gaId\s*&&/)
    })

    test('[P0] 5.2-INT-016 — GA4 uses define:vars to pass measurement ID', () => {
      expect(layoutContent).toContain('define:vars={{ gaId }}')
    })

    test('[P0] 5.2-INT-017 — Layout.astro has CSP meta tag', () => {
      expect(layoutContent).toContain('http-equiv="Content-Security-Policy"')
    })

    test('[P0] 5.2-INT-018 — CSP allows googletagmanager and google-analytics in script-src', () => {
      expect(layoutContent).toContain('https://www.googletagmanager.com')
      expect(layoutContent).toContain('https://www.google-analytics.com')
    })

    test('[P0] 5.2-INT-019 — CSP allows cdn.sanity.io in img-src', () => {
      expect(layoutContent).toContain('https://cdn.sanity.io')
    })

    test('[P0] 5.2-INT-020 — CSP allows *.sanity.io in connect-src', () => {
      expect(layoutContent).toContain('https://*.sanity.io')
    })
  })

  test.describe('AC4: Cloudflare Pages _headers file', () => {
    const headersPath = path.resolve(ASTRO_APP, 'public/_headers')

    test('[P0] 5.2-INT-021 — _headers file exists in public/', () => {
      expect(existsSync(headersPath)).toBe(true)
    })

    test('[P0] 5.2-INT-022 — _headers sets X-Content-Type-Options: nosniff', () => {
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain('X-Content-Type-Options: nosniff')
    })

    test('[P0] 5.2-INT-023 — _headers sets X-Frame-Options: DENY', () => {
      const content = readFileSync(headersPath, 'utf-8')
      expect(content).toContain('X-Frame-Options: DENY')
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

  test.describe('AC9,AC10: GitHub Actions deploy workflow', () => {
    const workflowPath = path.resolve(__dirname, '../../../.github/workflows/deploy.yml')
    let workflowContent: string

    test.beforeAll(() => {
      workflowContent = readFileSync(workflowPath, 'utf-8')
    })

    test('[P0] 5.2-INT-027 — deploy.yml exists', () => {
      expect(existsSync(workflowPath)).toBe(true)
    })

    test('[P0] 5.2-INT-028 — workflow triggers on push to main', () => {
      expect(workflowContent).toContain('push:')
      expect(workflowContent).toContain('branches: [main]')
    })

    test('[P0] 5.2-INT-029 — workflow triggers on workflow_dispatch', () => {
      expect(workflowContent).toContain('workflow_dispatch')
    })

    test('[P0] 5.2-INT-030 — workflow uses Node.js 22', () => {
      expect(workflowContent).toContain('node-version: 22')
    })

    test('[P0] 5.2-INT-031 — workflow runs npm ci', () => {
      expect(workflowContent).toContain('npm ci')
    })

    test('[P0] 5.2-INT-032 — workflow builds astro-app workspace', () => {
      expect(workflowContent).toContain('npm run build --workspace=astro-app')
    })

    test('[P0] 5.2-INT-033 — workflow deploys with wrangler pages deploy', () => {
      expect(workflowContent).toContain('wrangler pages deploy')
      expect(workflowContent).toContain('--project-name=ywcc-capstone')
    })

    test('[P0] 5.2-INT-034 — workflow uses CLOUDFLARE_API_TOKEN secret', () => {
      expect(workflowContent).toContain('CLOUDFLARE_API_TOKEN')
    })

    test('[P0] 5.2-INT-035 — workflow uses CLOUDFLARE_ACCOUNT_ID secret', () => {
      expect(workflowContent).toContain('CLOUDFLARE_ACCOUNT_ID')
    })

    test('[P0] 5.2-INT-036 — workflow passes SANITY_API_READ_TOKEN for build', () => {
      expect(workflowContent).toContain('SANITY_API_READ_TOKEN')
    })

    test('[P0] 5.2-INT-037 — workflow passes all PUBLIC_ env vars for build', () => {
      expect(workflowContent).toContain('PUBLIC_SANITY_STUDIO_PROJECT_ID')
      expect(workflowContent).toContain('PUBLIC_SANITY_STUDIO_DATASET')
      expect(workflowContent).toContain('PUBLIC_GA_MEASUREMENT_ID')
      expect(workflowContent).toContain('PUBLIC_SITE_URL')
    })
  })

  test.describe('AC5: @astrojs/node removed from dependencies', () => {
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

  test.describe('AC12: Build output verification', () => {
    test('[P0] 5.2-INT-041 — build output dist/_headers exists', () => {
      const headersPath = path.resolve(ASTRO_APP, 'dist/_headers')
      expect(existsSync(headersPath)).toBe(true)
    })

    test('[P0] 5.2-INT-042 — build output contains HTML pages', () => {
      const indexPath = path.resolve(ASTRO_APP, 'dist/index.html')
      expect(existsSync(indexPath)).toBe(true)
    })

    test('[P0] 5.2-INT-043 — built HTML contains CSP meta tag', () => {
      const indexHtml = readFileSync(path.resolve(ASTRO_APP, 'dist/index.html'), 'utf-8')
      expect(indexHtml).toContain('Content-Security-Policy')
    })
  })
})
