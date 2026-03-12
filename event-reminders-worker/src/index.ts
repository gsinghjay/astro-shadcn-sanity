import { Resend } from 'resend';

export interface Env {
  DB: D1Database;
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  SANITY_API_TOKEN: string;
  DISCORD_WEBHOOK_URL: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL?: string;
}

export interface SanityEvent {
  _id: string;
  title: string;
  slug: string;
  date: string;
  endDate: string | null;
  location: string | null;
  eventType: string | null;
  description: string | null;
}

export interface Subscriber {
  id: number;
  email: string;
  discord_user_id: string | null;
  remind_days_before: number;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function fetchUpcomingEvents(env: Env, maxDate: string): Promise<SanityEvent[]> {
  const query = encodeURIComponent(
    `*[_type == "event" && status == "upcoming" && date >= now() && date <= $maxDate]{
      _id, title, "slug": slug.current, date, endDate, location, eventType, description
    }`,
  );
  const maxDateParam = encodeURIComponent(JSON.stringify(maxDate));
  const url = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${env.SANITY_DATASET}?query=${query}&$maxDate=${maxDateParam}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.SANITY_API_TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`Sanity API error: ${res.status}`);
  }

  const data = (await res.json()) as { result: SanityEvent[] };
  return data.result;
}

export async function fetchSubscribers(env: Env): Promise<Subscriber[]> {
  const result = await env.DB.prepare(
    'SELECT id, email, discord_user_id, remind_days_before FROM subscribers WHERE active = 1',
  ).all<Subscriber>();
  return result.results;
}

export async function alreadySent(
  env: Env,
  eventId: string,
  subscriberId: number,
): Promise<{ discord: boolean; email: boolean }> {
  const result = await env.DB.prepare(
    'SELECT channel FROM sent_reminders WHERE event_id = ? AND subscriber_id = ?',
  )
    .bind(eventId, subscriberId)
    .all<{ channel: string }>();
  const channels = result.results.map((r) => r.channel);
  return { discord: channels.includes('discord'), email: channels.includes('email') };
}

/** Check if a channel-level notification (subscriber_id=0) was already sent for an event. */
export async function isChannelSent(env: Env, eventId: string, channel: string): Promise<boolean> {
  const result = await env.DB.prepare(
    'SELECT 1 FROM sent_reminders WHERE event_id = ? AND subscriber_id = 0 AND channel = ? LIMIT 1',
  )
    .bind(eventId, channel)
    .first<Record<string, number>>();
  return result !== null;
}

export async function recordSent(env: Env, eventId: string, subscriberId: number, channel: string): Promise<void> {
  await env.DB.prepare('INSERT OR IGNORE INTO sent_reminders (event_id, subscriber_id, channel) VALUES (?, ?, ?)')
    .bind(eventId, subscriberId, channel)
    .run();
}

const BADGE_COLORS: Record<string, number> = {
  showcase: 0x7c3aed,
  networking: 0x2563eb,
  workshop: 0x16a34a,
};

function formatEventDate(dateStr: string): string {
  const eventDate = new Date(dateStr);
  return eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function sendDiscordReminder(env: Env, evt: SanityEvent): Promise<void> {
  const color = evt.eventType ? BADGE_COLORS[evt.eventType] ?? 0x6b7280 : 0x6b7280;
  const formatted = formatEventDate(evt.date);

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: `📅 Upcoming: ${evt.title}`,
          color,
          fields: [
            { name: 'Date', value: formatted, inline: true },
            { name: 'Type', value: evt.eventType ?? 'Event', inline: true },
            ...(evt.location ? [{ name: 'Location', value: evt.location, inline: true }] : []),
            ...(evt.description ? [{ name: 'Details', value: evt.description.slice(0, 1024) }] : []),
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
}

export async function sendEmailReminder(env: Env, toEmail: string, evt: SanityEvent): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);
  const formatted = formatEventDate(evt.date);
  const fromAddress = env.RESEND_FROM_EMAIL || 'YWCC Capstone <noreply@ywcc-capstone.pages.dev>';

  const safeTitle = escapeHtml(evt.title);
  const safeLocation = evt.location ? escapeHtml(evt.location) : null;
  const safeEventType = evt.eventType ? escapeHtml(evt.eventType) : null;
  const safeDescription = evt.description ? escapeHtml(evt.description) : null;

  await resend.emails.send({
    from: fromAddress,
    to: toEmail,
    subject: `Reminder: ${evt.title} on ${formatted}`,
    html: `
      <h2>${safeTitle}</h2>
      <p><strong>Date:</strong> ${escapeHtml(formatted)}</p>
      ${safeLocation ? `<p><strong>Location:</strong> ${safeLocation}</p>` : ''}
      ${safeEventType ? `<p><strong>Type:</strong> ${safeEventType}</p>` : ''}
      ${safeDescription ? `<p>${safeDescription}</p>` : ''}
      <p><a href="https://ywcc-capstone.com">View on site</a></p>
    `,
  });
}

async function runScheduled(env: Env, scheduledTime?: number): Promise<void> {
  const maxDays = 30;
  const now = scheduledTime ? new Date(scheduledTime) : new Date();
  const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch upcoming events from Sanity
  const events = await fetchUpcomingEvents(env, maxDate);
  console.log(`[cron] Found ${events.length} upcoming events within ${maxDays} days`);
  if (events.length === 0) return;

  // 2. Fetch active subscribers
  const subscribers = await fetchSubscribers(env);
  console.log(`[cron] Found ${subscribers.length} active subscribers`);
  if (subscribers.length === 0) return;

  // 3. Determine which events fall within any subscriber's reminder window
  const maxRemindDays = Math.max(...subscribers.map((s) => s.remind_days_before));
  const widestThreshold = new Date(now.getTime() + maxRemindDays * 24 * 60 * 60 * 1000);
  const relevantEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate >= now && eventDate <= widestThreshold;
  });

  // 4. Discord: send once per event (channel-level, subscriber_id=0)
  if (env.DISCORD_WEBHOOK_URL) {
    for (const evt of relevantEvents) {
      const sent = await isChannelSent(env, evt._id, 'discord');
      if (!sent) {
        try {
          await sendDiscordReminder(env, evt);
          await recordSent(env, evt._id, 0, 'discord');
        } catch (err) {
          console.error(`Discord send failed for event ${evt._id}:`, err);
        }
      }
    }
  }

  // 5. Email: per-subscriber, within each subscriber's reminder window
  for (const sub of subscribers) {
    const threshold = new Date(now.getTime() + sub.remind_days_before * 24 * 60 * 60 * 1000);
    const matched = relevantEvents.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= now && eventDate <= threshold;
    });

    for (const evt of matched) {
      const already = await alreadySent(env, evt._id, sub.id);
      if (!already.email && sub.email) {
        try {
          await sendEmailReminder(env, sub.email, evt);
          await recordSent(env, evt._id, sub.id, 'email');
        } catch (err) {
          console.error(`Email send failed for ${sub.email}, event ${evt._id}:`, err);
        }
      }
    }
  }
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await runScheduled(env, event.scheduledTime);
  },
};
