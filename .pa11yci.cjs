const fs = require('node:fs');
const path = require('node:path');

const DIST = path.resolve(__dirname, 'astro-app/dist');
const BASE_URL = process.env.SITE_HEALTH_BASE_URL || 'http://localhost:4321';

function walkIndexHtml(dir, rel = '') {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const relChild = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...walkIndexHtml(abs, relChild));
    } else if (entry.isFile() && entry.name === 'index.html') {
      results.push(rel ? `${rel}/index.html` : 'index.html');
    }
  }
  return results;
}

const urls = walkIndexHtml(DIST)
  .filter((p) => p.startsWith('demo/'))
  .map((p) => `${BASE_URL}/${p.replace(/index\.html$/, '')}`);

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 60000,
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  urls: urls.length > 0 ? urls : [`${BASE_URL}/demo/`],
};
