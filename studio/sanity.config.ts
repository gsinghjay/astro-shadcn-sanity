import {defineConfig, type WorkspaceOptions, type PluginOptions} from 'sanity'
import {structureTool, type StructureResolver} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {RocketIcon, EarthAmericasIcon, EarthGlobeIcon} from '@sanity/icons'
import {formSchema} from '@sanity/form-toolkit/form-schema'
import {media} from 'sanity-plugin-media'
import {createWorkspaceSchemaTypes} from './src/schemaTypes/workspace-utils'
import {capstoneDeskStructure} from './src/structure/capstone-desk-structure'
import {createRwcDeskStructure} from './src/structure/rwc-desk-structure'
import {createResolve} from './src/presentation/resolve'
import {
  CAPSTONE_SINGLETON_TYPES,
  LISTING_PAGE_ROUTES,
  SITE_AWARE_TYPES,
} from './src/constants'
// Capstone-only — depends on `sponsorAgreement` document type, which RWC datasets do not ship.
import {sponsorAcceptancesTool} from './src/tools/SponsorAcceptancesTool'

// Environment variables for project configuration. Fail fast on missing
// SANITY_STUDIO_PROJECT_ID — a placeholder fallback silently breaks every
// Studio request and is impossible to diagnose from the resulting 404s.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId) {
  throw new Error(
    'SANITY_STUDIO_PROJECT_ID is required — set it in studio/.env or your deploy environment.',
  )
}

interface CommonPluginsOptions {
  structure: StructureResolver
  previewOrigin: string
  resolve: ReturnType<typeof createResolve>
}

/**
 * Shared plugin set for every workspace. Capstone and RWC differ only in
 * `structure`, `previewOrigin`, and Presentation `resolve` — every other
 * plugin is identical, so changes (e.g. adding a new studio plugin) only
 * need to land here.
 */
function commonPlugins(opts: CommonPluginsOptions): PluginOptions[] {
  return [
    structureTool({structure: opts.structure}),
    presentationTool({
      resolve: opts.resolve,
      previewUrl: {
        origin: opts.previewOrigin,
        preview: '/',
      },
    }),
    visionTool(),
    media(),
    formSchema({}),
  ]
}

interface RwcWorkspaceOptions {
  name: string
  title: string
  basePath: string
  icon: typeof EarthAmericasIcon
  siteId: string
  projectId: string
  originEnv: string | undefined
  defaultOrigin: string
}

function createRwcWorkspace(opts: RwcWorkspaceOptions): WorkspaceOptions {
  return {
    name: opts.name,
    title: opts.title,
    basePath: opts.basePath,
    icon: opts.icon,
    projectId: opts.projectId,
    dataset: 'rwc',
    plugins: commonPlugins({
      structure: createRwcDeskStructure(opts.siteId, opts.title),
      previewOrigin: opts.originEnv || opts.defaultOrigin,
      resolve: createResolve(opts.siteId),
    }),
    schema: {
      types: createWorkspaceSchemaTypes('rwc'),
      templates: (prev) => {
        const filtered = prev.filter(
          (t) =>
            !SITE_AWARE_TYPES.includes(t.schemaType) &&
            t.schemaType !== 'siteSettings' &&
            t.schemaType !== 'listingPage' &&
            t.schemaType !== 'portalPage' &&
            t.schemaType !== 'sponsorAgreement',
        )
        const siteTemplates = SITE_AWARE_TYPES.map((type) => ({
          id: `${type}-${opts.siteId}`,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} (${opts.title})`,
          schemaType: type,
          value: {site: opts.siteId},
        }))
        // Listing page singletons — pre-populate route for each (Story 21.0)
        const listingTemplates = LISTING_PAGE_ROUTES.map((route) => ({
          id: `listingPage-${route}-${opts.siteId}`,
          title: `Listing Page (${route.charAt(0).toUpperCase() + route.slice(1)}) — ${opts.title}`,
          schemaType: 'listingPage',
          value: {route},
        }))
        // portalPage and sponsorAgreement are capstone-only — no RWC templates emitted.
        return [...filtered, ...siteTemplates, ...listingTemplates]
      },
    },
    document: {
      actions: (input, context) => {
        if (
          context.schemaType === 'siteSettings' ||
          context.schemaType === 'listingPage' ||
          context.schemaType === 'portalPage' ||
          context.schemaType === 'sponsorAgreement' ||
          context.documentId === `siteSettings-${opts.siteId}`
        ) {
          return input.filter(
            ({action}) =>
              action &&
              ['publish', 'discardChanges', 'restore'].includes(action),
          )
        }
        return input
      },
      newDocumentOptions: (prev) =>
        prev.filter(
          (t) =>
            t.templateId !== 'siteSettings' &&
            t.templateId !== 'submission' &&
            t.templateId !== 'listingPage' &&
            t.templateId !== 'portalPage' &&
            t.templateId !== 'sponsorAgreement',
        ),
    },
  }
}

export default defineConfig([
  // ─── Capstone Workspace ───────────────────────────────────
  {
    name: 'capstone',
    title: 'Capstone Sponsors',
    basePath: '/capstone',
    icon: RocketIcon,
    projectId,
    dataset: 'production',
    plugins: commonPlugins({
      structure: capstoneDeskStructure,
      previewOrigin:
        process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4321',
      resolve: createResolve(undefined),
    }),
    tools: (prev) => [...prev, sponsorAcceptancesTool()],
    schema: {
      types: createWorkspaceSchemaTypes('production'),
      templates: (prev) => {
        const filtered = prev.filter(
          (t) => !CAPSTONE_SINGLETON_TYPES.has(t.schemaType),
        )
        return [
          ...filtered,
          // Listing page singletons — pre-populate route for each (Story 21.0)
          ...LISTING_PAGE_ROUTES.map((route) => ({
            id: `listingPage-${route}`,
            schemaType: 'listingPage',
            title: `Listing Page (${route.charAt(0).toUpperCase() + route.slice(1)})`,
            value: {route},
          })),
          // Portal page singletons (Story 22.9)
          {id: 'portalPage-dashboard', schemaType: 'portalPage', title: 'Portal Page (Dashboard)', value: {route: 'dashboard'}},
          {id: 'portalPage-events', schemaType: 'portalPage', title: 'Portal Page (Events)', value: {route: 'events'}},
          {id: 'portalPage-progress', schemaType: 'portalPage', title: 'Portal Page (Progress)', value: {route: 'progress'}},
          {id: 'portalPage-agreement', schemaType: 'portalPage', title: 'Portal Page (Agreement)', value: {route: 'agreement'}},
          {id: 'portalPage-form', schemaType: 'portalPage', title: 'Portal Page (Form)', value: {route: 'form'}},
          {id: 'portalPage-login', schemaType: 'portalPage', title: 'Portal Page (Login)', value: {route: 'login'}},
          {id: 'portalPage-denied', schemaType: 'portalPage', title: 'Portal Page (Denied)', value: {route: 'denied'}},
          // Sponsor Agreement singleton (one per workspace)
          {id: 'sponsorAgreement', schemaType: 'sponsorAgreement', title: 'Sponsor Agreement', value: {}},
        ]
      },
    },
    document: {
      actions: (input, context) =>
        CAPSTONE_SINGLETON_TYPES.has(context.schemaType)
          ? input.filter(
              ({action}) =>
                action &&
                ['publish', 'discardChanges', 'restore'].includes(action),
            )
          : input,
      newDocumentOptions: (prev) =>
        prev.filter(
          (templateItem) =>
            !CAPSTONE_SINGLETON_TYPES.has(templateItem.templateId),
        ),
    },
  },

  // ─── RWC US Workspace ──────────────────────────────────────
  createRwcWorkspace({
    name: 'rwc-us',
    title: 'RWC US',
    basePath: '/rwc-us',
    icon: EarthAmericasIcon,
    siteId: 'rwc-us',
    projectId,
    originEnv: process.env.SANITY_STUDIO_RWC_US_PREVIEW_ORIGIN,
    defaultOrigin: 'http://localhost:4322',
  }),

  // ─── RWC International Workspace ─────────────────────────
  createRwcWorkspace({
    name: 'rwc-intl',
    title: 'RWC International',
    basePath: '/rwc-intl',
    icon: EarthGlobeIcon,
    siteId: 'rwc-intl',
    projectId,
    originEnv: process.env.SANITY_STUDIO_RWC_INTL_PREVIEW_ORIGIN,
    defaultOrigin: 'http://localhost:4323',
  }),
])
