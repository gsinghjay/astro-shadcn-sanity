const fs = require('node:fs');
const path = require('node:path');

const LOC_RE = /<loc>([^<]+)<\/loc>/g;

function extractLocs(xml) {
  const out = [];
  let m;
  LOC_RE.lastIndex = 0;
  while ((m = LOC_RE.exec(xml)) !== null) {
    out.push(m[1].trim());
  }
  return out;
}

function readSitemap(absPath) {
  try {
    return fs.readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }
}

function detectProductionBase(urls) {
  if (urls.length === 0) return '';
  try {
    const u = new URL(urls[0]);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

function rebase(prodUrl, prodBase, baseUrl) {
  if (!prodBase || !prodUrl.startsWith(prodBase)) return prodUrl;
  return baseUrl.replace(/\/$/, '') + prodUrl.slice(prodBase.length);
}

function getSitemapUrls({ baseUrl, distDir, maxUrls } = {}) {
  const safeBase = (baseUrl || 'http://localhost:4321').replace(/\/$/, '');
  const fallback = [`${safeBase}/`];

  if (!distDir) return fallback;

  const indexXml = readSitemap(path.join(distDir, 'sitemap-index.xml'));
  if (!indexXml) return fallback;

  const childRefs = extractLocs(indexXml);
  if (childRefs.length === 0) return fallback;

  const prodBase = detectProductionBase(childRefs);

  const allLocs = [];
  for (const childRef of childRefs) {
    let childPath;
    if (prodBase && childRef.startsWith(prodBase)) {
      childPath = childRef.slice(prodBase.length).replace(/^\//, '');
    } else {
      childPath = childRef.replace(/^\//, '');
    }
    const childAbs = path.join(distDir, childPath);
    const childXml = readSitemap(childAbs);
    if (!childXml) continue;
    allLocs.push(...extractLocs(childXml));
  }

  if (allLocs.length === 0) return fallback;

  const rebased = allLocs.map((u) => rebase(u, prodBase, safeBase));
  const deduped = Array.from(new Set(rebased)).sort();
  const cap = Number.isFinite(maxUrls) && maxUrls > 0 ? maxUrls : deduped.length;
  return deduped.slice(0, cap);
}

module.exports = { getSitemapUrls, extractLocs, detectProductionBase, rebase };
