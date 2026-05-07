import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const siteUrl = import.meta.env.SITE?.replace(/\/$/, '') ?? '';

  const body = `User-agent: *
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Allow: /
Disallow: /portal/
Disallow: /auth/
Disallow: /student/
Disallow: /demo/
Disallow: /search

User-agent: Cloudflare-AI-Search
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Allow: /
Disallow: /portal/
Disallow: /auth/
Disallow: /student/
Disallow: /demo/
Disallow: /search

# LLMs: ${siteUrl}/llms.txt
Sitemap: ${siteUrl}/sitemap-index.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
