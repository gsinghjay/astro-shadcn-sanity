import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ProjectCard from '../ProjectCard.astro';
import { projectFull, projectMinimal } from './__fixtures__/projects';

describe('ProjectCard', () => {
  test('renders title and links to detail page', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('Smart Campus Navigation');
    expect(html).toContain('href="/projects/smart-campus-navigation"');
  });

  test('renders sponsor name with link to sponsor detail', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('Acme Corp');
    expect(html).toContain('href="/sponsors/acme-corp"');
  });

  test('renders sponsor logo via urlFor', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('Acme logo');
    expect(html).toMatch(/src="[^"]*w=48[^"]*h=48/);
  });

  test('renders technology tags as badges', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('React');
    expect(html).toContain('TypeScript');
    expect(html).toContain('IoT');
  });

  test('renders status badge', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('completed');
  });

  test('renders semester', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('Fall 2025');
  });

  test('renders content excerpt from Portable Text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('innovative wayfinding solution');
  });

  test('renders data attributes for filtering', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectFull },
    });

    expect(html).toContain('data-project-card');
    expect(html).toContain('data-tech-tags="React,TypeScript,IoT"');
    expect(html).toContain('data-industry="Technology"');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCard, {
      props: { project: projectMinimal },
    });

    expect(html).toBeDefined();
    expect(html).toContain('Minimal Project');
  });
});
