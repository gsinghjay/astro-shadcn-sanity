import {defineField} from 'sanity'

/**
 * Reusable site field for multi-site content filtering.
 * Hidden on `production` dataset (capstone editors never see it).
 * Required on `rwc` dataset via validation callback.
 */
export const siteField = defineField({
  name: 'site',
  title: 'Site',
  type: 'string',
  description: 'Which RWC site this content belongs to',
  options: {
    list: [
      {title: 'RWC US', value: 'rwc-us'},
      {title: 'RWC International', value: 'rwc-intl'},
    ],
    layout: 'radio',
  },
  hidden: ({document}) => {
    // process.env.SANITY_STUDIO_DATASET is statically replaced at build time.
    // Defaults to 'production' when not set, keeping the field hidden for capstone editors.
    // Story 15.2 may refine this to runtime detection for multi-workspace support.
    const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
    return dataset === 'production'
  },
  validation: (Rule) =>
    Rule.custom((value, context) => {
      const {dataset} = context.getClient({apiVersion: '2024-01-01'}).config()
      if (dataset === 'rwc' && !value) {
        return 'Site is required for RWC content'
      }
      return true
    }),
})
