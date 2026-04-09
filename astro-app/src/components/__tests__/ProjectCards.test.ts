import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ProjectCards from '../blocks/custom/ProjectCards.astro';
import { projectCardsFull, projectCardsMinimal } from './__fixtures__/project-cards';

describe('ProjectCards', () => {
  test('renders heading and project titles', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: projectCardsFull,
    });

    expect(html).toContain('Our Projects');
    expect(html).toContain('Smart Campus Navigation');
    expect(html).toContain('Blockchain Voting');
  });

  test('renders project cards with links to /projects/{slug}', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: projectCardsFull,
    });

    expect(html).toContain('href="/projects/smart-campus-navigation"');
    expect(html).toContain('href="/projects/blockchain-voting"');
  });

  test('renders technology tag badges', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: projectCardsFull,
    });

    expect(html).toContain('React');
    expect(html).toContain('TypeScript');
    expect(html).toContain('IoT');
    expect(html).toContain('Blockchain');
    expect(html).toContain('Ethereum');
  });

  test('renders sponsor names on cards', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: projectCardsFull,
    });

    expect(html).toContain('Acme Corp');
  });

  test('handles minimal/empty data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: projectCardsMinimal,
    });
    expect(html).toBeDefined();
  });

  test('case-study variant renders horizontal layout with sponsor name', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'case-study' },
    });

    expect(html).toContain('Our Projects');
    expect(html).toContain('Smart Campus Navigation');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('border-2');
    expect(html).toContain('@3xl:flex-row');
  });

  test('case-study variant renders tech stack badges', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'case-study' },
    });

    expect(html).toContain('React');
    expect(html).toContain('TypeScript');
    expect(html).toContain('label-caps');
  });

  test('case-study variant renders status indicator', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'case-study' },
    });

    expect(html).toContain('completed');
  });

  test('case-study variant renders heading with left border accent', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'case-study' },
    });

    expect(html).toContain('border-l-4');
    expect(html).toContain('border-primary');
  });

  test('blueprint variant renders monospace title', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'blueprint' },
    });

    expect(html).toContain('font-mono');
  });

  test('blueprint variant renders grid overlay effect', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'blueprint' },
    });

    expect(html).toContain('background-size: 20px 20px');
  });

  test('blueprint variant renders lighter border cards', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'blueprint' },
    });

    expect(html).toContain('border');
    expect(html).toContain('background/30');
  });

  test('unknown variant falls back to default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCards, {
      props: { ...projectCardsFull, variant: 'unknown' },
    });

    expect(html).toContain('Smart Campus Navigation');
  });
});
