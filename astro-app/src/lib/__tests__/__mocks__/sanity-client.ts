/**
 * Mock for the `sanity:client` Astro virtual module.
 * Provides a fake sanityClient for unit testing Sanity query functions.
 */
import { vi } from "vitest";

export const sanityClient = {
  fetch: vi.fn().mockResolvedValue({ result: null, syncTags: [] }),
  config: vi.fn().mockReturnValue({
    projectId: "test-project",
    dataset: "test-dataset",
    apiVersion: "2025-03-01",
    useCdn: false,
  }),
};
