const fs = require('node:fs');
const path = require('node:path');

const DIST = path.resolve(__dirname, 'astro-app/dist');

// Path-prefix exclusions — mirror the sitemap + robots.txt noindex list.
const EXCLUDED_PREFIXES = ['portal/', 'auth/', 'student/', 'demo/'];

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
  .filter((p) => !EXCLUDED_PREFIXES.some((prefix) => p.startsWith(prefix)))
  .map((p) => `http://localhost/${p}`);

module.exports = {
  ci: {
    collect: {
      staticDistDir: DIST,
      url: urls.length > 0 ? urls : ['http://localhost/index.html'],
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
