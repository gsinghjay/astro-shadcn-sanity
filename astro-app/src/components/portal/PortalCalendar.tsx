import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';

import { toCalendarEvent } from '@/lib/calendar-utils';
import type { SanityEvent } from '@/lib/sanity';
import type { CalendarEvent } from '@/lib/calendar-utils';
import EventDetailPopover from './EventDetailPopover';

interface PortalCalendarProps {
  events: string; // JSON-serialized SanityEvent[]
}

function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export default function PortalCalendar({ events }: PortalCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [dark, setDark] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const parsedEvents = useMemo(() => {
    const raw: SanityEvent[] = JSON.parse(events);
    return raw.map(toCalendarEvent);
  }, [events]);

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: parsedEvents,
    plugins: [eventsService],
    isDark: dark,
    calendars: {
      showcase: {
        colorName: 'showcase',
        lightColors: { main: '#dc2626', container: '#fef2f2', onContainer: '#991b1b' },
        darkColors: { main: '#f87171', container: '#450a0a', onContainer: '#fecaca' },
      },
      networking: {
        colorName: 'networking',
        lightColors: { main: '#2563eb', container: '#eff6ff', onContainer: '#1e40af' },
        darkColors: { main: '#60a5fa', container: '#172554', onContainer: '#bfdbfe' },
      },
      workshop: {
        colorName: 'workshop',
        lightColors: { main: '#16a34a', container: '#f0fdf4', onContainer: '#166534' },
        darkColors: { main: '#4ade80', container: '#052e16', onContainer: '#bbf7d0' },
      },
    },
    callbacks: {
      onEventClick(calendarEvent) {
        // Schedule-X preserves extra properties (_meta) on event objects
        const event = calendarEvent as CalendarEvent;
        if (!event._meta) return;
        setSelectedEvent(event);
        setPopoverPosition({
          top: Math.min(window.innerHeight - 400, window.innerHeight / 3),
          left: Math.min(window.innerWidth - 340, window.innerWidth / 2 - 160),
        });
      },
      onRangeUpdate(range) {
        // range.start/end are ISO-like strings from Schedule-X
        fetchEventsForRange(String(range.start), String(range.end));
      },
    },
  });

  // Sync dark mode on mount and when .dark class toggles
  useEffect(() => {
    const initialDark = isDarkMode();
    setDark(initialDark);
    if (calendar) calendar.setTheme(initialDark ? 'dark' : 'light');

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

  // Fetch additional events when user navigates to a different month
  const fetchEventsForRange = useCallback(
    async (start: string, end: string) => {
      try {
        const params = new URLSearchParams({ start, end });
        const response = await fetch(`/portal/api/events?${params}`);
        if (!response.ok) return;

        const newEvents = (await response.json()) as SanityEvent[];
        const calendarEvents = newEvents.map(toCalendarEvent);

        const existingIds = new Set(eventsService.getAll().map((e: { id: string }) => e.id));
        for (const event of calendarEvents) {
          if (!existingIds.has(event.id)) {
            eventsService.add(event);
          }
        }
      } catch {
        // Silently fail — calendar will still show initially loaded events
      }
    },
    [eventsService],
  );

  // Close popover on click outside
  useEffect(() => {
    if (!selectedEvent) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-event-popover]')) {
        setSelectedEvent(null);
      }
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [selectedEvent]);

  // Close popover on Escape
  useEffect(() => {
    if (!selectedEvent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEvent(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvent]);

  return (
    <div ref={calendarRef} className="sx-react-calendar-wrapper relative">
      {/* Event type legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 bg-red-600" />
          Showcase
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 bg-blue-600" />
          Networking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 bg-green-600" />
          Workshop
        </span>
      </div>

      <ScheduleXCalendar calendarApp={calendar} />

      {selectedEvent && (
        <EventDetailPopover
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          position={popoverPosition}
        />
      )}
    </div>
  );
}
