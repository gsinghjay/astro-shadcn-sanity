import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import Testimonials from '../blocks/custom/Testimonials.astro';
import TestimonialCard from '../TestimonialCard.astro';
import { testimonialsData, testimonialsFull, testimonialsMinimal, testimonialsByProject, testimonialEmbedUrl, testimonialInvalidUrl } from './__fixtures__/testimonials';

describe('Testimonials', () => {
  test('renders heading and testimonial names', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsFull,
    });

    expect(html).toContain('What People Say');
    expect(html).toContain('Jane Smith');
    expect(html).toContain('John Doe');
    expect(html).toContain('Maria Garcia');
    expect(html).toContain('Alex Chen');
  });

  test('renders quote text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsFull,
    });

    expect(html).toContain('This project transformed our workflow');
    expect(html).toContain('Working on this capstone project');
  });

  test('renders role and organization', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsFull,
    });

    expect(html).toContain('CTO');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('NJIT');
  });

  test('renders photo with urlFor responsive dimensions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsFull,
    });

    expect(html).toContain('Jane Smith photo');
    expect(html).toMatch(/src="[^"]*w=80[^"]*h=80/);
  });

  test('renders initials fallback when no photo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsFull,
    });

    // John Doe has no photo — should show initials "JD"
    expect(html).toContain('JD');
  });

  test('renders project links', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsFull,
    });

    expect(html).toContain('href="/projects/ai-dashboard"');
    expect(html).toContain('AI Dashboard');
  });

  test('byProject mode renders project headings', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsByProject,
    });

    expect(html).toContain('Impact Case Studies');
    expect(html).toContain('AI Dashboard');
    expect(html).toContain('Mobile App');
    expect(html).toContain('Jane Smith');
    expect(html).toContain('Alex Chen');
  });

  test('handles empty testimonials array', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, testimonials: [] },
    });

    expect(html).toContain('What People Say');
    expect(html).toBeDefined();
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: testimonialsMinimal,
    });
    expect(html).toBeDefined();
  });

  test('masonry variant renders masonry column classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, variant: 'masonry' },
    });

    expect(html).toContain('columns-2xs');
  });

  test('split variant renders single-column review stack', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, variant: 'split' },
    });

    expect(html).toContain('grid-cols-1');
  });

  test('carousel variant renders native carousel markup', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, variant: 'carousel' },
    });

    expect(html).toContain('data-slot="native-carousel"');
    expect(html).toContain('var(--breakpoint-sm)');
  });

  test('marquee variant renders two marquee lanes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, variant: 'marquee' },
    });

    const marqueeLaneCount = (html.match(/group\/marquee/g) ?? []).length;
    expect(marqueeLaneCount).toBe(2);
  });

  test('unknown variant falls back to grid layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, variant: 'legacy-variant' },
    });

    expect(html).toContain('md:grid-cols-2 lg:grid-cols-3');
  });

  test('renders YouTube video facade with video ID', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialsData[0] },
    });
    expect(html).toContain('data-youtube-facade="dQw4w9WgXcQ"');
    expect(html).not.toContain('<iframe');
  });

  test('renders YouTube short URL video facade', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialsData[2] },
    });
    expect(html).toContain('data-youtube-facade="jNQXAC9IVRw"');
  });

  test('uses lazy loading on video thumbnail', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialsData[0] },
    });
    expect(html).toContain('loading="lazy"');
  });

  test('sets accessible aria-label on video facade button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialsData[0] },
    });
    expect(html).toContain('aria-label="Play video: Jane Smith video testimonial"');
  });

  test('does not render facade when videoUrl is null', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialsData[1] },
    });
    expect(html).not.toContain('data-youtube-facade');
  });

  test('renders quote text below video facade', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialsData[0] },
    });
    expect(html).toContain('data-youtube-facade');
    expect(html).toContain('This project transformed our workflow');
  });

  test('renders YouTube embed URL format video facade', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialEmbedUrl },
    });
    expect(html).toContain('data-youtube-facade="L_jWHffIx5E"');
  });

  test('does not render facade for non-YouTube URL', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TestimonialCard, {
      props: { testimonial: testimonialInvalidUrl },
    });
    expect(html).not.toContain('data-youtube-facade');
    expect(html).toContain('Great experience overall');
  });

  test('brutalist-quote variant renders carousel with oversized quotation mark', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, variant: 'brutalist-quote' },
    });

    expect(html).toContain('data-slot="native-carousel"');
    expect(html).toContain('text-[8rem]');
    expect(html).toContain('font-mono');
  });

  test('spotlight variant renders single full-width testimonial', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: { ...testimonialsFull, variant: 'spotlight' },
    });

    expect(html).toContain('w-48 h-48');
    expect(html).toContain('Jane Smith');
    expect(html).toContain('Acme Corp');
  });
});
