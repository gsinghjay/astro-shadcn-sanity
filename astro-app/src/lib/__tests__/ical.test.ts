import {
  toIcsDate,
  escapeIcsText,
  foldLine,
  addOneHour,
  generateIcsString,
  buildGoogleCalendarUrl,
  buildOutlookUrl,
} from '@/lib/ical';

describe('toIcsDate', () => {
  test('converts ISO 8601 datetime to iCal format', () => {
    expect(toIcsDate('2026-04-15T14:00:00Z')).toBe('20260415T140000Z');
  });

  test('handles ISO with milliseconds', () => {
    expect(toIcsDate('2026-04-15T14:00:00.000Z')).toBe('20260415T140000Z');
  });

  test('converts midnight time correctly', () => {
    expect(toIcsDate('2026-01-01T00:00:00Z')).toBe('20260101T000000Z');
  });

  test('handles end-of-day time', () => {
    expect(toIcsDate('2026-12-31T23:59:59Z')).toBe('20261231T235959Z');
  });
});

describe('escapeIcsText', () => {
  test('escapes backslashes', () => {
    expect(escapeIcsText('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  test('escapes semicolons', () => {
    expect(escapeIcsText('first;second')).toBe('first\\;second');
  });

  test('escapes commas', () => {
    expect(escapeIcsText('one,two,three')).toBe('one\\,two\\,three');
  });

  test('escapes newlines', () => {
    expect(escapeIcsText('line1\nline2')).toBe('line1\\nline2');
  });

  test('escapes Windows-style newlines', () => {
    expect(escapeIcsText('line1\r\nline2')).toBe('line1\\nline2');
  });

  test('handles combined special characters', () => {
    expect(escapeIcsText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
  });

  test('leaves plain text unchanged', () => {
    expect(escapeIcsText('Hello World')).toBe('Hello World');
  });
});

describe('foldLine', () => {
  test('returns short lines unchanged', () => {
    const short = 'SUMMARY:Short Event Title';
    expect(foldLine(short)).toBe(short);
  });

  test('returns exactly 75-char line unchanged', () => {
    const line = 'A'.repeat(75);
    expect(foldLine(line)).toBe(line);
  });

  test('folds line exceeding 75 octets with CRLF + space', () => {
    const line = 'DESCRIPTION:' + 'A'.repeat(100);
    const folded = foldLine(line);
    // First line: 75 chars
    // Continuation: CRLF + space + remaining
    expect(folded.startsWith(line.slice(0, 75))).toBe(true);
    expect(folded).toContain('\r\n ');
  });

  test('continuation lines do not exceed 75 octets', () => {
    const line = 'DESCRIPTION:' + 'B'.repeat(200);
    const folded = foldLine(line);
    const encoder = new TextEncoder();
    const parts = folded.split('\r\n');
    expect(encoder.encode(parts[0]).length).toBe(75);
    for (let i = 1; i < parts.length; i++) {
      expect(encoder.encode(parts[i]).length).toBeLessThanOrEqual(75);
      expect(parts[i].startsWith(' ')).toBe(true);
    }
  });

  test('folds correctly with multi-byte UTF-8 characters', () => {
    // Each 'é' is 2 bytes in UTF-8; 'LOCATION:' (9 bytes) + 40 × 'é' (80 bytes) = 89 bytes but only 49 chars
    const line = 'LOCATION:' + 'é'.repeat(40);
    const folded = foldLine(line);
    expect(folded).toContain('\r\n ');
    const encoder = new TextEncoder();
    const parts = folded.split('\r\n');
    for (const part of parts) {
      expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
    }
  });
});

describe('addOneHour', () => {
  test('adds one hour to ISO date', () => {
    expect(addOneHour('2026-04-15T14:00:00Z')).toBe('2026-04-15T15:00:00Z');
  });

  test('handles day rollover', () => {
    expect(addOneHour('2026-04-15T23:30:00Z')).toBe('2026-04-16T00:30:00Z');
  });

  test('strips milliseconds from output', () => {
    expect(addOneHour('2026-04-15T14:00:00.123Z')).toBe('2026-04-15T15:00:00Z');
  });
});

describe('generateIcsString', () => {
  const fullEvent = {
    _id: 'event-1',
    title: 'Spring Showcase 2026',
    date: '2026-04-15T14:00:00Z',
    endDate: '2026-04-15T18:00:00Z',
    location: 'NJIT Campus Center Ballroom',
    description: 'Join us for our Spring 2026 Capstone Showcase.',
    slug: 'spring-showcase-2026',
  };
  const siteUrl = 'https://ywcc-capstone.pages.dev';

  test('produces valid iCal output with all fields populated', () => {
    const now = new Date('2026-03-01T12:00:00Z');
    const ics = generateIcsString(fullEvent, siteUrl, now);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//YWCC Industry Capstone//Events//EN');
    expect(ics).toContain('CALSCALE:GREGORIAN');
    expect(ics).toContain('METHOD:PUBLISH');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Spring Showcase 2026');
    expect(ics).toContain('DTSTART:20260415T140000Z');
    expect(ics).toContain('DTEND:20260415T180000Z');
    expect(ics).toContain('LOCATION:NJIT Campus Center Ballroom');
    expect(ics).toContain('DESCRIPTION:Join us for our Spring 2026 Capstone Showcase.');
    expect(ics).toContain('URL:https://ywcc-capstone.pages.dev/events/spring-showcase-2026');
    expect(ics).toContain('UID:event-1@ywcc-capstone.pages.dev');
    expect(ics).toContain('DTSTAMP:20260301T120000Z');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  test('uses CRLF line endings', () => {
    const ics = generateIcsString(fullEvent, siteUrl, new Date('2026-03-01T12:00:00Z'));
    // Every line should end with \r\n (but not \n without \r)
    const lines = ics.split('\r\n');
    expect(lines.length).toBeGreaterThan(1);
    // No bare \n (that isn't part of \r\n)
    const withoutCrlf = ics.replace(/\r\n/g, '');
    expect(withoutCrlf).not.toContain('\n');
  });

  test('handles missing optional fields', () => {
    const minimalEvent = {
      _id: 'event-4',
      title: 'Fall 2025 Showcase',
      date: '2025-12-05T14:00:00Z',
      endDate: null as string | null,
      location: null as string | null,
      description: null as string | null,
      slug: 'fall-2025-showcase',
    };

    const ics = generateIcsString(minimalEvent, siteUrl, new Date('2026-03-01T12:00:00Z'));
    expect(ics).toContain('SUMMARY:Fall 2025 Showcase');
    expect(ics).toContain('DTSTART:20251205T140000Z');
    // DTEND defaults to DTSTART + 1 hour
    expect(ics).toContain('DTEND:20251205T150000Z');
    expect(ics).not.toContain('LOCATION:');
    expect(ics).not.toContain('DESCRIPTION:');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
  });

  test('UID uses event _id and domain', () => {
    const ics = generateIcsString(fullEvent, siteUrl, new Date('2026-03-01T12:00:00Z'));
    expect(ics).toContain('UID:event-1@ywcc-capstone.pages.dev');
  });
});

describe('buildGoogleCalendarUrl', () => {
  test('generates correct URL with all params', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Spring Showcase 2026',
      date: '2026-04-15T14:00:00Z',
      endDate: '2026-04-15T18:00:00Z',
      location: 'NJIT Campus Center Ballroom',
      description: 'Join us for the showcase.',
      eventUrl: 'https://ywcc-capstone.pages.dev/events/spring-showcase-2026',
    });

    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('text=Spring+Showcase+2026');
    expect(url).toContain('dates=20260415T140000Z%2F20260415T180000Z');
    expect(url).toContain('location=NJIT+Campus+Center+Ballroom');
    expect(url).toContain('details=');
  });

  test('defaults endDate to startDate + 1 hour when missing', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: null,
      eventUrl: 'https://example.com/events/test',
    });

    expect(url).toContain('dates=20260415T140000Z%2F20260415T150000Z');
  });

  test('omits optional params when null', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: null,
      eventUrl: 'https://example.com/events/test',
    });

    expect(url).not.toContain('location=');
  });

  test('appends event URL to description', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: 'Event details here.',
      eventUrl: 'https://example.com/events/test',
    });

    const parsed = new URL(url);
    const details = parsed.searchParams.get('details') ?? '';
    expect(details).toContain('Event details here.');
    expect(details).toContain('https://example.com/events/test');
  });

  test('includes event URL in details when description is null', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: null,
      eventUrl: 'https://example.com/events/test',
    });

    const parsed = new URL(url);
    const details = parsed.searchParams.get('details') ?? '';
    expect(details).toContain('https://example.com/events/test');
  });

  test('truncates description exceeding 1000 chars', () => {
    const longDesc = 'A'.repeat(1100);
    const url = buildGoogleCalendarUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: longDesc,
      eventUrl: 'https://example.com/events/test',
    });

    const parsed = new URL(url);
    const details = parsed.searchParams.get('details') ?? '';
    expect(details).toContain('...');
    expect(details).not.toContain('A'.repeat(1100));
  });
});

describe('buildOutlookUrl', () => {
  test('generates correct URL with all params', () => {
    const url = buildOutlookUrl({
      title: 'Spring Showcase 2026',
      date: '2026-04-15T14:00:00Z',
      endDate: '2026-04-15T18:00:00Z',
      location: 'NJIT Campus Center Ballroom',
      description: 'Join us for the showcase.',
    });

    expect(url).toContain('https://outlook.live.com/calendar/0/action/compose');
    expect(url).toContain('rru=addevent');
    expect(url).toContain('subject=Spring+Showcase+2026');
    expect(url).toContain('startdt=2026-04-15T14%3A00%3A00Z');
    expect(url).toContain('enddt=2026-04-15T18%3A00%3A00Z');
    expect(url).toContain('location=NJIT+Campus+Center+Ballroom');
    expect(url).toContain('body=Join+us+for+the+showcase.');
  });

  test('defaults endDate to startDate + 1 hour when missing', () => {
    const url = buildOutlookUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: null,
    });

    expect(url).toContain('enddt=2026-04-15T15%3A00%3A00Z');
  });

  test('omits optional params when null', () => {
    const url = buildOutlookUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: null,
    });

    expect(url).not.toContain('location=');
    expect(url).not.toContain('body=');
  });

  test('truncates description exceeding 1000 chars', () => {
    const longDesc = 'B'.repeat(1100);
    const url = buildOutlookUrl({
      title: 'Test Event',
      date: '2026-04-15T14:00:00Z',
      endDate: null,
      location: null,
      description: longDesc,
    });

    const parsed = new URL(url);
    const body = parsed.searchParams.get('body') ?? '';
    expect(body).toContain('...');
    expect(body).not.toContain('B'.repeat(1100));
  });
});
