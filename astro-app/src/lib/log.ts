/**
 * Structured JSON logging helper for Workers Logs.
 *
 * Each method emits a single-line JSON object via `console.{log,warn,error}` so
 * the Workers Logs UI can parse `level` / `msg` / arbitrary fields as searchable
 * columns. Use stable, short `msg` keys (e.g. `'middleware-kv-write-failed'`) —
 * those become the primary filter axis in the dashboard.
 *
 * Never put secret values in `fields`. For session tokens, log a short hash via
 * a helper rather than the raw cookie value.
 */
export type LogFields = Record<string, string | number | boolean | null | undefined>;

/** Serialize a log payload, falling back to a degraded line if the payload
 *  contains BigInt, circular refs, or anything else `JSON.stringify` rejects.
 *  `LogFields` bans BigInt at compile time but propagated `err.cause` chains
 *  and future callers can still reach this path at runtime — failing the log
 *  call would convert any caught error into an uncaught exception inside the
 *  middleware top-level catch. Better a degraded log than a 500. */
function safeStringify(payload: Record<string, unknown>): string {
  try {
    return JSON.stringify(payload);
  } catch {
    return JSON.stringify({
      level: typeof payload.level === 'string' ? payload.level : 'error',
      msg: typeof payload.msg === 'string' ? payload.msg : 'log-serialization-failed',
      serializationError: true,
    });
  }
}

export const log = {
  info: (msg: string, fields?: LogFields) =>
    console.log(safeStringify({ level: 'info', msg, ...fields })),
  warn: (msg: string, fields?: LogFields) =>
    console.warn(safeStringify({ level: 'warn', msg, ...fields })),
  error: (msg: string, err: unknown, fields?: LogFields) =>
    console.error(
      safeStringify({
        level: 'error',
        msg,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        ...fields,
      }),
    ),
};
