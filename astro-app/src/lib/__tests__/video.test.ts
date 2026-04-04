import { getEmbedUrl, getVideoId } from '@/lib/video';

/**
 * Mirrors extractYouTubeId() from studio/src/schemaTypes/blocks/YouTubePreview.tsx.
 * This parity test ensures both implementations stay in sync.
 */
function extractYouTubeId(url: string): string | null {
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  return null;
}

describe('getEmbedUrl / extractYouTubeId parity', () => {
  const testCases = [
    { input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expectedId: 'dQw4w9WgXcQ' },
    { input: 'https://youtu.be/dQw4w9WgXcQ', expectedId: 'dQw4w9WgXcQ' },
    { input: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expectedId: 'dQw4w9WgXcQ' },
    { input: 'https://www.youtube.com/watch?v=abc123&t=60', expectedId: 'abc123' },
    { input: 'https://vimeo.com/123456', expectedId: null },
    { input: '', expectedId: null },
    { input: 'not a url at all', expectedId: null },
  ];

  it.each(testCases)(
    'both implementations agree on "$input"',
    ({ input, expectedId }) => {
      const studioResult = extractYouTubeId(input);
      const astroResult = getEmbedUrl(input);

      if (expectedId === null) {
        expect(studioResult).toBeNull();
        expect(astroResult).toBeNull();
      } else {
        expect(studioResult).toBe(expectedId);
        expect(astroResult).toBe(`https://www.youtube-nocookie.com/embed/${expectedId}`);
      }
    },
  );
});

describe('getVideoId', () => {
  it('extracts ID from youtube.com/watch?v= URL', () => {
    expect(getVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from youtu.be/ short URL', () => {
    expect(getVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from youtube.com/embed/ URL', () => {
    expect(getVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for non-YouTube URL', () => {
    expect(getVideoId('https://vimeo.com/123456')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getVideoId('')).toBeNull();
  });
});

describe('getEmbedUrl', () => {
  it('extracts video ID from youtube.com/watch?v= URL', () => {
    expect(getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('extracts video ID from youtu.be/ short URL', () => {
    expect(getEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('extracts video ID from youtube.com/embed/ URL', () => {
    expect(getEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('strips query params from YouTube URL (e.g. &t=60)', () => {
    expect(getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=60')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('returns null for non-YouTube URL', () => {
    expect(getEmbedUrl('https://vimeo.com/123456')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getEmbedUrl('')).toBeNull();
  });

  it('returns null for arbitrary string', () => {
    expect(getEmbedUrl('not a url at all')).toBeNull();
  });
});
