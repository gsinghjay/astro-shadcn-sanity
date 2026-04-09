import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const siteUrl = import.meta.env.SITE;

  const body = `User-agent: *
Allow: /
Disallow: /portal/
Disallow: /auth/
Disallow: /student/

Sitemap: ${siteUrl}sitemap-index.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
