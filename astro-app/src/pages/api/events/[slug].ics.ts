import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllEvents, type SanityEvent } from '@/lib/sanity';
import { generateIcsString } from '@/lib/ical';
import { stegaClean } from '@sanity/client/stega';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await getAllEvents();
  return events
    .filter((event) => event.slug && event.date)
    .map((event) => ({
      params: { slug: stegaClean(event.slug) },
      props: { event },
    }));
};

export const GET: APIRoute = ({ props, site }) => {
  const { event } = props as { event: SanityEvent };
  const siteUrl = site?.origin ?? 'https://ywcc-capstone.pages.dev';

  const cleanEvent = {
    _id: event._id,
    title: stegaClean(event.title) ?? '',
    date: event.date ?? '',
    endDate: event.endDate ?? null,
    location: event.location ? stegaClean(event.location) : null,
    description: event.description ? stegaClean(event.description) : null,
    slug: stegaClean(event.slug) ?? '',
  };

  const icsString = generateIcsString(cleanEvent, siteUrl);
  return new Response(icsString, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${cleanEvent.slug}.ics"`,
    },
  });
};
