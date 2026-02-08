import AxeBuilder from '@axe-core/playwright'
import { type Page, expect } from '@playwright/test'

/**
 * Run an axe-core WCAG 2.1 AA accessibility audit on the current page.
 * Fails the test if any violations are found, with detailed output.
 */
export async function expectAccessible(page: Page, options?: { disableRules?: string[] }) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])

  if (options?.disableRules?.length) {
    builder.disableRules(options.disableRules)
  }

  const results = await builder.analyze()

  const violations = results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.length,
    targets: v.nodes.slice(0, 3).map((n) => n.target.join(' > ')),
  }))

  expect(violations, `Accessibility violations found:\n${JSON.stringify(violations, null, 2)}`).toHaveLength(0)
}
