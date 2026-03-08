import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import AnnouncementBar from '../blocks/custom/AnnouncementBar.astro';
import {
  announcementInlineFull,
  announcementInlineMinimal,
  announcementFloating,
  announcementMinimal,
} from './__fixtures__/announcement-bar';

describe('AnnouncementBar', () => {
  test('renders inline variant with text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnnouncementBar, {
      props: announcementInlineFull,
    });

    expect(html).toContain('Registration is now open for Spring 2026!');
    expect(html).toContain('data-announcement');
  });

  test('renders icon when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnnouncementBar, {
      props: announcementInlineFull,
    });

    expect(html).toContain('<svg');
  });

  test('renders inline variant with link button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnnouncementBar, {
      props: announcementInlineFull,
    });

    expect(html).toContain('Register Now');
    expect(html).toContain('https://example.com/register');
  });

  test('renders inline variant with dismiss button when dismissible', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnnouncementBar, {
      props: announcementInlineFull,
    });

    expect(html).toContain('announcement-dismiss');
    expect(html).toContain('Dismiss');
  });

  test('renders floating variant with tile', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnnouncementBar, {
      props: announcementFloating,
    });

    expect(html).toContain('Maintenance scheduled for this weekend');
    expect(html).toContain('Details');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnnouncementBar, {
      props: announcementMinimal,
    });

    expect(html).toBeDefined();
    expect(html).toContain('Basic announcement');
  });

  test('renders inline minimal without link or dismiss button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnnouncementBar, {
      props: announcementInlineMinimal,
    });

    expect(html).toContain('Simple announcement');
    expect(html).not.toContain('announcement-dismiss');
  });
});
