import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ProjectCardEnhanced from '../ProjectCardEnhanced.astro';
import { projectFull, projectMinimal } from './__fixtures__/projects';

describe('ProjectCardEnhanced', () => {
  test('renders data-sort-title with lowercase stegaCleaned title', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCardEnhanced, {
      props: { project: projectFull },
    });

    expect(html).toContain('data-sort-title="smart campus navigation"');
  });

  test('renders data-sort-date with _createdAt value', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCardEnhanced, {
      props: { project: projectFull },
    });

    expect(html).toContain('data-sort-date="2025-10-15T12:00:00Z"');
  });

  test('handles missing title gracefully', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCardEnhanced, {
      props: { project: { ...projectMinimal, title: null } },
    });

    // Astro renders empty-string attributes without the `=""` suffix
    expect(html).toMatch(/data-sort-title(?:="")?\s/);
  });

  test('renders data-sort-date with different _createdAt values', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCardEnhanced, {
      props: { project: projectMinimal },
    });

    expect(html).toContain('data-sort-date="2025-09-01T08:00:00Z"');
  });

  test('renders existing data attributes alongside sort attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCardEnhanced, {
      props: { project: projectFull },
    });

    expect(html).toContain('data-project-card');
    expect(html).toContain('data-tech-tags="React,TypeScript,IoT"');
    expect(html).toContain('data-industry="Technology"');
    expect(html).toContain('data-sort-title="smart campus navigation"');
    expect(html).toContain('data-sort-date="2025-10-15T12:00:00Z"');
  });
});
