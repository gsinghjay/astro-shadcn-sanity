/**
 * Extracts a YouTube video ID from common URL patterns and returns
 * a privacy-enhanced embed URL. Returns null for unrecognized URLs.
 */
export function getEmbedUrl(videoUrl: string): string | null {
  let videoId: string | null = null;

  // Prefer URL parsing for robust handling of watch/embed/shorts/short links.
  try {
    const parsed = new URL(videoUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;

    if (host === 'youtu.be') {
      videoId = path.split('/').filter(Boolean)[0] ?? null;
    } else if (host.endsWith('youtube.com')) {
      if (path === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (path.startsWith('/embed/')) {
        videoId = path.split('/')[2] ?? null;
      } else if (path.startsWith('/shorts/')) {
        videoId = path.split('/')[2] ?? null;
      }
    }
  } catch {
    // Fall back to regex matching for malformed/partial URL strings.
  }

  if (!videoId) {
    const watchMatch = videoUrl.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (watchMatch) videoId = watchMatch[1];
  }
  if (!videoId) {
    const shortMatch = videoUrl.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) videoId = shortMatch[1];
  }
  if (!videoId) {
    const embedMatch = videoUrl.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch) videoId = embedMatch[1];
  }
  if (!videoId) {
    const shortsMatch = videoUrl.match(/youtube\.com\/shorts\/([^?&]+)/);
    if (shortsMatch) videoId = shortsMatch[1];
  }

  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}
