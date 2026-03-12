import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import TeamGrid from '../blocks/custom/TeamGrid.astro';
import { teamGridFull, teamGridCompact, teamGridSplit, teamGridMinimal } from './__fixtures__/team-grid';

describe('TeamGrid', () => {
  test('renders heading and team members in grid variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TeamGrid, { props: teamGridFull });

    expect(html).toContain('Our Team');
    expect(html).toContain('Meet the people behind our work');
    expect(html).toContain('Alice Johnson');
    expect(html).toContain('Lead Developer');
    expect(html).toContain('Bob Smith');
    expect(html).toContain('Designer');
  });

  test('renders social links in grid variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TeamGrid, { props: teamGridFull });

    expect(html).toContain('GitHub');
    expect(html).toContain('https://github.com/alice');
    expect(html).toContain('LinkedIn');
    expect(html).toContain('Portfolio');
  });

  test('renders grid-compact variant with name and role only', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TeamGrid, { props: teamGridCompact });

    expect(html).toContain('Team');
    expect(html).toContain('Carol White');
    expect(html).toContain('Engineer');
  });

  test('renders split variant with heading and members', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TeamGrid, { props: teamGridSplit });

    expect(html).toContain('Meet Our Team');
    expect(html).toContain('We are a diverse group of professionals');
    expect(html).toContain('Dave Brown');
    expect(html).toContain('PM');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TeamGrid, { props: teamGridMinimal });
    expect(html).toBeDefined();
  });
});
