import { getEmbedUrl } from '@/lib/video';

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
