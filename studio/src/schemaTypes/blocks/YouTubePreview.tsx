import {type PreviewProps} from 'sanity'

/**
 * Extract YouTube video ID from common URL patterns.
 * Mirrors the logic in astro-app/src/lib/video.ts — keep in sync.
 */
function extractYouTubeId(url: string): string | null {
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (watchMatch) return watchMatch[1]
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return shortMatch[1]
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/)
  if (embedMatch) return embedMatch[1]
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/)
  if (shortsMatch) return shortsMatch[1]
  return null
}

export function YouTubePreview(props: PreviewProps) {
  const {subtitle: videoUrl} = props
  const url = typeof videoUrl === 'string' ? videoUrl : ''

  if (!url) {
    return <div style={{padding: '1em', textAlign: 'center', color: '#999'}}>Add a YouTube URL</div>
  }

  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return <div style={{padding: '1em', textAlign: 'center', color: '#999'}}>Invalid YouTube URL</div>
  }

  return (
    <div style={{padding: '1em'}}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube Preview"
        style={{width: '100%', aspectRatio: '16/9', border: 'none'}}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
