import type { CalendarEvent } from '@/lib/calendar-utils';

interface EventDetailPopoverProps {
  event: CalendarEvent;
  onClose: () => void;
  position: { top: number; left: number };
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  showcase: 'Showcase',
  networking: 'Networking',
  workshop: 'Workshop',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  showcase: 'bg-red-600 text-white',
  networking: 'bg-blue-600 text-white',
  workshop: 'bg-green-600 text-white',
};

function stripTemporalAnnotation(str: string): string {
  // Temporal.ZonedDateTime.toString() produces "2026-03-15T14:00:00+00:00[UTC]"
  // new Date() can't parse the IANA annotation — strip it
  return str.replace(/\[.*\]$/, '');
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(stripTemporalAnnotation(start));
  const endDate = new Date(stripTemporalAnnotation(end));
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };

  const startDateStr = startDate.toLocaleDateString('en-US', dateOptions);
  const startTimeStr = startDate.toLocaleTimeString('en-US', timeOptions);
  const endTimeStr = endDate.toLocaleTimeString('en-US', timeOptions);

  // Same day
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${startDateStr}, ${startTimeStr} – ${endTimeStr}`;
  }

  const endDateStr = endDate.toLocaleDateString('en-US', dateOptions);
  return `${startDateStr}, ${startTimeStr} – ${endDateStr}, ${endTimeStr}`;
}

export default function EventDetailPopover({ event, onClose, position }: EventDetailPopoverProps) {
  const startStr = event.start?.toString() ?? '';
  const endStr = event.end?.toString() ?? startStr;
  const isAllDay = event._meta?.isAllDay ?? false;
  const slug = event._meta?.slug;
  const description = event.description ?? '';
  const excerpt = description.length > 150 ? description.slice(0, 150) + '…' : description;

  return (
    <div
      data-event-popover
      className="fixed z-50 w-80 border border-border bg-card text-card-foreground shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Title + type badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight">{event.title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Event type badge */}
        <span className={`inline-flex w-fit px-2 py-0.5 text-xs font-medium ${EVENT_TYPE_COLORS[event.calendarId] ?? 'bg-muted text-muted-foreground'}`}>
          {EVENT_TYPE_LABELS[event.calendarId] ?? event.calendarId}
        </span>

        {/* Date/time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" /><path d="M3 10h18" />
          </svg>
          <span>{isAllDay ? 'All day' : formatDateRange(startStr, endStr)}</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}

        {/* Description excerpt */}
        {excerpt && (
          <p className="text-xs text-muted-foreground leading-relaxed">{excerpt}</p>
        )}

        {/* View Details link */}
        {slug && (
          <a
            href={`/events/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
