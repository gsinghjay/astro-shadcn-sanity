import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import Testimonials from '../blocks/custom/Testimonials.astro';
import { testimonialsFull, testimonialsMinimal, testimonialsByProject } from './__fixtures__/testimonials';

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
});
