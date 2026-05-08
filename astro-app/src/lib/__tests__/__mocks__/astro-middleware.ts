// Stub for the `astro:middleware` virtual module. Provided by Astro's Vite
// chain in production / unit-astro; unit-node tests that transitively import
// src/middleware.ts (e.g. auth-route.test.ts, sign-out.test.ts) need the id
// to resolve before vi.mock can take over. defineMiddleware is the only
// surface the project uses today.

export function defineMiddleware<T>(handler: T): T {
  return handler;
}

export const sequence = (...handlers: unknown[]) => handlers;
