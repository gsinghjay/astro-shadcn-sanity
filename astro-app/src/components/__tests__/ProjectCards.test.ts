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
});
