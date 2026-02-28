import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {RocketIcon, EarthGlobeIcon} from '@sanity/icons'
import {formSchema} from '@sanity/form-toolkit/form-schema'
import {createSchemaTypesForWorkspace} from './src/schemaTypes/workspace-utils'
import {capstoneDeskStructure} from './src/structure/capstone-desk-structure'
import {rwcDeskStructure} from './src/structure/rwc-desk-structure'
import {resolve} from './src/presentation/resolve'
import {
  CAPSTONE_SINGLETON_TYPES,
  SITE_AWARE_TYPES,
  RWC_SITES,
  RWC_SINGLETON_IDS,
} from './src/constants'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '<your project ID>'

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
      formSchema(),
    ],
    schema: {
      types: createSchemaTypesForWorkspace('production'),
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

  // ─── RWC Workspace ────────────────────────────────────────
  {
    name: 'rwc',
    title: 'RWC Programs',
    basePath: '/rwc',
    icon: EarthGlobeIcon,
    projectId,
    dataset: 'rwc',
    plugins: [
      structureTool({structure: rwcDeskStructure}),
      presentationTool({
        resolve,
        previewUrl: {
          origin:
            process.env.SANITY_STUDIO_RWC_PREVIEW_ORIGIN ||
            'http://localhost:4322',
          preview: '/',
        },
      }),
      visionTool(),
      formSchema(),
    ],
    schema: {
      types: createSchemaTypesForWorkspace('rwc'),
      templates: (prev) => {
        // Remove default templates for site-aware types + siteSettings
        const filtered = prev.filter(
          (t) =>
            !SITE_AWARE_TYPES.includes(t.schemaType) &&
            t.schemaType !== 'siteSettings',
        )
        // Add site-specific templates (page-rwc-us, page-rwc-intl, etc.)
        const siteTemplates = RWC_SITES.flatMap(({id: siteId, title: siteTitle}) =>
          SITE_AWARE_TYPES.map((type) => ({
            id: `${type}-${siteId}`,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} (${siteTitle})`,
            schemaType: type,
            value: {site: siteId},
          })),
        )
        return [...filtered, ...siteTemplates]
      },
    },
    document: {
      actions: (input, context) => {
        // Guard RWC siteSettings singletons by fixed document ID
        if (RWC_SINGLETON_IDS.includes(context.documentId || '')) {
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
            t.templateId !== 'siteSettings' && t.templateId !== 'submission',
        ),
    },
  },
])
