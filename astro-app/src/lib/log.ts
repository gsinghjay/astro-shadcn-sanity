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

export const log = {
  info: (msg: string, fields?: LogFields) =>
    console.log(JSON.stringify({ level: 'info', msg, ...fields })),
  warn: (msg: string, fields?: LogFields) =>
    console.warn(JSON.stringify({ level: 'warn', msg, ...fields })),
  error: (msg: string, err: unknown, fields?: LogFields) =>
    console.error(
      JSON.stringify({
        level: 'error',
        msg,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        ...fields,
      }),
    ),
};
