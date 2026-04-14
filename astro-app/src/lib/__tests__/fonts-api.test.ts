import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../../..');

describe('Story 22.5: Astro Fonts API Configuration', () => {
  describe('Task 2: Astro Fonts API in astro.config.mjs (AC: #1, #2, #3)', () => {
    const configContent = readFileSync(resolve(ROOT, 'astro.config.mjs'), 'utf-8');

    it('imports fontProviders from astro/config', () => {
      expect(configContent).toMatch(/fontProviders.*from\s+["']astro\/config["']/);
    });

    it('configures fonts inside experimental block (Astro 5.x)', () => {
      expect(configContent).toMatch(/experimental\s*:\s*\{[\s\S]*fonts\s*:\s*\[/);
    });

    it('configures Inter font family', () => {
      expect(configContent).toMatch(/name\s*:\s*["']Inter["']/);
    });

    it('uses fontsource provider', () => {
      expect(configContent).toContain('fontProviders.fontsource()');
    });

    it('maps to --font-inter CSS variable', () => {
      expect(configContent).toMatch(/cssVariable\s*:\s*["']--font-inter["']/);
    });

    it('includes variable font weight range for 750 heading support', () => {
      expect(configContent).toMatch(/weights\s*:\s*\[["']100 900["']\]/);
    });

    it('specifies system font fallbacks preserving original stack', () => {
      expect(configContent).toContain('Helvetica Neue');
      expect(configContent).toContain('Arial');
      expect(configContent).toContain('sans-serif');
    });
  });

  describe('Task 2: Font component in Layout.astro (AC: #2)', () => {
    const layoutContent = readFileSync(
      resolve(ROOT, 'src/layouts/Layout.astro'),
      'utf-8',
    );

    it('imports Font from astro:assets', () => {
      expect(layoutContent).toMatch(/import\s*\{\s*Font\s*\}\s*from\s*["']astro:assets["']/);
    });

    it('includes <Font /> component with --font-inter cssVariable in head', () => {
      expect(layoutContent).toMatch(/<Font\s+cssVariable\s*=\s*["']--font-inter["']/);
    });
  });

  describe('Task 3: global.css font declarations updated (AC: #4)', () => {
    const cssContent = readFileSync(
      resolve(ROOT, 'src/styles/global.css'),
      'utf-8',
    );

    it('maps --font-sans to var(--font-inter) with system font fallbacks in @theme', () => {
      expect(cssContent).toMatch(/--font-sans\s*:\s*var\(--font-inter,\s*'Helvetica Neue'/);
    });

    it('maps --font-display to var(--font-inter) with system font fallbacks in @theme', () => {
      expect(cssContent).toMatch(/--font-display\s*:\s*var\(--font-inter,\s*'Helvetica Neue'/);
    });

    it('uses var(--font-inter) as primary value (not hardcoded font stack alone)', () => {
      // The @theme block should use var(--font-inter, ...) not a bare font stack
      const themeMatch = cssContent.match(/@theme\s*\{([^}]+)\}/);
      expect(themeMatch).toBeTruthy();
      expect(themeMatch![1]).toMatch(/--font-sans\s*:\s*var\(--font-inter/);
    });

    it('preserves --font-mono in @theme (not touched)', () => {
      expect(cssContent).toMatch(/--font-mono\s*:\s*['"]?Courier New/);
    });

    it('body still uses var(--font-sans) for font-family', () => {
      expect(cssContent).toContain('font-family: var(--font-sans)');
    });

    it('headings still use var(--font-display) for font-family', () => {
      expect(cssContent).toContain('font-family: var(--font-display)');
    });

    it('preserves font-weight: 750 on headings', () => {
      expect(cssContent).toMatch(/h1.*\{[^}]*font-weight:\s*750/s);
    });
  });

  describe('Task 4: No font-related Vite defines (AC: #1)', () => {
    const configContent = readFileSync(resolve(ROOT, 'astro.config.mjs'), 'utf-8');

    it('does not have font-related entries in vite.define', () => {
      const defineMatch = configContent.match(/define\s*:\s*\{([\s\S]*?)\}/);
      expect(defineMatch).toBeTruthy();
      expect(defineMatch![1]).not.toMatch(/font/i);
    });
  });

  describe('Task 6: CSP headers allow self-hosted fonts (AC: #1)', () => {
    const headersPath = resolve(ROOT, 'public/_headers');

    it('_headers file exists', () => {
      expect(existsSync(headersPath)).toBe(true);
    });

    it('does not reference external font CDN domains', () => {
      const headersContent = readFileSync(headersPath, 'utf-8');
      expect(headersContent).not.toContain('fonts.googleapis.com');
      expect(headersContent).not.toContain('fonts.gstatic.com');
    });
  });

  describe('Task 5: Build output verification (AC: #1, #2, #5)', () => {
    const DIST = resolve(ROOT, 'dist');
    const describeIfBuilt = existsSync(DIST) ? describe : describe.skip;

    describeIfBuilt('self-hosted font files', () => {
      it('font files exist in dist/_astro/fonts/', () => {
        const fontsDir = resolve(DIST, '_astro/fonts');
        expect(existsSync(fontsDir)).toBe(true);
      });

      it('contains woff2 font file (self-hosted, no external requests)', () => {
        const fontsDir = resolve(DIST, '_astro/fonts');
        const files = readdirSync(fontsDir);
        const woff2Files = files.filter((f: string) => f.endsWith('.woff2'));
        expect(woff2Files.length).toBeGreaterThan(0);
      });

      it('index.html contains font preload or @font-face reference', () => {
        const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
        // The Font component should inject either a preload link or inline @font-face CSS
        const hasFontRef =
          html.includes('as="font"') ||
          html.includes('@font-face') ||
          html.includes('font-inter') ||
          html.includes('.woff2');
        expect(hasFontRef).toBe(true);
      });

      it('no external font CDN requests in HTML', () => {
        const html = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
        expect(html).not.toContain('fonts.googleapis.com');
        expect(html).not.toContain('fonts.gstatic.com');
        expect(html).not.toContain('use.typekit.net');
      });
    });
  });
});
