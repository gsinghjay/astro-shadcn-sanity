// Stub for the `astro:actions` virtual module. Astro's Vite chain provides
// this in production / unit-astro builds, but the unit-node and unit-react
// projects don't load that chain. Tests that exercise actions must
// `vi.mock("astro:actions", ...)` at the top of the file with the shape they
// need; this stub only satisfies the import resolver so the test file can
// load. Three exports because `actions/index.ts` uses `defineAction` and
// `ActionError` to define the server surface, and React islands import
// `actions` to call them.

import { vi } from "vitest";

type StubAction = (input: unknown) => Promise<{
  data: undefined;
  error: undefined;
}>;

const fallback: StubAction = vi.fn(async () => ({
  data: undefined,
  error: undefined,
}));

export const actions = new Proxy(
  {},
  {
    get: () => fallback,
  },
);

export function defineAction<T>(config: T): T {
  return config;
}

export class ActionError extends Error {
  code: string;
  constructor(opts: { code: string; message?: string }) {
    super(opts.message ?? opts.code);
    this.code = opts.code;
    this.name = "ActionError";
  }
}
