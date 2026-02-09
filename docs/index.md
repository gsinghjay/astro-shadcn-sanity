# YWCC Capstone Sponsors — Documentation Index

**Generated:** 2026-02-09 | **Mode:** Exhaustive Scan | **Workflow:** document-project v1.2.0

## Project Overview

- **Type:** Monorepo (npm workspaces) with 2 parts
- **Primary Language:** TypeScript
- **Architecture:** Block-based page composition (Static Site + Headless CMS)

## Quick Reference

### astro-app (Web Frontend)
- **Type:** Static Site Generator
- **Tech Stack:** Astro 5.x, Tailwind CSS v4, fulldev/ui, Storybook 10
- **Root:** `./astro-app/`
- **Entry:** `src/pages/index.astro`, `src/pages/[...slug].astro`

### studio (Sanity CMS Studio)
- **Type:** Headless CMS Admin
- **Tech Stack:** Sanity v5, React 19, styled-components
- **Root:** `./studio/`
- **Entry:** `sanity.config.ts`

## Generated Documentation

- [Project Overview](./project-overview.md) — Executive summary, tech stack, goals
- [Architecture](./architecture.md) — System design, patterns, data flow, design system
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory tree, entry points
- [Component Inventory](./component-inventory.md) — 375+ components cataloged (13 custom blocks, 102 pre-built, 251 UI primitives)
- [Data Models](./data-models.md) — Sanity schemas: 3 documents, 4 objects, 11 blocks, GROQ queries
- [Development Guide](./development-guide.md) — Setup, commands, testing, conventions, deployment
- [Integration Architecture](./integration-architecture.md) — Part communication, visual editing, CI/CD

## Existing Documentation

### Root
- [README.md](../README.md) — Primary project documentation with tech stack, structure, and guides

### docs/
- [Project Context](./project-context.md) — Technology stack and framework rules reference
- [Storybook Constitution](./storybook-constitution.md) — Best practices for Storybook in Astro + Tailwind v4
- [Storybook-Astro-GitHub Context](./storybook-astro-github-context.md) — Integration context
- [Storybook Astro](./storybook-astro.md) — Framework documentation for Astro components
- [Template Layout System](./template-layout-system.md) — Template system design document

### docs/team/
- [Onboarding Guide](./team/onboarding-guide.md) — New team member setup and contribution guide
- [Professional Development](./team/professional-development.md) — Resume and LinkedIn presentation guide
- [Remaining Sanity Block Conversions](./team/remaining-sanity-block-conversions.md) — 7 blocks needing Sanity conversion
- [Fulldev UI Block Conversion Guide](./team/fulldev-ui-block-conversion-guide.md) — Step-by-step conversion how-to

### docs/capstone/
- [Software Development Plan](./capstone/software-development-plan.md) — Project plan
- [Scope Document](./capstone/scope-document.md) — Project scope and requirements
- [Startup Business Plan](./capstone/startup-business-plan.md) — Business plan document

### Tests
- [Test README](../tests/README.md) — Playwright test framework documentation
- [Test CLAUDE.md](../tests/CLAUDE.md) — Testing rules for AI development

### Planning Artifacts (_bmad-output/)
- [PRD](../_bmad-output/planning-artifacts/prd.md) — Product requirements document
- [Architecture](../_bmad-output/planning-artifacts/architecture.md) — Architecture planning document
- [UX Documentation](../_bmad-output/planning-artifacts/ux-documentation.md) — UX design specifications
- [Epics](../_bmad-output/planning-artifacts/epics.md) — Epic planning and story definitions
- 22 implementation stories and 7 test checklists in `_bmad-output/`

## Getting Started

1. **New to the project?** Start with [Project Overview](./project-overview.md) for the big picture
2. **Setting up development?** Follow the [Development Guide](./development-guide.md)
3. **Understanding the codebase?** Read [Architecture](./architecture.md) and [Source Tree Analysis](./source-tree-analysis.md)
4. **Working with components?** Check the [Component Inventory](./component-inventory.md)
5. **Working with CMS data?** Review [Data Models](./data-models.md)
6. **Understanding integrations?** See [Integration Architecture](./integration-architecture.md)
7. **Adding a new block?** Follow the checklist in the [Development Guide](./development-guide.md#adding-components)
8. **Joining the team?** Start with [Onboarding Guide](./team/onboarding-guide.md)
