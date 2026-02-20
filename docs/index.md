# YWCC Capstone Sponsors — Documentation Index

**Generated:** 2026-02-13 | **Mode:** Exhaustive Rescan | **Workflow:** document-project v1.2.0

## Project Overview

- **Type:** Monorepo (npm workspaces) with 2 parts
- **Primary Language:** TypeScript
- **Architecture:** Block-based page composition (Static Site + Headless CMS)
- **Version:** 1.4.0 (2026-02-12)

## Quick Reference

### astro-app (Web Frontend)
- **Type:** Static Site Generator
- **Tech Stack:** Astro 5.17, React 19.2, Tailwind CSS 4.1, fulldev/ui, Storybook 10
- **Root:** `./astro-app/`
- **Entry:** `src/pages/index.astro`, `src/pages/[...slug].astro`

### studio (Sanity CMS Studio)
- **Type:** Headless CMS Admin
- **Tech Stack:** Sanity v5.9, React 19, styled-components 6
- **Root:** `./studio/`
- **Entry:** `sanity.config.ts`

## Generated Documentation

- [Project Overview](./project-overview.md) — Executive summary, tech stack, goals, project scale
- [Architecture](./architecture.md) — System design, block lifecycle, data model, design system, testing, CI/CD
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory tree, entry points, critical folders
- [Component Inventory](./component-inventory.md) — 507 components cataloged (11 custom blocks, ~100 variants, ~39 UI primitives)
- [Data Models](./data-models.md) — Sanity schemas: 3 documents, 11 blocks, 8 objects, GROQ queries, TypeGen
- [Development Guide](./development-guide.md) — Setup, commands, testing, git workflow, deployment, adding blocks
- [Integration Architecture](./integration-architecture.md) — 5 integration points, data flow diagrams, containerized dev

## Existing Documentation

### Root
- [README.md](../README.md) — Primary project documentation with tech stack, structure, and guides
- [CHANGELOG.md](../CHANGELOG.md) — Auto-generated changelog (semantic-release)

### docs/
- [Project Context](./project-context.md) — Technology stack and framework rules reference
- [Template Layout System](./template-layout-system.md) — Template system design document
- [Storybook Constitution](./storybook-constitution.md) — Best practices for Storybook in Astro + Tailwind v4
- [Server Islands Cost Analysis](./server-islands-cost-analysis.md) — Server islands analysis

### docs/team/
- [Onboarding Guide](./team/onboarding-guide.md) — New team member setup and contribution guide
- [Git Workflow Guide](./team/git-workflow-guide.md) — Branch strategy and PR process
- [GitHub Issues & Projects Guide](./team/github-issues-and-projects-guide.md) — Issue tracking and project management
- [Professional Development](./team/professional-development.md) — Resume and LinkedIn presentation guide
- [Cloudflare Guide](./cloudflare-guide.md) — Pages deployment, Access auth, free tier limits, monitoring
- [Docker Dev Setup](./team/docker-dev-setup.md) — Containerized development environment
- [Storybook-Figma Integration](./team/storybook-figma-integration-guide.md) — Design-to-code integration
- [fulldev/ui to Sanity Conversion Guide](./team/fulldev-ui-to-sanity-conversion-guide.md) — Step-by-step block conversion
- [How Preview & Publish Works](./team/how-preview-and-publish-works.md) — Content publishing pipeline
- [Stega Clean & Visual Editing](./team/stega-clean-and-visual-editing-explained.md) — Visual editing internals
- [Server Islands Explained](./team/server-islands-explained.md) — Server islands architecture
- [GROQ Webhooks Explained](./team/groq-webhooks-explained.md) — Webhook-based content deploy
- [Contact Form Pipeline](./team/contact-form-pipeline-explained.md) — Form submission architecture

### docs/code-review/
- [Sanity Code Review (Feb 10 #1)](./code-review/sanity-code-review_20260210_01.md)
- [Sanity Code Review (Feb 10 #2)](./code-review/sanity-code-review_20260210_02.md)
- [Sanity Code Review (Feb 10 #3)](./code-review/sanity-code-review_20260210_175957.md)
- [Content Modeling Review (Feb 11)](./code-review/content-modeling-review_20260211_052554.md)

### Tests
- [Test README](../tests/README.md) — Playwright test framework documentation

### Planning Artifacts (_bmad-output/)
- [PRD](../_bmad-output/planning-artifacts/prd.md) — Product requirements document
- [Architecture](../_bmad-output/planning-artifacts/architecture.md) — Architecture planning document
- [Epics](../_bmad-output/planning-artifacts/epics.md) — Epic planning and story definitions
- 40+ implementation stories in `_bmad-output/implementation-artifacts/`
- 10+ test artifacts in `_bmad-output/test-artifacts/`

## Getting Started

1. **New to the project?** Start with [Project Overview](./project-overview.md) for the big picture
2. **Setting up development?** Follow the [Development Guide](./development-guide.md)
3. **Understanding the codebase?** Read [Architecture](./architecture.md) and [Source Tree Analysis](./source-tree-analysis.md)
4. **Working with components?** Check the [Component Inventory](./component-inventory.md)
5. **Working with CMS data?** Review [Data Models](./data-models.md)
6. **Understanding integrations?** See [Integration Architecture](./integration-architecture.md)
7. **Adding a new block?** Follow the checklist in the [Development Guide](./development-guide.md#adding-a-new-block)
8. **Joining the team?** Start with [Onboarding Guide](./team/onboarding-guide.md)
