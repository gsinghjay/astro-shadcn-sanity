import { stegaClean } from '@sanity/client/stega';
import { Temporal } from 'temporal-polyfill';
import type { SanityEvent } from './sanity';

/**
 * Map semantic event category → Schedule-X calendarId for color-coding.
 * Category lives in the schema; calendarId drives the calendar color in the frontend.
 */
const CATEGORY_TO_CALENDAR_ID: Record<string, string> = {
  workshop: 'workshop',
  lecture: 'networking',
  social: 'showcase',
  competition: 'showcase',
  other: 'workshop',
};

/**
 * Convert a Sanity ISO datetime string to a Temporal.PlainDate (all-day)
 * or Temporal.ZonedDateTime (timed).
 */
function toTemporalDate(isoString: string, isAllDay: boolean): Temporal.PlainDate | Temporal.ZonedDateTime {
  if (isAllDay) {
    return Temporal.PlainDate.from(isoString.slice(0, 10));
  }
  return Temporal.Instant.from(isoString).toZonedDateTimeISO('UTC');
}

export function toCalendarEvent(event: SanityEvent) {
  const eventType = stegaClean(event.eventType) ?? 'showcase';
  const category = stegaClean(event.category);
  const calendarId = category ? (CATEGORY_TO_CALENDAR_ID[category] ?? eventType) : eventType;
  const isAllDay = event.isAllDay ?? false;
  const dateStr = stegaClean(event.date) ?? '';
  const endDateStr = stegaClean(event.endDate) ?? dateStr;
  const now = Temporal.Now.zonedDateTimeISO('UTC');

  return {
    id: stegaClean(event._id) ?? event._id,
    title: stegaClean(event.title) ?? '',
    start: dateStr ? toTemporalDate(dateStr, isAllDay) : now,
    end: endDateStr ? toTemporalDate(endDateStr, isAllDay) : now,
    calendarId,
    location: stegaClean(event.location) ?? undefined,
    description: stegaClean(event.description) ?? undefined,
    people: [] as string[],
    _meta: { slug: stegaClean(event.slug), isAllDay },
  };
}

export type CalendarEvent = ReturnType<typeof toCalendarEvent>;
