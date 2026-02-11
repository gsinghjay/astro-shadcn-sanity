import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {CogIcon} from '@sanity/icons'
import {schemaTypes} from './src/schemaTypes'
import {resolve} from './src/presentation/resolve'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Singleton document types — only one instance allowed
const singletonTypes = new Set(['siteSettings'])

export default defineConfig({
  name: 'sanity-template-astro-clean',
  title: 'Sanity Astro Starter',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singleton: Site Settings (fixed document ID)
            S.listItem()
              .title('Site Settings')
              .icon(CogIcon)
              .id('siteSettings')
              .child(
                S.document().schemaType('siteSettings').documentId('siteSettings'),
              ),
            S.divider(),
            // All other document types (excluding singletons)
            ...S.documentTypeListItems().filter(
              (listItem) => !singletonTypes.has(listItem.getId()!),
            ),
          ]),
    }),
    presentationTool({
      resolve,
      previewUrl: {
        origin:
          process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4321',
        preview: '/',
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Restrict actions on singleton types to prevent delete/duplicate
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(
            ({action}) =>
              action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : input,
    // Prevent creating new documents for singleton types
    newDocumentOptions: (prev) =>
      prev.filter((templateItem) => !singletonTypes.has(templateItem.templateId)),
  },
})
