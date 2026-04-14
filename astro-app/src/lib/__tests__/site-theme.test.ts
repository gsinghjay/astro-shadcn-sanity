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

  it('does not contain .dark theme selectors (dark mode disabled)', () => {
    expect(css).not.toMatch(/\.dark\[data-site-theme=/);
    expect(css).not.toMatch(/\.dark\s*\{[^}]*--background/);
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

describe('astro.config.mjs env.schema', () => {
  const configPath = resolve(__dirname, '../../../astro.config.mjs');
  const config = readFileSync(configPath, 'utf-8');

  it('declares PUBLIC_SITE_THEME in env.schema via envField.enum', () => {
    expect(config).toContain('PUBLIC_SITE_THEME: envField.enum(');
  });

  it('validates PUBLIC_SITE_THEME against allowed values', () => {
    expect(config).toMatch(/values:\s*\["red",\s*"blue",\s*"green"\]/);
  });

  it('does not use vite.define for PUBLIC_SITE_THEME', () => {
    expect(config).not.toContain('"import.meta.env.PUBLIC_SITE_THEME"');
  });
});

describe('Layout.astro data-site-theme attribute', () => {
  const layoutPath = resolve(__dirname, '../../layouts/Layout.astro');
  const layout = readFileSync(layoutPath, 'utf-8');

  it('imports PUBLIC_SITE_THEME from astro:env/client', () => {
    expect(layout).toContain('PUBLIC_SITE_THEME');
    expect(layout).toContain('astro:env/client');
  });

  it('sets data-site-theme attribute on <html>', () => {
    expect(layout).toMatch(/data-site-theme=\{siteTheme\}/);
  });
});
