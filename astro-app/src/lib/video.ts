/**
 * Extracts a YouTube video ID from common URL patterns and returns
 * a privacy-enhanced embed URL. Returns null for unrecognized URLs.
 */
export function getEmbedUrl(videoUrl: string): string | null {
  let videoId: string | null = null;
  const watchMatch = videoUrl.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) videoId = watchMatch[1];
  if (!videoId) {
    const shortMatch = videoUrl.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) videoId = shortMatch[1];
  }
  if (!videoId) {
    const embedMatch = videoUrl.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch) videoId = embedMatch[1];
  }
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}
