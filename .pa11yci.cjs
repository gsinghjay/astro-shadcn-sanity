const path = require('node:path');
const { getSitemapUrls } = require('./scripts/sitemap-urls.cjs');

const DIST = path.resolve(__dirname, 'astro-app/dist');
const BASE_URL = process.env.SITE_HEALTH_BASE_URL || 'http://localhost:4321';
const MAX_URLS = Number(process.env.PA11Y_MAX_URLS) || 50;

const urls = getSitemapUrls({ baseUrl: BASE_URL, distDir: DIST, maxUrls: MAX_URLS });

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 60000,
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  urls,
};
