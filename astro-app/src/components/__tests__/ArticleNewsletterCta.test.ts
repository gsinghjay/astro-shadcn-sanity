import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ArticleNewsletterCta from '../ArticleNewsletterCta.astro';

// Story 19.7 — unit tests for the shared static newsletter CTA component.
// Covers both variants: `article-body` (on article detail pages) and `compact`
// (inside the articleList block). The component is NOT schema-driven — it
// takes only local Astro props.
//
// Pattern reference: ArticleCard.test.ts / ArticleList.test.ts (AstroContainer).

describe('ArticleNewsletterCta — article-body variant (Story 19.7)', () => {
  test('renders the default heading "Stay updated"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).toContain('Stay updated');
  });

  test('renders a custom heading when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body', heading: 'Join our newsletter' },
    });
    expect(html).toContain('Join our newsletter');
    expect(html).not.toContain('Stay updated');
  });

  test('renders the default description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).toContain('Subscribe for new articles delivered to your inbox.');
  });

  test('renders a <form> containing an <input type="email"> and a <button type="submit">', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).toContain('<form');
    expect(html).toContain('type="email"');
    expect(html).toContain('type="submit"');
    expect(html).toContain('Subscribe');
  });

  test('input carries aria-label="Email address" (no visible label by design)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).toContain('aria-label="Email address"');
  });

  test('omits the privacy disclaimer when privacyDisclaimerText is undefined', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    // No privacy disclaimer text leaks into the HTML
    expect(html).not.toContain('We never share');
    // The disclaimer <p> is gated on the prop — confirm by checking the literal
    // string that would appear when enabled is absent.
    expect(html).not.toContain('We never share your email');
  });

  test('renders the privacy disclaimer when privacyDisclaimerText is provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: {
        variant: 'article-body',
        privacyDisclaimerText: 'We never share your email',
      },
    });
    expect(html).toContain('We never share your email');
    expect(html).toContain('text-xs text-muted-foreground');
  });

  test('form carries data-gtm-label="article-body"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).toContain('data-gtm-category="newsletter"');
    expect(html).toContain('data-gtm-action="subscribe"');
    expect(html).toContain('data-gtm-label="article-body"');
  });

  test('form uses onsubmit="return false;" (matches Newsletter.astro pattern)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).toContain('onsubmit="return false;"');
  });

  test('does NOT wrap in a <section> element — avoids the single-Section layout bug', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).not.toContain('<section');
  });

  test('renders an <h2> heading for the article-body variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'article-body' },
    });
    expect(html).toContain('<h2');
    expect(html).not.toContain('<h3');
  });

  test('defaults to article-body variant when variant prop is omitted', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: {},
    });
    // article-body variant has the centered wrapper and h2
    expect(html).toContain('text-center');
    expect(html).toContain('<h2');
    expect(html).toContain('data-gtm-label="article-body"');
  });
});

describe('ArticleNewsletterCta — compact variant (Story 19.7)', () => {
  test('renders an <h3> heading (not <h2>) — distinct from article-body variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).toContain('<h3');
    expect(html).not.toContain('<h2');
  });

  test("form carries data-gtm-label=\"article-list-block\" (differentiates analytics from article-body)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).toContain('data-gtm-category="newsletter"');
    expect(html).toContain('data-gtm-action="subscribe"');
    expect(html).toContain('data-gtm-label="article-list-block"');
  });

  test('form uses onsubmit="return false;" (matches article-body variant)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).toContain('onsubmit="return false;"');
  });

  test('does NOT wrap in a <section> element', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).not.toContain('<section');
  });

  test('uses left-aligned items-start layout (not text-center)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).toContain('items-start');
    // compact variant must NOT have the article-body text-center class
    expect(html).not.toContain('text-center');
  });

  test('renders default heading + description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).toContain('Stay updated');
    expect(html).toContain('Subscribe for new articles delivered to your inbox.');
  });

  test('input carries aria-label="Email address"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).toContain('aria-label="Email address"');
  });

  test('renders privacy disclaimer when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: {
        variant: 'compact',
        privacyDisclaimerText: 'We respect your inbox',
      },
    });
    expect(html).toContain('We respect your inbox');
  });

  test('omits privacy disclaimer when not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleNewsletterCta, {
      props: { variant: 'compact' },
    });
    expect(html).not.toContain('We respect your inbox');
  });
});
