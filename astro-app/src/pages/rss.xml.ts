import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { stegaClean } from '@sanity/client/stega';
import { getAllArticles, getSiteSettings } from '@/lib/sanity';

export const prerender = true;

const DEFAULT_TITLE = 'YWCC Industry Capstone';
const DEFAULT_DESCRIPTION =
  'Latest articles, news, and updates from the YWCC Industry Capstone program.';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error(
      'rss.xml.ts: Astro site is not configured. ' +
        'Set PUBLIC_SITE_URL and/or site in astro.config.mjs.',
    );
  }

  const [articles, siteSettings] = await Promise.all([
    getAllArticles(),
    getSiteSettings(),
  ]);

  const channelTitle =
    stegaClean(siteSettings?.siteName ?? '') || DEFAULT_TITLE;
  const channelDescription =
    stegaClean(siteSettings?.siteDescription ?? '') || DEFAULT_DESCRIPTION;

  const items = articles
    .filter(
      (a): a is typeof a & { publishedAt: string; slug: string } =>
        !!a.publishedAt &&
        !!a.slug &&
        !Number.isNaN(Date.parse(stegaClean(a.publishedAt))),
    )
    .map((a) => {
      const title = stegaClean(a.title ?? '') || 'Untitled';
      const description = stegaClean(a.excerpt ?? '') || '';
      const slug = stegaClean(a.slug);
      const pubDate = new Date(stegaClean(a.publishedAt));
      const categoryTitle = a.category?.title
        ? stegaClean(a.category.title)
        : null;
      const authorName = a.author?.name
        ? stegaClean(a.author.name)
        : undefined;

      return {
        title,
        description,
        link: `/articles/${slug}`,
        pubDate,
        ...(categoryTitle ? { categories: [categoryTitle] } : {}),
        ...(authorName ? { author: authorName } : {}),
      };
    });

  return rss({
    title: channelTitle,
    description: channelDescription,
    site: context.site,
    items,
  });
}
