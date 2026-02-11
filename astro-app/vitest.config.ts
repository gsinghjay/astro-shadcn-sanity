/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { resolve } from "path";

export default getViteConfig({
  resolve: {
    alias: {
      // Mock Astro virtual modules that can't resolve outside Astro build
      "sanity:client": resolve(
        import.meta.dirname,
        "./src/lib/__tests__/__mocks__/sanity-client.ts",
      ),
    },
  },
  test: {
    globals: true,
    include: [
      "src/**/__tests__/**/*.test.ts",
      "../tests/integration/**/*.test.ts",
    ],
    exclude: ["node_modules", "dist", ".astro"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/scripts/**/*.ts"],
      exclude: ["src/lib/__tests__/**", "src/lib/data/**", "src/**/*.d.ts"],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "../test-results/unit-coverage",
    },
    reporters: ["default", "junit"],
    outputFile: {
      junit: "../test-results/unit-results.xml",
    },
  },
});
