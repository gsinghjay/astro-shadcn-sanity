/**
 * Extracts a YouTube video ID from common URL patterns.
 * Returns null for unrecognized URLs.
 *
 * Keep in sync with studio/src/schemaTypes/blocks/YouTubePreview.tsx (extractYouTubeId).
 */
export function getVideoId(videoUrl: string): string | null {
  const watchMatch = videoUrl.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = videoUrl.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = videoUrl.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  const shortsMatch = videoUrl.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shortsMatch) return shortsMatch[1];
  return null;
}

/**
 * Returns a privacy-enhanced embed URL for a YouTube video.
 * Returns null for unrecognized URLs.
 */
export function getEmbedUrl(videoUrl: string): string | null {
  const videoId = getVideoId(videoUrl);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}
