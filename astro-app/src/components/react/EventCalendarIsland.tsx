import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid, createViewMonthAgenda } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { isCalendarView } from '@/stores/calendarStore';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';

interface SanityEventData {
  _id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  endDate: string | null;
  eventType: string | null;
}

/** Strip stega invisible characters from a string. */
function clean(val: string | null): string {
  if (!val) return '';
  // Remove zero-width and invisible unicode characters used by stega
  return val.replace(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFE00-\uFE0F\uDB40-\uDBFF][\uDC00-\uDFFF]?/g, '');
}

/** Map eventType to calendarId for color-coding. */
function getCalendarId(eventType: string | null): string {
  const cleaned = clean(eventType);
  switch (cleaned) {
    case 'showcase':
      return 'showcase';
    case 'networking':
      return 'networking';
    case 'workshop':
      return 'workshop';
    default:
      return 'showcase';
  }
}

/** Parse ISO date string to Temporal.ZonedDateTime via global Temporal. */
function toTemporal(dateStr: string) {
  const cleaned = clean(dateStr);
  const instant = Temporal.Instant.from(cleaned);
  return instant.toZonedDateTimeISO('UTC');
}

/** Transform Sanity event to Schedule-X event format. */
function toCalendarEvent(event: SanityEventData) {
  const now = Temporal.Now.zonedDateTimeISO('UTC');
  const startStr = clean(event.date);
  const endStr = clean(event.endDate) || startStr;
  return {
    id: clean(event._id),
    title: clean(event.title) || 'Untitled Event',
    start: startStr ? toTemporal(startStr) : now,
    end: endStr ? toTemporal(endStr) : now,
    calendarId: getCalendarId(event.eventType),
    _customContent: { slug: clean(event.slug) },
  };
}

/** Detect dark mode from the document root element. */
function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export default function EventCalendarIsland({ events }: { events: string }) {
  const showCalendar = useStore(isCalendarView);
  const [dark, setDark] = useState(false);

  const parsedEvents = useMemo(() => {
    const raw: SanityEventData[] = JSON.parse(events);
    return raw.map(toCalendarEvent);
  }, [events]);

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewMonthAgenda()],
    events: parsedEvents,
    plugins: [eventsService],
    isDark: dark,
    calendars: {
      showcase: {
        colorName: 'showcase',
        lightColors: {
          main: '#dc2626',
          container: '#fde2e2',
          onContainer: '#7f1d1d',
        },
        darkColors: {
          main: '#fca5a5',
          onContainer: '#fde2e2',
          container: '#991b1b',
        },
      },
      networking: {
        colorName: 'networking',
        lightColors: {
          main: '#2563eb',
          container: '#dbeafe',
          onContainer: '#1e3a5f',
        },
        darkColors: {
          main: '#93c5fd',
          onContainer: '#dbeafe',
          container: '#1e40af',
        },
      },
      workshop: {
        colorName: 'workshop',
        lightColors: {
          main: '#16a34a',
          container: '#dcfce7',
          onContainer: '#14532d',
        },
        darkColors: {
          main: '#86efac',
          onContainer: '#dcfce7',
          container: '#166534',
        },
      },
    },
    callbacks: {
      onEventClick(calendarEvent) {
        const slug = (calendarEvent as any)._customContent?.slug;
        if (slug) {
          window.location.href = `/events/${slug}`;
        }
      },
    },
  });

  // Sync dark mode on mount and when it changes
  useEffect(() => {
    setDark(isDarkMode());

    const observer = new MutationObserver(() => {
      const nowDark = isDarkMode();
      setDark(nowDark);
      if (calendar) calendar.setTheme(nowDark ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [calendar]);

  if (!showCalendar) return null;

  return (
    <div className="sx-calendar-wrapper">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
          Showcase
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-600" />
          Networking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-green-600" />
          Workshop
        </span>
      </div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
