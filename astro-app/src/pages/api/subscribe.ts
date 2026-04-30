import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const MAX_SUBSCRIPTIONS_PER_HOUR = 10;

const jsonResponse = (body: { success: boolean; error?: string }, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; discord_user_id?: string; remind_days_before?: number };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
  }

  const email = body.email?.trim() ?? '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ success: false, error: 'Valid email required' }, 400);
  }

  const remindDays = body.remind_days_before ?? 7;
  if (remindDays < 1 || remindDays > 30) {
    return jsonResponse({ success: false, error: 'remind_days_before must be 1-30' }, 400);
  }

  // Basic rate limiting: cap total subscriptions per hour
  try {
    const recent = await env.PORTAL_DB.prepare(
      "SELECT COUNT(*) as count FROM subscribers WHERE subscribed_at > datetime('now', '-1 hour')",
    ).first<{ count: number }>();
    if (recent && recent.count >= MAX_SUBSCRIPTIONS_PER_HOUR) {
      return jsonResponse({ success: false, error: 'Too many subscriptions. Try again later.' }, 429);
    }
  } catch {
    // If rate limit check fails, proceed with the subscription
  }

  try {
    await env.PORTAL_DB.prepare('INSERT INTO subscribers (email, discord_user_id, remind_days_before) VALUES (?, ?, ?)')
      .bind(email, body.discord_user_id ?? null, remindDays)
      .run();
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('UNIQUE constraint')) {
      return jsonResponse({ success: false, error: 'Email already subscribed' }, 409);
    }
    return jsonResponse({ success: false, error: 'Subscription failed' }, 500);
  }

  return jsonResponse({ success: true }, 200);
};

export const DELETE: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim() ?? '';
  if (!email) {
    return jsonResponse({ success: false, error: 'Email required' }, 400);
  }

  try {
    await env.PORTAL_DB.prepare('UPDATE subscribers SET active = 0 WHERE email = ?').bind(email).run();
  } catch {
    return jsonResponse({ success: false, error: 'Unsubscribe failed' }, 500);
  }

  return jsonResponse({ success: true }, 200);
};
