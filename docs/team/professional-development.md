---
title: Professional Development Guide
description: What you gain from contributing to this project, and how to present it on your resume and LinkedIn
---

# Professional Development Guide

This document explains what you gain from contributing to the YWCC Capstone Sponsors platform and gives you ready-to-use templates for your LinkedIn profile and resume.

## Table of Contents

- [Why This Project Matters for Your Career](#why-this-project-matters-for-your-career)
- [What You Will Build](#what-you-will-build)
- [Skills You Will Develop](#skills-you-will-develop)
- [Technologies on Your Resume](#technologies-on-your-resume)
- [Resume Bullet Points](#resume-bullet-points)
- [LinkedIn Template](#linkedin-template)

---

## Why This Project Matters for Your Career

Most student projects use a framework tutorial as a starting point and never leave localhost. This one is different. You are building a **production-grade, CMS-driven static website** using the same architecture, tooling, and engineering standards that professional teams use at companies shipping real products.

Here is what sets this apart:

- **Modern JAMstack architecture** — Astro and Sanity are used individually by companies like Nike, Figma, Cloudflare, and Burger King for their web properties. The SSG + headless CMS pattern you learn here is the same architecture that powers production marketing sites across the industry.
- **Zero-cost production hosting** — The architecture runs entirely on free tiers (GitHub Pages, Sanity free plan, Cloudflare free plan). You learn how to ship without burning money.
- **Performance engineering** — The project targets Lighthouse 95+ across all four categories. Once deployed and audited, that becomes a measurable, verifiable claim you put on a resume.
- **Accessibility compliance** — You build to WCAG 2.1 AA standards with enforced alt text, keyboard navigation, ARIA patterns, and screen reader support. Accessibility skills are in high demand and most junior developers lack them.
- **TypeScript-first codebase** — Every file is TypeScript in strict mode. No `any`, no shortcuts.
- **Component-driven development** — You work with a real UI component library (fulldev/ui), Storybook for isolated development, and a block composition system that mirrors how design systems work in industry.
- **Headless CMS content modeling** — You design schemas, write GROQ queries, and understand the content-as-data paradigm that powers modern content platforms.
- **Monorepo workflow** — You work in a multi-workspace project with npm workspaces, concurrent dev servers, and workspace-scoped dependencies. This is how teams structure real projects.

**The bottom line:** When an interviewer asks "tell me about a project you've worked on," you have a real answer with real technologies, real architectural decisions, and real performance numbers.

## What You Will Build

Your contributions span the entire stack. Here is the scope of work across the project:

### Content Modeling (Sanity Studio)

- **Document schemas** for pages, sponsors, projects, teams, and events using `defineType` and `defineField`
- **Block schemas** using the custom `defineBlock` helper that enforces shared base fields (spacing, background, max width)
- **Validation rules** — required fields, string length limits, unique slugs, alt text enforcement
- **Reference relationships** — sponsors linked to projects linked to teams, with GROQ reference expansion
- **Singleton documents** — site settings with custom Studio structure preventing duplicate creation

### Component Development (Astro Frontend)

- **Block components** — 12+ reusable content blocks (Hero Banner, Feature Grid, CTA Banner, Stats Row, FAQ Section, Timeline, and more)
- **UI primitives** — composing from fulldev/ui's accessible component library (buttons, cards, accordions, inputs, badges)
- **BlockRenderer** — the dispatch layer that maps Sanity `_type` values to Astro components
- **Page templates** — Default, Full Width, Landing, Sidebar, and Two Column layouts
- **Responsive design** — mobile-first Tailwind utilities with CSS-first v4 configuration

### Data Integration

- **GROQ queries** — build-time data fetching with field projections and reference expansion
- **Dynamic routing** — `[...slug].astro` catch-all route with `getStaticPaths()` for page generation
- **Type-safe data flow** — TypeScript interfaces matching Sanity schema structures

### Quality Engineering

- **Playwright integration tests** — schema validation, document type verification, module import tests
- **Storybook stories** — isolated component development and visual documentation
- **Lighthouse audits** — performance, accessibility, best practices, and SEO scoring
- **Core Web Vitals** — FCP, LCP, TBT, and CLS within professional thresholds

### Deployment and CI/CD

- **GitHub Actions** — automated build, test, and deploy pipelines
- **Static site deployment** — GitHub Pages (current) and Cloudflare Pages (future)
- **Sanity Studio deployment** — hosted Studio instance for content editors

## Skills You Will Develop

### Technical Skills

| Skill | What You Learn |
|-------|---------------|
| Static Site Generation | Build-time rendering, zero-JS runtime, file-based routing |
| Headless CMS | Content modeling, schema design, GROQ queries, reference resolution |
| Component Architecture | Block system, UI primitives, composition patterns, props and slots |
| CSS Engineering | Tailwind v4 CSS-first config, design tokens, custom properties, responsive design |
| TypeScript | Strict mode, typed props, interface patterns, path aliases |
| Accessibility | WCAG 2.1 AA, ARIA patterns, keyboard navigation, semantic HTML, screen readers |
| Performance | Lighthouse optimization, Core Web Vitals, JS/CSS budgets, image optimization |
| Testing | Playwright integration tests, schema validation, build verification |
| Version Control | Monorepo workflow, feature branches, npm workspaces |
| CI/CD | GitHub Actions pipelines, automated builds, static deployments |

### Professional Skills

- **Reading and working in an existing codebase** — you do not start from scratch; you learn to navigate, understand, and extend what is already there
- **Following architectural constraints** — the project has 78 documented rules covering code style, patterns, and anti-patterns; you learn to work within a system
- **Writing for maintainability** — your code is reviewed, tested, and expected to work alongside other contributors' code
- **Content modeling** — thinking about data structures from both the developer and content editor perspective
- **Cross-functional collaboration** — working on a team with defined stories, acceptance criteria, and sprint workflows

## Technologies on Your Resume

When listing technologies, use these exact names and versions. Interviewers and ATS systems recognize them:

**Languages:** TypeScript, HTML, CSS, GROQ

**Frameworks & Libraries:** Astro 5, Sanity.io, Tailwind CSS v4, fulldev/ui (shadcn), Storybook 10, Playwright

**Tools & Platforms:** Node.js 24, Vite 7, npm Workspaces, GitHub Actions, GitHub Pages, Cloudflare Pages

**Standards & Practices:** WCAG 2.1 AA, Core Web Vitals, Lighthouse CI, Static Site Generation (SSG), JAMstack, Headless CMS Architecture

## Resume Bullet Points

Pick the bullets that match your specific contributions. Adjust the numbers if the project grows beyond these targets.

### For a "Projects" section

- Built a production CMS-driven static website using Astro 5, Sanity.io, and Tailwind CSS v4, targeting Lighthouse 95+ across performance, accessibility, best practices, and SEO
- Developed 12+ reusable content block components with TypeScript strict mode, enabling non-technical editors to compose pages through drag-and-drop in Sanity Studio
- Designed content model schemas with validation rules, cross-document references, and GROQ build-time queries, eliminating all runtime API calls
- Implemented WCAG 2.1 AA accessibility standards including keyboard navigation, ARIA patterns, enforced alt text, and semantic HTML across all components
- Maintained Core Web Vitals within professional thresholds (FCP <1s, LCP <2s, CLS <0.05) with a total JS payload under 5KB
- Created Playwright integration test suite validating schema infrastructure across 175+ test cases in 14 test files
- Architected block composition system mapping Sanity schema types to Astro components through a centralized BlockRenderer dispatch pattern

### For a "Work Experience" or "Capstone" section

- Contributed to a 7-person engineering team building a modular, CMS-driven platform for NJIT's Ying Wu College of Computing Industry Capstone program
- Delivered features across the full stack: Sanity CMS schemas, Astro frontend components, GROQ data queries, Playwright tests, and Storybook documentation
- Followed a structured sprint workflow with story-level acceptance criteria, ATDD checklists, and code review processes
- Operated within a monorepo (npm workspaces) containing a frontend workspace and a CMS workspace with separate dependency trees and concurrent dev servers

## LinkedIn Template

Copy the text below and paste it into a new LinkedIn **Experience** or **Project** entry. Replace the placeholder sections with your specific contributions.

> **Paste tip:** LinkedIn's rich text editor may reformat line breaks. After pasting, review the formatting and adjust spacing as needed.

---

### Experience Entry

**Title:** Full-Stack Web Developer (Capstone Project)

**Company:** NJIT Ying Wu College of Computing

**Description:**

```text
Built a production-grade, CMS-driven static website for the YWCC Industry
Capstone program using Astro 5, Sanity.io headless CMS, Tailwind CSS v4,
and TypeScript in strict mode. The platform enables non-technical content
editors to compose pages by stacking reusable UI blocks in Sanity Studio
with zero code required.

Key contributions:
- Developed reusable content block components (Hero, Feature Grid, CTA,
  FAQ, Timeline, and more) composing from an accessible UI primitive
  library (fulldev/ui)
- Designed Sanity CMS document schemas with validation rules, reference
  relationships, and GROQ build-time queries
- Targeted Lighthouse 95+ across Performance, Accessibility, Best
  Practices, and SEO with a total JavaScript payload under 5KB
- Implemented WCAG 2.1 AA accessibility: keyboard navigation, ARIA
  patterns, screen reader support, and enforced alt text
- Wrote Playwright integration tests for schema validation and
  component verification
- Worked in a monorepo (npm workspaces) with CI/CD via GitHub Actions

Tech stack: Astro 5, Sanity.io, Tailwind CSS v4, TypeScript, GROQ,
fulldev/ui, Storybook 10, Playwright, Vite 7, Node.js 24, GitHub Actions
```

---

### Project Entry (shorter format)

**Project Name:** YWCC Capstone Sponsors Platform

**Description:**

```text
CMS-driven static website for NJIT's Industry Capstone program. Built
with Astro 5 + Sanity.io headless CMS + Tailwind CSS v4. Content editors
compose pages by stacking reusable UI blocks — no code required.

Targets Lighthouse 95+ all categories. WCAG 2.1 AA accessible. <5KB
total JS. Zero runtime API calls. $0/month hosting cost.

Stack: Astro, Sanity.io, TypeScript, Tailwind v4, GROQ, Storybook,
Playwright, GitHub Actions
```

---

### LinkedIn Skills to Add

Add these to your LinkedIn **Skills** section. They are searchable by recruiters:

- Astro (Web Framework)
- Sanity.io
- Tailwind CSS
- TypeScript
- Static Site Generation (SSG)
- Headless CMS
- Web Accessibility (WCAG)
- Storybook
- Playwright
- GitHub Actions
- Component-Driven Development
- JAMstack
- Web Performance Optimization
- ARIA
- Responsive Web Design

---

### Personalization Tips

- **Replace generic bullets with your specific work.** "Developed the heroBanner and featureGrid block components" is stronger than "Developed block components."
- **Include numbers where you can.** "12 block types," "175+ integration tests," "Lighthouse 95+," "<5KB JS" — these are concrete and verifiable.
- **Mention the team.** "Contributed to a 7-person engineering team" signals you work well with others.
- **Link to the live site** once it is deployed. A working URL turns your project entry from a claim into proof.
- **Link to the Storybook** if it is publicly deployed. It shows your component work visually.
