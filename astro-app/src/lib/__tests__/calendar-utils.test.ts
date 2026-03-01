import { describe, it, expect } from 'vitest';
import { toCalendarEvent } from '../calendar-utils';
import type { SanityEvent } from '../sanity';

function makeSanityEvent(overrides: Partial<SanityEvent> = {}): SanityEvent {
  return {
    _id: 'evt-001',
    title: 'Test Event',
    slug: 'test-event',
    date: '2026-03-15T14:00:00.000Z',
    endDate: '2026-03-15T16:00:00.000Z',
    location: 'Room 101',
    description: 'A test event for unit testing',
    eventType: 'showcase',
    status: 'upcoming',
    isAllDay: false,
    color: null,
    ...overrides,
  };
}

describe('toCalendarEvent', () => {
  it('transforms a timed Sanity event to Schedule-X format', () => {
    const event = makeSanityEvent();
    const result = toCalendarEvent(event);

    expect(result.id).toBe('evt-001');
    expect(result.title).toBe('Test Event');
    expect(result.calendarId).toBe('showcase');
    expect(result.location).toBe('Room 101');
    expect(result.description).toBe('A test event for unit testing');
    expect(result._meta.slug).toBe('test-event');
    expect(result._meta.isAllDay).toBe(false);
    // Start/end should be Temporal.ZonedDateTime for timed events
    expect(result.start.toString()).toContain('2026-03-15');
    expect(result.end.toString()).toContain('2026-03-15');
  });

  it('transforms an all-day event to use Temporal.PlainDate', () => {
    const event = makeSanityEvent({ isAllDay: true });
    const result = toCalendarEvent(event);

    expect(result._meta.isAllDay).toBe(true);
    // PlainDate toString gives YYYY-MM-DD
    expect(result.start.toString()).toBe('2026-03-15');
    expect(result.end.toString()).toBe('2026-03-15');
  });

  it('maps eventType to calendarId correctly', () => {
    expect(toCalendarEvent(makeSanityEvent({ eventType: 'showcase' })).calendarId).toBe('showcase');
    expect(toCalendarEvent(makeSanityEvent({ eventType: 'networking' })).calendarId).toBe('networking');
    expect(toCalendarEvent(makeSanityEvent({ eventType: 'workshop' })).calendarId).toBe('workshop');
  });

  it('defaults to "showcase" calendarId when eventType is null', () => {
    const result = toCalendarEvent(makeSanityEvent({ eventType: null }));
    expect(result.calendarId).toBe('showcase');
  });

  it('uses color override when present', () => {
    const result = toCalendarEvent(makeSanityEvent({ eventType: 'showcase', color: 'blue' }));
    expect(result.calendarId).toBe('networking'); // blue maps to networking
  });

  it('maps color overrides correctly', () => {
    expect(toCalendarEvent(makeSanityEvent({ color: 'red' })).calendarId).toBe('showcase');
    expect(toCalendarEvent(makeSanityEvent({ color: 'blue' })).calendarId).toBe('networking');
    expect(toCalendarEvent(makeSanityEvent({ color: 'green' })).calendarId).toBe('workshop');
    expect(toCalendarEvent(makeSanityEvent({ color: 'orange' })).calendarId).toBe('workshop');
    expect(toCalendarEvent(makeSanityEvent({ color: 'purple' })).calendarId).toBe('networking');
  });

  it('falls back to eventType when color is unknown', () => {
    const result = toCalendarEvent(makeSanityEvent({ eventType: 'networking', color: 'unknown' as any }));
    expect(result.calendarId).toBe('networking');
  });

  it('handles missing endDate by using date', () => {
    const event = makeSanityEvent({ endDate: null });
    const result = toCalendarEvent(event);
    expect(result.start.toString()).toBe(result.end.toString());
  });

  it('handles null title and location', () => {
    const result = toCalendarEvent(makeSanityEvent({ title: null, location: null }));
    expect(result.title).toBe('');
    expect(result.location).toBeUndefined();
  });

  it('handles null description', () => {
    const result = toCalendarEvent(makeSanityEvent({ description: null }));
    expect(result.description).toBeUndefined();
  });

  it('produces empty people array', () => {
    const result = toCalendarEvent(makeSanityEvent());
    expect(result.people).toEqual([]);
  });
});
