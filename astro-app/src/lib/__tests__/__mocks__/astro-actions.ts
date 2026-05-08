// Stub for the `astro:actions` virtual module. Astro's Vite chain provides
// this in production / unit-astro builds, but the unit-react project doesn't
// load that chain (it runs jsdom + plugin-react-swc only). React-component
// tests that import `astro:actions` must `vi.mock("astro:actions", ...)`
// at the top of the file with the action shape they need; this stub only
// satisfies the import resolver so the test file can load.

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
