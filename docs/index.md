# YWCC Capstone Project Documentation

> Auto-generated documentation index for the astro-shadcn-sanity monorepo.
> Last updated: 2026-02-20

## Project Overview

- **Name:** ywcc-capstone-template v1.7.0
- **Type:** Monorepo (npm workspaces) with 2 parts
- **Primary Language:** TypeScript
- **Architecture:** Static-first SSG with selective SSR, page builder pattern

### Quick Reference

#### Astro Frontend (`astro-app/`)

- **Framework:** Astro 5.17 + React 19.2
- **Styling:** Tailwind CSS 4.1 (CSS-first) + shadcn-astro
- **Output:** Static site (Cloudflare Pages) with SSR portal
- **Components:** 508 total (13 custom blocks, 101 UI blocks, 39 UI primitives)

#### Sanity Studio (`studio/`)

- **Framework:** Sanity Studio v5.10
- **Schema:** 27 types (6 documents, 8 objects, 13 blocks)
- **Content:** 40 user documents in production dataset
- **Features:** Visual editing, presentation tool, TypeGen

## Generated Documentation

| Document | Description | Size |
|----------|-------------|------|
| [Project Overview](./project-overview.md) | Executive summary, purpose, tech stack, key features | 9 KB |
| [Architecture](./architecture.md) | System design, patterns, rendering strategy, security, testing | 19 KB |
| [Source Tree Analysis](./source-tree-analysis.md) | Annotated directory tree, entry points, critical file locations | 32 KB |
| [Component Inventory](./component-inventory.md) | Full catalog of 508 components by category, block system architecture | 11 KB |
| [Data Models](./data-models.md) | Sanity schema types, fields, GROQ queries, TypeGen pipeline | 23 KB |
| [Development Guide](./development-guide.md) | Setup, commands, workflows, testing, CI/CD, troubleshooting | 13 KB |
| [Integration Architecture](./integration-architecture.md) | Content delivery, visual editing, TypeGen, CI/CD, webhook flows | 18 KB |

## Existing Documentation

| Document | Description |
|----------|-------------|
| [Cloudflare Guide](./cloudflare-guide.md) | Consolidated Cloudflare deployment, Workers, and configuration guide |
| [Capstone Status Report](./capstone-status-report.md) | Project status and milestone tracking |
| [VPS Migration Plan](./vps-migration-plan.md) | Migration planning documentation |

## Scan Data

| File | Description |
|------|-------------|
| [Project Scan Report](./project-scan-report.json) | Machine-readable exhaustive scan results (2026-02-20) |

## Getting Started

1. Read the [Project Overview](./project-overview.md) for context and purpose
2. Follow the [Development Guide](./development-guide.md) to set up your environment
3. Review the [Architecture](./architecture.md) to understand system design
4. Check the [Source Tree Analysis](./source-tree-analysis.md) to find specific files
5. Reference [Data Models](./data-models.md) when working with Sanity content
6. See [Component Inventory](./component-inventory.md) when building UI
7. Consult [Integration Architecture](./integration-architecture.md) for cross-system flows

## For AI Agents

When working on this codebase, load documents in this priority order:

1. **Always:** [Architecture](./architecture.md) + [Data Models](./data-models.md)
2. **For UI work:** Add [Component Inventory](./component-inventory.md)
3. **For content/schema work:** Add [Data Models](./data-models.md) + [Integration Architecture](./integration-architecture.md)
4. **For DevOps/CI:** Add [Development Guide](./development-guide.md) + [Integration Architecture](./integration-architecture.md)
5. **For new contributors:** Start with [Project Overview](./project-overview.md) + [Development Guide](./development-guide.md)
