import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ArticleList from '../blocks/custom/ArticleList.astro';
import { articleListFull, articleListSplitFeatured, articleListVariantList, articleListMinimal } from './__fixtures__/article-list';

describe('ArticleList', () => {
  test('renders heading and description in grid variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListFull });

    expect(html).toContain('Latest Articles');
    expect(html).toContain('Stay up to date with our news');
  });

  test('renders CTA button links', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListFull });

    expect(html).toContain('View All Articles');
    expect(html).toContain('/articles');
  });

  test('renders placeholder message when no articles', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListFull });

    expect(html).toContain('No articles to display');
  });

  test('hides description in list variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListVariantList });

    expect(html).toContain('News');
    expect(html).not.toContain('This should be hidden in list variant');
  });

  test('renders split-featured variant heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListSplitFeatured });

    expect(html).toContain('Featured Articles');
    expect(html).toContain('Our top picks');
  });

  test('renders outline button variant correctly', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListVariantList });

    expect(html).toContain('More News');
    expect(html).toContain('/news');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListMinimal });
    expect(html).toBeDefined();
  });

  test('grid variant renders card grid placeholder layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListFull });
    // Grid variant should render placeholder cards with image and text skeletons
    expect(html).toContain('data-variant="grid"');
    expect(html).toContain('aspect-video');
  });

  test('split-featured variant renders split layout placeholder', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListSplitFeatured });
    // Split-featured should use the SectionSplit layout with featured + grid
    expect(html).toContain('data-slot="section-split"');
    expect(html).toContain('data-variant="split-featured"');
  });

  test('list variant renders text-only list placeholder', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleList, { props: articleListVariantList });
    // List variant should show a divide-y text-only list structure
    expect(html).toContain('divide-y');
    expect(html).toContain('data-variant="list"');
  });
});
