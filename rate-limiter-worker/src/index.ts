import { DurableObject } from "cloudflare:workers";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export class SlidingWindowRateLimiter extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp_ms INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_requests_ts ON requests(timestamp_ms);
    `);
  }

  async checkLimit(windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Prune expired entries and count current window in one coalesced transaction
    this.ctx.storage.sql.exec("DELETE FROM requests WHERE timestamp_ms < ?", windowStart);

    const { count } = this.ctx.storage.sql
      .exec<{ count: number }>("SELECT COUNT(*) as count FROM requests WHERE timestamp_ms >= ?", windowStart)
      .one();

    if (count >= maxRequests) {
      // Find the oldest entry to calculate retry-after
      const oldest = this.ctx.storage.sql
        .exec<{ timestamp_ms: number }>("SELECT timestamp_ms FROM requests ORDER BY timestamp_ms ASC LIMIT 1")
        .one();

      const retryAfterMs = oldest.timestamp_ms + windowMs - now;

      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(retryAfterMs, 1000),
      };
    }

    // Record this request
    this.ctx.storage.sql.exec("INSERT INTO requests (timestamp_ms) VALUES (?)", now);

    // Schedule alarm for cleanup after the window expires
    const currentAlarm = await this.ctx.storage.getAlarm();
    if (currentAlarm === null) {
      await this.ctx.storage.setAlarm(now + windowMs);
    }

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      retryAfterMs: 0,
    };
  }

  async alarm(): Promise<void> {
    const now = Date.now();
    // Prune all expired entries
    this.ctx.storage.sql.exec("DELETE FROM requests WHERE timestamp_ms < ?", now);

    // Check if any entries remain
    const { count } = this.ctx.storage.sql
      .exec<{ count: number }>("SELECT COUNT(*) as count FROM requests")
      .one();

    if (count > 0) {
      // Find the oldest remaining entry to schedule next cleanup
      const oldest = this.ctx.storage.sql
        .exec<{ timestamp_ms: number }>("SELECT timestamp_ms FROM requests ORDER BY timestamp_ms ASC LIMIT 1")
        .one();

      // Schedule next alarm for when the oldest entry expires
      // Using a generous window — entries from `oldest.timestamp_ms` will expire
      // after 60s (the default window). We don't know the exact windowMs here,
      // so schedule for oldest + 60_000 as a reasonable default.
      await this.ctx.storage.setAlarm(oldest.timestamp_ms + 60_000);
    }
    // If count === 0, don't reschedule — DO will hibernate automatically
  }
}

interface Env {
  RATE_LIMITER: DurableObjectNamespace<SlidingWindowRateLimiter>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Minimal fetch handler — this worker is primarily used via RPC from the main app.
    // Direct HTTP access returns a simple status response.
    return new Response("rate-limiter-worker OK", { status: 200 });
  },
};
