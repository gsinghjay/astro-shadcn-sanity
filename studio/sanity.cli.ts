/**
 * Sanity CLI Configuration
 * This file configures the Sanity CLI tool with project-specific settings
 * and customizes the Vite bundler configuration.
 * Learn more: https://www.sanity.io/docs/cli
 */

import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '<your project ID>'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost: process.env.SANITY_STUDIO_STUDIO_HOST || '', // Visit https://www.sanity.io/docs/environment-variables to learn more about using environment variables for local & production.
  deployment: {
    appId: 'zi1cig2o607y1js5cfoyird6',
    autoUpdates: true,
  },
  typegen: {
    path: '../astro-app/src/**/*.{ts,tsx,js,jsx}',
    schema: 'schema.json',
    generates: '../astro-app/src/sanity.types.ts',
  },
})
