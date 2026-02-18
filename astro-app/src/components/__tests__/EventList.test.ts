import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import EventList from '../blocks/custom/EventList.astro';
import { eventsFull, eventsMinimal, eventsAll, eventsPast, eventsData } from './__fixtures__/events';

describe('EventList', () => {
  test('renders heading and event titles', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: eventsFull,
    });

    expect(html).toContain('Upcoming Events');
    expect(html).toContain('Spring Showcase 2026');
    expect(html).toContain('Sponsor Networking Mixer');
    expect(html).toContain('Agile Methods Workshop');
  });

  test('renders event dates', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: eventsFull,
    });

    // Check date formatting — datetime attribute preserved
    expect(html).toContain('datetime="2026-04-15T14:00:00Z"');
    expect(html).toContain('datetime="2026-03-20T17:30:00Z"');
  });

  test('renders event locations', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: eventsFull,
    });

    expect(html).toContain('NJIT Campus Center Ballroom');
    expect(html).toContain('Ying Wu College of Computing');
    expect(html).toContain('Virtual (Zoom)');
  });

  test('renders event type badges', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: eventsAll,
    });

    expect(html).toContain('showcase');
    expect(html).toContain('networking');
    expect(html).toContain('workshop');
  });

  test('truncates long descriptions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: eventsAll,
    });

    // event-5 has description > 150 chars — should be truncated with '...'
    expect(html).toContain('...');
    // Should NOT contain the full long description
    expect(html).not.toContain('and more practical techniques.');
  });

  test('renders past events', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: eventsPast,
    });

    expect(html).toContain('Past Events');
    expect(html).toContain('Git &amp; CI/CD Workshop');
    expect(html).toContain('Fall 2025 Showcase');
  });

  test('renders empty state message when no events', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: { ...eventsFull, events: [] },
    });

    expect(html).toContain('Upcoming Events');
    expect(html).toContain('No events to display.');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EventList, {
      props: eventsMinimal,
    });
    expect(html).toBeDefined();
    expect(html).toContain('No events to display.');
  });

  test('renders events without optional fields', async () => {
    const container = await AstroContainer.create();
    // event-4 has no location, description, or endDate
    const html = await container.renderToString(EventList, {
      props: {
        ...eventsFull,
        events: [eventsData[3]],
      },
    });

    expect(html).toContain('Fall 2025 Showcase');
    // Should not contain location or description text
    expect(html).not.toContain('text-muted-foreground">null</p>');
  });
});
