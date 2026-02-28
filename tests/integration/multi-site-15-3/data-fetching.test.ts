/**
 * Story 15-3: Multi-Site GROQ Filtering (ATDD)
 *
 * Tests that astro-app/src/lib/sanity.ts implements multi-site data fetching
 * with site-aware GROQ queries, getSiteParams() helper, and environment
 * variable–driven dataset/site selection.
 *
 * Uses file-based assertions since sanity.ts imports from the Astro virtual
 * module `sanity:client` which is not available in the Vitest test runner.
 *
 * @story 15-3
 * @phase GREEN (feature implemented)
 */
import { describe, test, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sanityTsPath = path.resolve(__dirname, '../../../astro-app/src/lib/sanity.ts')
const sanityTsContent = fs.readFileSync(sanityTsPath, 'utf-8')

describe('Story 15-3: Multi-Site GROQ Filtering (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1: getSiteParams() helper exists and returns correct shape
  // ---------------------------------------------------------------------------
  describe('AC1: getSiteParams() helper export', () => {
    test('[P1] 15.3-INT-001 — sanity.ts exports a getSiteParams function', () => {
      expect(
        sanityTsContent,
        'sanity.ts must export getSiteParams as a function',
      ).toMatch(/export\s+function\s+getSiteParams\s*\(/)
    })

    test('[P1] 15.3-INT-002 — getSiteParams returns Record<string, string> with site key', () => {
      // The function must return an object containing a `site` key
      // In multi-site mode it returns { site: SITE_ID }, otherwise { site: '' }
      expect(
        sanityTsContent,
        'getSiteParams must return object with site key for multi-site mode',
      ).toMatch(/return\s+.*\{\s*site:\s*SITE_ID\s*\}/)
      expect(
        sanityTsContent,
        'getSiteParams must return object with empty site for single-site mode',
      ).toMatch(/return\s+.*\{\s*site:\s*['"]['"]/)
    })

    test('[P1] 15.3-INT-003 — getSiteParams return type is Record<string, string>', () => {
      expect(
        sanityTsContent,
        'getSiteParams must have Record<string, string> return type',
      ).toMatch(/function\s+getSiteParams\s*\(\s*\)\s*:\s*Record<string,\s*string>/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: isMultiSite constant
  // ---------------------------------------------------------------------------
  describe('AC2: isMultiSite constant', () => {
    test('[P1] 15.3-INT-004 — sanity.ts defines isMultiSite based on DATASET', () => {
      // isMultiSite should be derived from DATASET comparison
      expect(
        sanityTsContent,
        'isMultiSite must be defined based on DATASET value',
      ).toMatch(/const\s+isMultiSite\s*=\s*DATASET\s*===/)
    })

    test('[P1] 15.3-INT-005 — isMultiSite checks for rwc dataset', () => {
      expect(
        sanityTsContent,
        'isMultiSite must check DATASET against "rwc"',
      ).toMatch(/isMultiSite\s*=\s*DATASET\s*===\s*['"]rwc['"]/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: All GROQ query strings include site filter pattern
  // ---------------------------------------------------------------------------
  describe('AC3: GROQ queries include site filter pattern', () => {
    const siteFilterPattern = '($site == "" || site == $site)'

    // All content-type queries that should have the site filter
    const queriesWithSiteFilter = [
      'ALL_PAGE_SLUGS_QUERY',
      'ALL_SPONSORS_QUERY',
      'ALL_SPONSOR_SLUGS_QUERY',
      'SPONSOR_BY_SLUG_QUERY',
      'ALL_PROJECTS_QUERY',
      'ALL_PROJECT_SLUGS_QUERY',
      'PROJECT_BY_SLUG_QUERY',
      'ALL_TESTIMONIALS_QUERY',
      'ALL_EVENTS_QUERY',
      'EVENTS_BY_MONTH_QUERY',
      'ALL_EVENT_SLUGS_QUERY',
      'EVENT_BY_SLUG_QUERY',
      'PAGE_BY_SLUG_QUERY',
    ]

    test('[P1] 15.3-INT-006 — all content GROQ queries include the site filter pattern', () => {
      for (const queryName of queriesWithSiteFilter) {
        // Extract the query definition block for this specific query
        const queryRegex = new RegExp(
          `export\\s+const\\s+${queryName}\\s*=\\s*defineQuery\\(groq\`([\\s\\S]*?)\`\\)`,
        )
        const match = sanityTsContent.match(queryRegex)
        expect(match, `${queryName} must be defined with defineQuery(groq\`...\`)`).toBeTruthy()

        const queryBody = match![1]
        expect(
          queryBody,
          `${queryName} must include site filter pattern: ${siteFilterPattern}`,
        ).toContain('$site == "" || site == $site')
      }
    })

    test('[P1] 15.3-INT-007 — SITE_SETTINGS_QUERY uses $siteSettingsId parameter instead of site filter', () => {
      // Site settings uses a different approach: ID-based lookup via getSiteSettingsId()
      const settingsQueryRegex =
        /export\s+const\s+SITE_SETTINGS_QUERY\s*=\s*defineQuery\(groq`([\s\S]*?)`\)/
      const match = sanityTsContent.match(settingsQueryRegex)
      expect(match, 'SITE_SETTINGS_QUERY must be defined').toBeTruthy()

      const queryBody = match![1]
      expect(
        queryBody,
        'SITE_SETTINGS_QUERY must use $siteSettingsId parameter',
      ).toContain('$siteSettingsId')
    })

    test('[P1] 15.3-INT-008 — getSiteSettingsId function exists and uses isMultiSite', () => {
      // getSiteSettingsId should return different IDs based on isMultiSite
      expect(
        sanityTsContent,
        'getSiteSettingsId function must exist',
      ).toMatch(/function\s+getSiteSettingsId\s*\(/)
      expect(
        sanityTsContent,
        'getSiteSettingsId must reference isMultiSite',
      ).toMatch(/getSiteSettingsId[\s\S]*?isMultiSite/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Data fetching functions pass site params
  // ---------------------------------------------------------------------------
  describe('AC4: Data fetching functions pass site params', () => {
    const fetchFunctionsWithGetSiteParams = [
      'getAllSponsors',
      'getAllProjects',
      'getAllTestimonials',
      'getAllEvents',
    ]

    test('[P1] 15.3-INT-009 — collection fetch functions pass getSiteParams() in params', () => {
      for (const fnName of fetchFunctionsWithGetSiteParams) {
        // Find the function body and verify it calls getSiteParams()
        const fnRegex = new RegExp(
          `export\\s+async\\s+function\\s+${fnName}\\b[\\s\\S]*?(?=export\\s|$)`,
        )
        const match = sanityTsContent.match(fnRegex)
        expect(match, `${fnName} must be exported`).toBeTruthy()

        const fnBody = match![0]
        expect(
          fnBody,
          `${fnName} must pass getSiteParams() in query params`,
        ).toContain('getSiteParams()')
      }
    })

    const slugFetchFunctions = [
      'getSponsorBySlug',
      'getProjectBySlug',
      'getEventBySlug',
    ]

    test('[P1] 15.3-INT-010 — slug-based fetch functions spread getSiteParams() into params', () => {
      for (const fnName of slugFetchFunctions) {
        const fnRegex = new RegExp(
          `export\\s+async\\s+function\\s+${fnName}\\b[\\s\\S]*?(?=export\\s|$)`,
        )
        const match = sanityTsContent.match(fnRegex)
        expect(match, `${fnName} must be exported`).toBeTruthy()

        const fnBody = match![0]
        // These functions should spread getSiteParams() alongside slug
        expect(
          fnBody,
          `${fnName} must spread getSiteParams() into params alongside slug`,
        ).toMatch(/params:\s*\{[^}]*slug[^}]*\.\.\.getSiteParams\(\)|params:\s*\{[^}]*\.\.\.getSiteParams\(\)[^}]*slug/)
      }
    })

    test('[P1] 15.3-INT-011 — getPage passes getSiteParams() in params', () => {
      const fnRegex =
        /export\s+async\s+function\s+getPage\b[\s\S]*?(?=export\s|$)/
      const match = sanityTsContent.match(fnRegex)
      expect(match, 'getPage must be exported').toBeTruthy()

      const fnBody = match![0]
      expect(
        fnBody,
        'getPage must spread getSiteParams() into params',
      ).toContain('...getSiteParams()')
    })

    test('[P1] 15.3-INT-012 — prefetchPages passes getSiteParams() in params', () => {
      const fnRegex =
        /export\s+async\s+function\s+prefetchPages\b[\s\S]*?(?=export\s|$)/
      const match = sanityTsContent.match(fnRegex)
      expect(match, 'prefetchPages must be exported').toBeTruthy()

      const fnBody = match![0]
      expect(
        fnBody,
        'prefetchPages must spread getSiteParams() into params',
      ).toContain('...getSiteParams()')
    })

    test('[P1] 15.3-INT-013 — getSiteSettings passes getSiteSettingsId() as param', () => {
      const fnRegex =
        /export\s+async\s+function\s+getSiteSettings\b[\s\S]*?(?=export\s|$)/
      const match = sanityTsContent.match(fnRegex)
      expect(match, 'getSiteSettings must be exported').toBeTruthy()

      const fnBody = match![0]
      expect(
        fnBody,
        'getSiteSettings must pass getSiteSettingsId() in params',
      ).toContain('getSiteSettingsId()')
    })
  })

  // ---------------------------------------------------------------------------
  // AC5: Environment variable usage for DATASET and SITE_ID
  // ---------------------------------------------------------------------------
  describe('AC5: Environment variable usage', () => {
    test('[P1] 15.3-INT-014 — DATASET is derived from PUBLIC_SANITY_DATASET env var', () => {
      expect(
        sanityTsContent,
        'DATASET must read from import.meta.env.PUBLIC_SANITY_DATASET',
      ).toMatch(/const\s+DATASET\s*=\s*import\.meta\.env\.PUBLIC_SANITY_DATASET/)
    })

    test('[P1] 15.3-INT-015 — DATASET has a default fallback value', () => {
      // DATASET should default to 'production' when env var is not set
      expect(
        sanityTsContent,
        'DATASET must have a fallback default value',
      ).toMatch(/PUBLIC_SANITY_DATASET\s*\|\|\s*['"]production['"]/)
    })

    test('[P1] 15.3-INT-016 — SITE_ID is derived from PUBLIC_SITE_ID env var', () => {
      expect(
        sanityTsContent,
        'SITE_ID must read from import.meta.env.PUBLIC_SITE_ID',
      ).toMatch(/const\s+SITE_ID\s*=\s*import\.meta\.env\.PUBLIC_SITE_ID/)
    })

    test('[P1] 15.3-INT-017 — SITE_ID has a default fallback value', () => {
      // SITE_ID should default to a known value when env var is not set
      expect(
        sanityTsContent,
        'SITE_ID must have a fallback default value',
      ).toMatch(/PUBLIC_SITE_ID\s*\|\|\s*['"]/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC6: All queries use defineQuery wrapper
  // ---------------------------------------------------------------------------
  describe('AC6: All GROQ queries use defineQuery', () => {
    test('[P1] 15.3-INT-018 — all exported GROQ query constants use defineQuery()', () => {
      // Find all exported query constants
      const exportedQueries = sanityTsContent.matchAll(
        /export\s+const\s+(\w+_QUERY)\s*=/g,
      )
      const queryNames = [...exportedQueries].map(m => m[1])

      expect(
        queryNames.length,
        'Must have at least 10 exported GROQ query constants',
      ).toBeGreaterThanOrEqual(10)

      for (const name of queryNames) {
        const defRegex = new RegExp(
          `export\\s+const\\s+${name}\\s*=\\s*defineQuery\\(`,
        )
        expect(
          sanityTsContent,
          `${name} must use defineQuery() wrapper`,
        ).toMatch(defRegex)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC7: Sub-queries also include site filter
  // ---------------------------------------------------------------------------
  describe('AC7: Nested sub-queries include site filter', () => {
    test('[P1] 15.3-INT-019 — SPONSOR_BY_SLUG_QUERY sub-query for projects includes site filter', () => {
      // The sponsor detail query has a nested sub-query for related projects
      const queryRegex =
        /export\s+const\s+SPONSOR_BY_SLUG_QUERY\s*=\s*defineQuery\(groq`([\s\S]*?)`\)/
      const match = sanityTsContent.match(queryRegex)
      expect(match, 'SPONSOR_BY_SLUG_QUERY must exist').toBeTruthy()

      const queryBody = match![1]
      // The sub-query for projects should also include the site filter
      const subQueryMatch = queryBody.match(
        /\*\[_type\s*==\s*"project"[\s\S]*?\]/,
      )
      expect(subQueryMatch, 'Must have a project sub-query').toBeTruthy()
      expect(
        subQueryMatch![0],
        'Project sub-query must include site filter',
      ).toContain('$site == "" || site == $site')
    })

    test('[P1] 15.3-INT-020 — PROJECT_BY_SLUG_QUERY sub-query for testimonials includes site filter', () => {
      // The project detail query has a nested sub-query for related testimonials
      const queryRegex =
        /export\s+const\s+PROJECT_BY_SLUG_QUERY\s*=\s*defineQuery\(groq`([\s\S]*?)`\)/
      const match = sanityTsContent.match(queryRegex)
      expect(match, 'PROJECT_BY_SLUG_QUERY must exist').toBeTruthy()

      const queryBody = match![1]
      // The sub-query for testimonials should also include the site filter
      const subQueryMatch = queryBody.match(
        /\*\[_type\s*==\s*"testimonial"[\s\S]*?\]/,
      )
      expect(subQueryMatch, 'Must have a testimonial sub-query').toBeTruthy()
      expect(
        subQueryMatch![0],
        'Testimonial sub-query must include site filter',
      ).toContain('$site == "" || site == $site')
    })
  })
})
