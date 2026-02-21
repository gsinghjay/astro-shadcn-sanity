import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import EventCard from '../EventCard.astro';
import { eventsData } from './__fixtures__/events';

describe('EventsPage — EventCard rendering', () => {
  test('renders event card with title, date, location, and badge', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventCard, {
      props: { event: eventsData[0] },
    });

    expect(html).toContain('Spring Showcase 2026');
    expect(html).toContain('datetime="2026-04-15T14:00:00Z"');
    expect(html).toContain('NJIT Campus Center Ballroom');
    expect(html).toContain('showcase');
    expect(html).toContain('/events/spring-showcase-2026');
  });

  test('renders all event types with correct links', async () => {
    const container = await AstroContainer.create();

    for (const event of eventsData) {
      const html = await container.renderToString(EventCard, {
        props: { event },
      });

      // HTML-escape title for comparison (& → &amp;)
      const escapedTitle = event.title?.replace(/&/g, '&amp;') ?? '';
      expect(html).toContain(escapedTitle);
      expect(html).toContain(`/events/${event.slug}`);
    }
  });

  test('renders event card without optional fields', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventCard, {
      props: { event: eventsData[3] },
    });

    expect(html).toContain('Fall 2025 Showcase');
    expect(html).not.toContain('null');
  });

  test('renders color-coded badges per event type', async () => {
    const container = await AstroContainer.create();

    // showcase
    const showcaseHtml = await container.renderToString(EventCard, {
      props: { event: eventsData[0] },
    });
    expect(showcaseHtml).toContain('bg-primary/10');

    // networking
    const networkingHtml = await container.renderToString(EventCard, {
      props: { event: eventsData[1] },
    });
    expect(networkingHtml).toContain('bg-blue-100');

    // workshop
    const workshopHtml = await container.renderToString(EventCard, {
      props: { event: eventsData[2] },
    });
    expect(workshopHtml).toContain('bg-green-100');
  });
});
