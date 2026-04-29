const path = require('node:path');
const { getSitemapUrls } = require('./scripts/sitemap-urls.cjs');

const DIST = path.resolve(__dirname, 'astro-app/dist');
const BASE_URL = process.env.SITE_HEALTH_BASE_URL || 'http://localhost:4321';
const MAX_URLS = Number(process.env.LHCI_MAX_URLS) || 50;

const urls = getSitemapUrls({ baseUrl: BASE_URL, distDir: DIST, maxUrls: MAX_URLS });

module.exports = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.89 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
