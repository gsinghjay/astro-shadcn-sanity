import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('CSS theme selectors in global.css', () => {
  const cssPath = resolve(__dirname, '../../styles/global.css');
  const css = readFileSync(cssPath, 'utf-8');

  const expectedTokens = ['--primary', '--ring', '--destructive', '--chart-1', '--sidebar-primary', '--sidebar-ring'];

  it('contains [data-site-theme="blue"] selector with all required tokens', () => {
    const blueBlock = css.match(/\[data-site-theme="blue"\]\s*\{([^}]+)\}/);
    expect(blueBlock).not.toBeNull();
    const blockContent = blueBlock![1];
    for (const token of expectedTokens) {
      expect(blockContent).toContain(token);
    }
  });

  it('contains [data-site-theme="green"] selector with all required tokens', () => {
    const greenBlock = css.match(/\[data-site-theme="green"\]\s*\{([^}]+)\}/);
    expect(greenBlock).not.toBeNull();
    const blockContent = greenBlock![1];
    for (const token of expectedTokens) {
      expect(blockContent).toContain(token);
    }
  });

  it('contains .dark[data-site-theme="blue"] selector with primary/ring/destructive', () => {
    const darkBlueBlock = css.match(/\.dark\[data-site-theme="blue"\]\s*\{([^}]+)\}/);
    expect(darkBlueBlock).not.toBeNull();
    const blockContent = darkBlueBlock![1];
    expect(blockContent).toContain('--primary');
    expect(blockContent).toContain('--ring');
    expect(blockContent).toContain('--destructive');
  });

  it('contains .dark[data-site-theme="green"] selector with primary/ring/destructive', () => {
    const darkGreenBlock = css.match(/\.dark\[data-site-theme="green"\]\s*\{([^}]+)\}/);
    expect(darkGreenBlock).not.toBeNull();
    const blockContent = darkGreenBlock![1];
    expect(blockContent).toContain('--primary');
    expect(blockContent).toContain('--ring');
    expect(blockContent).toContain('--destructive');
  });

  it('does NOT contain a redundant [data-site-theme="red"] selector', () => {
    expect(css).not.toMatch(/\[data-site-theme="red"\]/);
  });

  it('::selection uses var(--primary) not hardcoded swiss-red', () => {
    const selectionBlock = css.match(/::selection\s*\{([^}]+)\}/);
    expect(selectionBlock).not.toBeNull();
    const blockContent = selectionBlock![1];
    expect(blockContent).toContain('var(--primary)');
    expect(blockContent).toContain('var(--primary-foreground)');
    expect(blockContent).not.toContain('swiss-red');
  });

  it('blue theme uses distinct colors from red defaults', () => {
    const blueBlock = css.match(/\[data-site-theme="blue"\]\s*\{([^}]+)\}/);
    const blockContent = blueBlock![1];
    expect(blockContent).not.toContain('#e30613');
    expect(blockContent).not.toContain('#E30613');
  });

  it('green theme uses distinct colors from red defaults', () => {
    const greenBlock = css.match(/\[data-site-theme="green"\]\s*\{([^}]+)\}/);
    const blockContent = greenBlock![1];
    expect(blockContent).not.toContain('#e30613');
    expect(blockContent).not.toContain('#E30613');
  });
});

describe('astro.config.mjs vite.define', () => {
  const configPath = resolve(__dirname, '../../../astro.config.mjs');
  const config = readFileSync(configPath, 'utf-8');

  it('includes PUBLIC_SITE_THEME in vite.define', () => {
    expect(config).toContain('"import.meta.env.PUBLIC_SITE_THEME"');
  });

  it('validates PUBLIC_SITE_THEME against allowed values', () => {
    expect(config).toContain('VALID_SITE_THEMES');
    expect(config).toMatch(/\["red",\s*"blue",\s*"green"\]/);
  });
});

describe('Layout.astro data-site-theme attribute', () => {
  const layoutPath = resolve(__dirname, '../../layouts/Layout.astro');
  const layout = readFileSync(layoutPath, 'utf-8');

  it('reads PUBLIC_SITE_THEME from import.meta.env', () => {
    expect(layout).toContain("import.meta.env.PUBLIC_SITE_THEME");
  });

  it('sets data-site-theme attribute on <html>', () => {
    expect(layout).toMatch(/data-site-theme=\{siteTheme\}/);
  });

  it('defaults to red when env var is missing', () => {
    expect(layout).toMatch(/\|\|\s*['"]red['"]/);
  });
});
