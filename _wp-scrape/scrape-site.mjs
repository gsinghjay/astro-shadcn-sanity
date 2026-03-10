#!/usr/bin/env node
/**
 * WordPress Site Scraper using Playwright
 *
 * Usage:
 *   node scrape-site.mjs <site-url> [output-dir]
 *
 * Examples:
 *   node scrape-site.mjs https://real-world-connections.com/
 *   node scrape-site.mjs https://some-other-site.com/ other-site
 *
 * Output:
 *   <output-dir>/scraped-content.md   - Structured markdown
 *   <output-dir>/images/              - Downloaded images
 *   <output-dir>/screenshots/         - Full-page screenshots
 */

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { URL } from 'url';
import https from 'https';
import http from 'http';

// --- Configuration ---
const SITE_URL = process.argv[2] || 'https://real-world-connections.com/';
const OUTPUT_DIR_NAME = process.argv[3] || new URL(SITE_URL).hostname.replace(/^www\./, '').replace(/\./g, '-');
const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const OUTPUT_DIR = path.join(SCRIPT_DIR, OUTPUT_DIR_NAME);
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 30000;

// --- Helpers ---

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function isSameSite(href, baseUrl) {
  try {
    const u = new URL(href, baseUrl);
    const base = new URL(baseUrl);
    // Treat WordPress.com subdomain as same site (e.g. hs673.wordpress.com)
    const baseDomain = base.hostname.replace(/^www\./, '');
    const linkDomain = u.hostname.replace(/^www\./, '');
    if (linkDomain === baseDomain) return true;
    // WordPress.com sites may use a subdomain that redirects
    if (linkDomain.endsWith('.wordpress.com')) return true;
    return false;
  } catch {
    return false;
  }
}

function normalizeUrl(href, baseUrl) {
  try {
    const u = new URL(href, baseUrl);
    // Strip hash, trailing slash normalization, query params
    u.hash = '';
    u.search = '';
    let p = u.pathname.replace(/\/+$/, '') || '/';
    // Normalize to path-only key so both domains deduplicate
    return p;
  } catch {
    return null;
  }
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const request = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        writeFile(destPath, buffer).then(() => resolve(buffer.length)).catch(reject);
      });
      response.on('error', reject);
    });
    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

function fileExtFromUrl(url) {
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp', '.avif'].includes(ext)) return ext;
    return '.png'; // default
  } catch {
    return '.png';
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

// --- Main Scraper ---

async function scrapeSite() {
  console.log(`\n🔍 Scraping: ${SITE_URL}`);
  console.log(`📁 Output:   ${OUTPUT_DIR}\n`);

  await mkdir(IMAGES_DIR, { recursive: true });
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT);

  // Step 1: Discover pages from homepage navigation
  console.log('📋 Discovering pages...');
  await page.goto(SITE_URL, { waitUntil: 'networkidle' });

  // Get all nav links + any other internal links
  const discoveredLinks = await page.evaluate((siteUrl) => {
    const links = new Set();
    // Nav links
    document.querySelectorAll('nav a[href], header a[href]').forEach((a) => {
      if (a.href && !a.href.startsWith('mailto:') && !a.href.startsWith('tel:')) {
        links.add(a.href);
      }
    });
    // Also grab links from the main content that point internally
    document.querySelectorAll('main a[href], .entry-content a[href], article a[href], section a[href]').forEach((a) => {
      if (a.href && !a.href.startsWith('mailto:') && !a.href.startsWith('tel:')) {
        links.add(a.href);
      }
    });
    return [...links];
  }, SITE_URL);

  // Filter to same-site, dedupe, exclude external forms
  const pagesToScrape = new Map();
  pagesToScrape.set(normalizeUrl(SITE_URL, SITE_URL), { label: 'Home', url: SITE_URL });

  for (const href of discoveredLinks) {
    if (!isSameSite(href, SITE_URL)) continue;
    if (href.includes('formsite.com')) continue;
    const norm = normalizeUrl(href, SITE_URL);
    if (!norm) continue;

    // Rewrite URL to use custom domain for consistency
    const visitUrl = new URL(SITE_URL);
    visitUrl.pathname = norm === '/' ? '/' : norm;
    const resolvedUrl = visitUrl.toString();

    if (!pagesToScrape.has(norm)) {
      // Derive label from path
      const u = new URL(href);
      const pathLabel = u.pathname
        .replace(/^\/|\/$/g, '')
        .split('/')
        .pop()
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Home';
      pagesToScrape.set(norm, { label: pathLabel, url: resolvedUrl });
    }
  }

  console.log(`Found ${pagesToScrape.size} pages to scrape:\n`);
  for (const [, info] of pagesToScrape) {
    console.log(`  • ${info.label}: ${info.url}`);
  }

  // Step 2: Extract site-wide data from homepage
  console.log('\n📊 Extracting site-wide data...');
  await page.goto(SITE_URL, { waitUntil: 'networkidle' });

  const siteWideData = await page.evaluate(() => {
    const data = {};

    // Navigation
    const navLinks = [];
    document.querySelectorAll('nav a[href]').forEach((a) => {
      const label = a.textContent.trim();
      const url = a.getAttribute('href');
      if (label && url && !url.startsWith('#')) {
        navLinks.push({ label, url });
      }
    });
    data.navigation = navLinks;

    // Site title
    const siteTitle = document.querySelector('.wp-block-site-title a, .site-title a, header a')?.textContent?.trim() || document.title;
    data.siteTitle = siteTitle;

    // Footer content
    const footer = document.querySelector('footer, [role="contentinfo"]');
    if (footer) {
      data.footerText = footer.innerText.trim().slice(0, 500);
    }

    // Social links
    const socialLinks = [];
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.href;
      const platforms = ['twitter.com', 'x.com', 'linkedin.com', 'facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'github.com'];
      for (const p of platforms) {
        if (href.includes(p)) {
          socialLinks.push({ platform: p.replace('.com', '').replace('x', 'Twitter/X'), url: href });
          break;
        }
      }
    });
    data.socialLinks = [...new Map(socialLinks.map((s) => [s.url, s])).values()];

    // Colors from CSS custom properties
    const computedStyle = getComputedStyle(document.documentElement);
    const colorProps = ['--wp--preset--color--primary', '--wp--preset--color--secondary', '--wp--preset--color--background', '--wp--preset--color--foreground'];
    const colors = {};
    for (const prop of colorProps) {
      const val = computedStyle.getPropertyValue(prop).trim();
      if (val) colors[prop.replace('--wp--preset--color--', '')] = val;
    }
    data.colors = colors;

    // Try to detect font
    const bodyFont = computedStyle.getPropertyValue('font-family').trim();
    data.fontFamily = bodyFont;

    return data;
  });

  // Step 3: Scrape each page
  const allPages = [];
  const allImages = new Map(); // url -> { filename, size, source }

  for (const [normUrl, pageInfo] of pagesToScrape) {
    console.log(`\n📄 Scraping: ${pageInfo.label} (${pageInfo.url})`);

    try {
      const response = await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
      if (!response || response.status() >= 400) {
        console.log(`  ⚠️  HTTP ${response?.status()} — skipping`);
        continue;
      }

      // Wait for content to settle
      await page.waitForTimeout(1500);

      // Take full-page screenshot
      const screenshotName = `${slugify(pageInfo.label)}.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  📸 Screenshot: ${screenshotName}`);

      // Extract page content
      const pageData = await page.evaluate(() => {
        const data = {};

        // Page title
        data.title = document.title;
        data.url = window.location.pathname;

        // Main heading
        const h1 = document.querySelector('h1');
        data.h1 = h1?.innerText?.trim() || '';

        // All headings for structure
        const headings = [];
        document.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
          headings.push({
            level: parseInt(h.tagName[1]),
            text: h.innerText.trim(),
          });
        });
        data.headings = headings;

        // Main content - try various WordPress content containers
        const contentEl =
          document.querySelector('.entry-content') ||
          document.querySelector('main') ||
          document.querySelector('[role="main"]') ||
          document.querySelector('article') ||
          document.querySelector('.wp-site-blocks');

        if (contentEl) {
          // Extract structured content sections
          const sections = [];
          let currentSection = { heading: '', content: [] };

          for (const node of contentEl.querySelectorAll('h2, h3, h4, p, ul, ol, figure, blockquote, table, .wp-block-columns, .wp-block-group, .wp-block-cover, .wp-block-media-text, .wp-block-image')) {
            const tag = node.tagName.toLowerCase();

            if (['h2', 'h3', 'h4'].includes(tag)) {
              if (currentSection.heading || currentSection.content.length) {
                sections.push({ ...currentSection });
              }
              currentSection = { heading: `${'#'.repeat(parseInt(tag[1]))} ${node.innerText.trim()}`, content: [] };
            } else if (tag === 'p') {
              const text = node.innerText.trim();
              if (text) currentSection.content.push(text);
            } else if (tag === 'ul' || tag === 'ol') {
              const items = [];
              node.querySelectorAll('li').forEach((li) => {
                const text = li.innerText.trim();
                if (text) items.push(text);
              });
              if (items.length) currentSection.content.push({ type: 'list', ordered: tag === 'ol', items });
            } else if (tag === 'blockquote') {
              currentSection.content.push({ type: 'quote', text: node.innerText.trim() });
            } else if (tag === 'table') {
              const rows = [];
              node.querySelectorAll('tr').forEach((tr) => {
                const cells = [];
                tr.querySelectorAll('td, th').forEach((cell) => cells.push(cell.innerText.trim()));
                if (cells.length) rows.push(cells);
              });
              if (rows.length) currentSection.content.push({ type: 'table', rows });
            } else if (tag === 'figure' || node.classList.contains('wp-block-image')) {
              const img = node.querySelector('img');
              const caption = node.querySelector('figcaption')?.innerText?.trim() || '';
              if (img?.src) {
                currentSection.content.push({ type: 'image', src: img.src, alt: img.alt || '', caption });
              }
            }
          }
          if (currentSection.heading || currentSection.content.length) {
            sections.push(currentSection);
          }
          data.sections = sections;

          // Raw text fallback
          data.rawText = contentEl.innerText.trim().slice(0, 5000);
        }

        // All images on page
        const images = [];
        document.querySelectorAll('img[src]').forEach((img) => {
          const src = img.src;
          if (src && !src.startsWith('data:') && !src.includes('gravatar') && !src.includes('wp-admin')) {
            images.push({
              src,
              alt: img.alt || '',
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
            });
          }
        });
        data.images = images;

        // Forms
        const forms = [];
        document.querySelectorAll('form').forEach((form) => {
          const fields = [];
          form.querySelectorAll('input, textarea, select').forEach((input) => {
            if (input.type === 'hidden' || input.type === 'submit') return;
            fields.push({
              name: input.name || input.id || '',
              type: input.type || input.tagName.toLowerCase(),
              required: input.required,
              placeholder: input.placeholder || '',
            });
          });
          if (fields.length) forms.push({ action: form.action, method: form.method, fields });
        });
        data.forms = forms;

        // Iframes (embedded content)
        const iframes = [];
        document.querySelectorAll('iframe[src]').forEach((iframe) => {
          iframes.push({
            src: iframe.src,
            title: iframe.title || '',
            width: iframe.width,
            height: iframe.height,
          });
        });
        data.iframes = iframes;

        // Links on this page
        const links = [];
        (contentEl || document).querySelectorAll('a[href]').forEach((a) => {
          const text = a.innerText.trim();
          const href = a.getAttribute('href');
          if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            links.push({ text, href });
          }
        });
        data.links = links;

        return data;
      });

      // Download images from this page
      for (const img of pageData.images || []) {
        if (allImages.has(img.src)) continue;
        try {
          const ext = fileExtFromUrl(img.src);
          // Build descriptive filename: try alt text, then URL filename, then counter
          let imgLabel = img.alt;
          if (!imgLabel || imgLabel.length < 2) {
            try {
              const urlPath = new URL(img.src).pathname;
              const basename = path.basename(urlPath, path.extname(urlPath));
              imgLabel = basename.length > 2 ? basename : `img${allImages.size}`;
            } catch {
              imgLabel = `img${allImages.size}`;
            }
          }
          const imgName = `${slugify(pageInfo.label)}-${slugify(imgLabel)}${ext}`;
          const imgPath = path.join(IMAGES_DIR, imgName);
          const size = await downloadFile(img.src, imgPath);
          allImages.set(img.src, {
            filename: imgName,
            size,
            source: pageInfo.label,
            alt: img.alt,
          });
          console.log(`  🖼️  ${imgName} (${formatBytes(size)})`);
        } catch (err) {
          console.log(`  ⚠️  Failed to download: ${img.src.slice(0, 80)}... (${err.message})`);
        }
      }

      allPages.push({ ...pageInfo, data: pageData });
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }

  await browser.close();

  // Step 4: Generate markdown
  console.log('\n📝 Generating markdown...');

  const today = new Date().toISOString().split('T')[0];
  let md = '';

  md += `# WordPress Site Scraped Content\n\n`;
  md += `**Source:** ${SITE_URL}\n`;
  md += `**Scraped:** ${today}\n`;
  md += `**Purpose:** Content migration to Astro + Sanity CMS\n\n`;
  md += `---\n\n`;

  // Site-wide data
  md += `## Site-Wide Data\n\n`;

  md += `### Site Title\n\n${siteWideData.siteTitle}\n\n`;

  md += `### Navigation\n\n`;
  md += `| Label | URL |\n|---|---|\n`;
  for (const nav of siteWideData.navigation) {
    md += `| ${nav.label} | ${nav.url} |\n`;
  }
  md += `\n`;

  if (siteWideData.socialLinks.length) {
    md += `### Social Links\n\n`;
    md += `| Platform | URL |\n|---|---|\n`;
    for (const s of siteWideData.socialLinks) {
      md += `| ${s.platform} | ${s.url} |\n`;
    }
    md += `\n`;
  }

  if (Object.keys(siteWideData.colors).length) {
    md += `### Design Tokens\n\n`;
    md += `| Token | Value |\n|---|---|\n`;
    for (const [k, v] of Object.entries(siteWideData.colors)) {
      md += `| ${k} | ${v} |\n`;
    }
    md += `\n`;
  }

  if (siteWideData.fontFamily) {
    md += `### Font\n\n${siteWideData.fontFamily}\n\n`;
  }

  md += `---\n\n`;

  // Pages
  for (const pg of allPages) {
    const d = pg.data;
    md += `## Page: ${pg.label} (${d.url})\n\n`;

    if (d.h1) {
      md += `### ${d.h1}\n\n`;
    }

    // Screenshot reference
    md += `**Screenshot:** \`screenshots/${slugify(pg.label)}.png\`\n\n`;

    // Sections
    if (d.sections && d.sections.length) {
      for (const section of d.sections) {
        if (section.heading) {
          md += `${section.heading}\n\n`;
        }
        for (const item of section.content) {
          if (typeof item === 'string') {
            md += `${item}\n\n`;
          } else if (item.type === 'list') {
            for (let i = 0; i < item.items.length; i++) {
              md += item.ordered ? `${i + 1}. ${item.items[i]}\n` : `- ${item.items[i]}\n`;
            }
            md += `\n`;
          } else if (item.type === 'quote') {
            md += `> ${item.text}\n\n`;
          } else if (item.type === 'table') {
            if (item.rows.length) {
              // First row as header
              md += `| ${item.rows[0].join(' | ')} |\n`;
              md += `| ${item.rows[0].map(() => '---').join(' | ')} |\n`;
              for (let i = 1; i < item.rows.length; i++) {
                md += `| ${item.rows[i].join(' | ')} |\n`;
              }
              md += `\n`;
            }
          } else if (item.type === 'image') {
            const imgInfo = allImages.get(item.src);
            const ref = imgInfo ? `images/${imgInfo.filename}` : item.src;
            md += `![${item.alt}](${ref})`;
            if (item.caption) md += `\n*${item.caption}*`;
            md += `\n\n`;
          }
        }
      }
    } else if (d.rawText) {
      // Fallback to raw text
      md += `${d.rawText}\n\n`;
    }

    // Forms
    if (d.forms && d.forms.length) {
      md += `### Forms\n\n`;
      for (const form of d.forms) {
        md += `**Action:** ${form.action} (${form.method})\n\n`;
        md += `| Field | Type | Required |\n|---|---|---|\n`;
        for (const f of form.fields) {
          md += `| ${f.name || f.placeholder || 'unnamed'} | ${f.type} | ${f.required ? 'Yes' : 'No'} |\n`;
        }
        md += `\n`;
      }
    }

    // Iframes
    if (d.iframes && d.iframes.length) {
      md += `### Embedded Content\n\n`;
      for (const iframe of d.iframes) {
        md += `- **${iframe.title || 'Iframe'}:** \`${iframe.src}\`\n`;
      }
      md += `\n`;
    }

    // CTAs / important links
    const ctaLinks = (d.links || []).filter(
      (l) =>
        l.text.toLowerCase().includes('apply') ||
        l.text.toLowerCase().includes('learn more') ||
        l.text.toLowerCase().includes('contact') ||
        l.text.toLowerCase().includes('get started') ||
        l.href.includes('formsite')
    );
    if (ctaLinks.length) {
      md += `### Call-to-Action Links\n\n`;
      for (const l of ctaLinks) {
        md += `- **${l.text}** -> ${l.href}\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  // Image inventory
  md += `## Downloaded Images Inventory\n\n`;
  md += `All images saved to \`${OUTPUT_DIR_NAME}/images/\`\n\n`;
  md += `| File | Alt Text | Source Page | Size |\n|---|---|---|---|\n`;
  for (const [, img] of allImages) {
    md += `| ${img.filename} | ${img.alt || '-'} | ${img.source} | ${formatBytes(img.size)} |\n`;
  }
  md += `\n`;

  // Screenshots inventory
  md += `## Screenshots Inventory\n\n`;
  md += `All screenshots saved to \`${OUTPUT_DIR_NAME}/screenshots/\`\n\n`;
  md += `| File | Page |\n|---|---|\n`;
  for (const pg of allPages) {
    md += `| ${slugify(pg.label)}.png | ${pg.label} |\n`;
  }
  md += `\n`;

  // Write markdown
  const mdPath = path.join(OUTPUT_DIR, 'scraped-content.md');
  await writeFile(mdPath, md, 'utf-8');

  console.log(`\n✅ Done! Output written to:`);
  console.log(`   📄 ${mdPath}`);
  console.log(`   🖼️  ${allImages.size} images in ${IMAGES_DIR}`);
  console.log(`   📸 ${allPages.length} screenshots in ${SCREENSHOTS_DIR}`);
}

scrapeSite().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
