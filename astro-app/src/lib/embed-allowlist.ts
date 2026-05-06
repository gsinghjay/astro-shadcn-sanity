export const EMBED_ALLOWED_ORIGINS = [
  'https://www.youtube-nocookie.com',
  'https://www.youtube.com',
  'https://player.vimeo.com',
  'https://www.google.com',
  'https://www.loom.com',
  'https://gist.github.com',
] as const;

export function validateEmbedUrl(raw: string): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const origin = url.origin;
  const allowed = EMBED_ALLOWED_ORIGINS.includes(
    origin as (typeof EMBED_ALLOWED_ORIGINS)[number],
  );
  if (!allowed) return null;
  if (origin === 'https://www.google.com' && !url.pathname.startsWith('/maps/embed')) return null;
  return url.toString();
}
