import {defineConfig, type WorkspaceOptions} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {RocketIcon, EarthAmericasIcon, EarthGlobeIcon} from '@sanity/icons'
import {formSchema} from '@sanity/form-toolkit/form-schema'
import {media} from 'sanity-plugin-media'
import {createSchemaTypesForWorkspace} from './src/schemaTypes/workspace-utils'
import {capstoneDeskStructure} from './src/structure/capstone-desk-structure'
import {createRwcDeskStructure} from './src/structure/rwc-desk-structure'
import {resolve} from './src/presentation/resolve'
import {
  CAPSTONE_SINGLETON_TYPES,
  SITE_AWARE_TYPES,
} from './src/constants'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '<your project ID>'

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
    plugins: [
      structureTool({structure: createRwcDeskStructure(opts.siteId, opts.title)}),
      presentationTool({
        resolve,
        previewUrl: {
          origin: opts.originEnv || opts.defaultOrigin,
          preview: '/',
        },
      }),
      visionTool(),
      media(),
      formSchema({}),
    ],
    schema: {
      types: createSchemaTypesForWorkspace('rwc'),
      templates: (prev) => {
        const filtered = prev.filter(
          (t) =>
            !SITE_AWARE_TYPES.includes(t.schemaType) &&
            t.schemaType !== 'siteSettings' &&
            t.schemaType !== 'listingPage',
        )
        const siteTemplates = SITE_AWARE_TYPES.map((type) => ({
          id: `${type}-${opts.siteId}`,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} (${opts.title})`,
          schemaType: type,
          value: {site: opts.siteId},
        }))
        // Listing page singletons — pre-populate route for each (Story 21.0)
        const listingTemplates = ['articles', 'authors', 'events', 'projects', 'sponsors'].map((route) => ({
          id: `listingPage-${route}-${opts.siteId}`,
          title: `Listing Page (${route.charAt(0).toUpperCase() + route.slice(1)}) — ${opts.title}`,
          schemaType: 'listingPage',
          value: {route},
        }))
        return [...filtered, ...siteTemplates, ...listingTemplates]
      },
    },
    document: {
      actions: (input, context) => {
        if (
          context.schemaType === 'siteSettings' ||
          context.schemaType === 'listingPage' ||
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
            t.templateId !== 'listingPage',
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
    plugins: [
      structureTool({structure: capstoneDeskStructure}),
      presentationTool({
        resolve,
        previewUrl: {
          origin:
            process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
            'http://localhost:4321',
          preview: '/',
        },
      }),
      visionTool(),
      media(),
      formSchema({}),
    ],
    schema: {
      types: createSchemaTypesForWorkspace('production'),
      templates: (prev) => {
        const filtered = prev.filter(
          (t) => !CAPSTONE_SINGLETON_TYPES.has(t.schemaType),
        )
        return [
          ...filtered,
          // Listing page singletons — pre-populate route for each (Story 21.0)
          {id: 'listingPage-articles', schemaType: 'listingPage', title: 'Listing Page (Articles)', value: {route: 'articles'}},
          {id: 'listingPage-authors', schemaType: 'listingPage', title: 'Listing Page (Authors)', value: {route: 'authors'}},
          {id: 'listingPage-events', schemaType: 'listingPage', title: 'Listing Page (Events)', value: {route: 'events'}},
          {id: 'listingPage-projects', schemaType: 'listingPage', title: 'Listing Page (Projects)', value: {route: 'projects'}},
          {id: 'listingPage-sponsors', schemaType: 'listingPage', title: 'Listing Page (Sponsors)', value: {route: 'sponsors'}},
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
