/**
 * iCal (RFC 5545) utilities for event export and calendar URL builders.
 * Zero npm dependencies — generates .ics strings inline.
 */

/** Convert ISO 8601 datetime to iCal YYYYMMDDTHHMMSSZ format. */
export function toIcsDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escape text values per RFC 5545 Section 3.3.11 (TEXT). */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Fold content lines at 75 octets per RFC 5545 Section 3.1. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const chars = Array.from(line);
  const parts: string[] = [];
  let offset = 0;
  let isFirst = true;
  while (offset < chars.length) {
    const maxBytes = isFirst ? 75 : 74;
    let byteCount = 0;
    let charCount = 0;
    while (offset + charCount < chars.length) {
      const charBytes = encoder.encode(chars[offset + charCount]).length;
      if (byteCount + charBytes > maxBytes) break;
      byteCount += charBytes;
      charCount++;
    }
    const chunk = chars.slice(offset, offset + charCount).join('');
    parts.push(isFirst ? chunk : ' ' + chunk);
    isFirst = false;
    offset += charCount;
  }
  return parts.join('\r\n');
}

/** Add one hour to an ISO date string, returning a new ISO string (no milliseconds). */
export function addOneHour(isoDate: string): string {
  const d = new Date(isoDate);
  d.setTime(d.getTime() + 60 * 60 * 1000);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Extract domain from a URL string. */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'example.com';
  }
}

interface IcsEventInput {
  _id: string;
  title: string;
  date: string;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
  slug: string;
}

/** Generate a valid RFC 5545 iCalendar string for a single event. */
export function generateIcsString(event: IcsEventInput, siteUrl: string, now?: Date): string {
  const domain = getDomain(siteUrl);
  const eventUrl = `${siteUrl}/events/${event.slug}`;
  const endDate = event.endDate || addOneHour(event.date);
  const dtstamp = now ?? new Date();

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YWCC Industry Capstone//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event._id}@${domain}`,
    `DTSTAMP:${toIcsDate(dtstamp.toISOString())}`,
    `DTSTART:${toIcsDate(event.date)}`,
    `DTEND:${toIcsDate(endDate)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }

  lines.push(`URL:${eventUrl}`);
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

interface GoogleCalendarInput {
  title: string;
  date: string;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
  eventUrl: string;
}

/** Build a Google Calendar "add event" URL. */
export function buildGoogleCalendarUrl(input: GoogleCalendarInput): string {
  const endDate = input.endDate || addOneHour(input.date);
  const dates = `${toIcsDate(input.date)}/${toIcsDate(endDate)}`;

  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', input.title);
  params.set('dates', dates);

  if (input.location) {
    params.set('location', input.location);
  }

  const descParts: string[] = [];
  if (input.description) {
    const desc = input.description.length > 1000 ? input.description.slice(0, 1000) + '...' : input.description;
    descParts.push(desc);
  }
  descParts.push(`\n\nMore info: ${input.eventUrl}`);
  params.set('details', descParts.join('').trim());

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

interface OutlookInput {
  title: string;
  date: string;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
}

/** Build an Outlook Web "add event" URL. */
export function buildOutlookUrl(input: OutlookInput): string {
  const endDate = input.endDate || addOneHour(input.date);

  const params = new URLSearchParams();
  params.set('rru', 'addevent');
  params.set('subject', input.title);
  params.set('startdt', input.date);
  params.set('enddt', endDate);

  if (input.location) {
    params.set('location', input.location);
  }
  if (input.description) {
    const desc = input.description.length > 1000 ? input.description.slice(0, 1000) + '...' : input.description;
    params.set('body', desc);
  }

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}
