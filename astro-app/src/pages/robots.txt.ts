import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') ?? '';

  const body = `User-agent: *
Allow: /
Disallow: /portal/
Disallow: /auth/
Disallow: /student/
Disallow: /demo/

User-agent: Cloudflare-AI-Search
Allow: /
Disallow: /portal/
Disallow: /auth/
Disallow: /student/
Disallow: /demo/

Sitemap: ${siteUrl}/sitemap-index.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
