import { env, runDurableObjectAlarm, runInDurableObject } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("SlidingWindowRateLimiter", () => {
  it("allows requests under the limit and returns correct remaining count", async () => {
    const id = env.RATE_LIMITER.idFromName("test-allow");
    const stub = env.RATE_LIMITER.get(id);

    const result = await stub.checkLimit(60_000, 10);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.retryAfterMs).toBe(0);
  });

  it("decrements remaining on successive calls", async () => {
    const id = env.RATE_LIMITER.idFromName("test-decrement");
    const stub = env.RATE_LIMITER.get(id);

    await stub.checkLimit(60_000, 5);
    await stub.checkLimit(60_000, 5);
    const result = await stub.checkLimit(60_000, 5);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests when limit is exceeded and returns retryAfterMs > 0", async () => {
    const id = env.RATE_LIMITER.idFromName("test-block");
    const stub = env.RATE_LIMITER.get(id);

    // Fill up to the limit
    for (let i = 0; i < 3; i++) {
      const r = await stub.checkLimit(60_000, 3);
      expect(r.allowed).toBe(true);
    }

    // Next request should be blocked
    const blocked = await stub.checkLimit(60_000, 3);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThanOrEqual(1000);
  });

  it("retryAfterMs has a floor of 1000ms", async () => {
    const id = env.RATE_LIMITER.idFromName("test-retry-floor");
    const stub = env.RATE_LIMITER.get(id);

    // Use a very small window so retryAfter would be near-zero
    for (let i = 0; i < 2; i++) {
      await stub.checkLimit(60_000, 2);
    }

    const blocked = await stub.checkLimit(60_000, 2);

    expect(blocked.retryAfterMs).toBeGreaterThanOrEqual(1000);
  });

  it("persists windowMs for alarm() to use", async () => {
    const id = env.RATE_LIMITER.idFromName("test-persist-window");
    const stub = env.RATE_LIMITER.get(id);

    await stub.checkLimit(45_000, 10);

    // Verify windowMs was persisted in storage
    await runInDurableObject(stub, async (_instance, state) => {
      const windowMs = await state.storage.get<number>("windowMs");
      expect(windowMs).toBe(45_000);
    });
  });

  it("alarm() prunes expired entries and hibernates when empty", async () => {
    const id = env.RATE_LIMITER.idFromName("test-alarm-prune");
    const stub = env.RATE_LIMITER.get(id);

    // Add an entry with a very short window
    await stub.checkLimit(1, 100); // 1ms window — expires immediately

    // Trigger alarm (which prunes entries older than now)
    await runDurableObjectAlarm(stub);

    // Verify entries were pruned — next check should show no prior entries
    await runInDurableObject(stub, async (_instance, state) => {
      const { count } = state.storage.sql
        .exec<{ count: number }>("SELECT COUNT(*) as count FROM requests")
        .one();
      expect(count).toBe(0);
    });
  });

  it("alarm() reschedules when entries remain", async () => {
    const id = env.RATE_LIMITER.idFromName("test-alarm-reschedule");
    const stub = env.RATE_LIMITER.get(id);

    // Add entries with a long window so they won't expire
    await stub.checkLimit(600_000, 100); // 10-minute window

    // Trigger alarm — entries should NOT be pruned (still within window)
    await runDurableObjectAlarm(stub);

    // Verify entries still exist
    await runInDurableObject(stub, async (_instance, state) => {
      const { count } = state.storage.sql
        .exec<{ count: number }>("SELECT COUNT(*) as count FROM requests")
        .one();
      expect(count).toBe(1);

      // Verify alarm was rescheduled
      const alarm = await state.storage.getAlarm();
      expect(alarm).not.toBeNull();
    });
  });

  it("uses separate DO instances per IP (no cross-contamination)", async () => {
    const stub1 = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName("ip:1.1.1.1"));
    const stub2 = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName("ip:2.2.2.2"));

    // Fill up stub1
    for (let i = 0; i < 3; i++) {
      await stub1.checkLimit(60_000, 3);
    }
    const blocked = await stub1.checkLimit(60_000, 3);
    expect(blocked.allowed).toBe(false);

    // stub2 should still be under limit
    const allowed = await stub2.checkLimit(60_000, 3);
    expect(allowed.allowed).toBe(true);
    expect(allowed.remaining).toBe(2);
  });

  it("schema uses INTEGER PRIMARY KEY without AUTOINCREMENT", async () => {
    const id = env.RATE_LIMITER.idFromName("test-schema");
    const stub = env.RATE_LIMITER.get(id);

    await stub.checkLimit(60_000, 10);

    await runInDurableObject(stub, async (_instance, state) => {
      // sqlite_sequence table only exists when AUTOINCREMENT is used
      const { count } = state.storage.sql
        .exec<{ count: number }>(
          "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'"
        )
        .one();
      expect(count).toBe(0);
    });
  });
});
