/**
 * Project-local CSF3 type adapter for storybook-astro.
 *
 * storybook-astro@0.1.0 ships AstroMeta<TComponent> / AstroStory<TArgs> instead
 * of the canonical @storybook/<framework> Meta<T> / StoryObj<M>. This shim
 * re-exports them under the canonical names so our .stories.ts files can use
 * the idiomatic `satisfies Meta<typeof Component>` / `StoryObj<typeof meta>`
 * pattern shown in Storybook docs
 * (https://storybook.js.org/docs/configure/integration/typescript).
 *
 * This file is the single import site for story type annotations and is
 * the template Story 7.18 will use to sweep the remaining 100+ stories.
 */
import type { AstroMeta, AstroStory } from 'storybook-astro';

export type Meta<TComponent> = AstroMeta<TComponent>;

// StoryObj takes the meta type purely for intent parity with @storybook/<fw>;
// AstroStory's args are Record<string, unknown> regardless. Downstream stories
// still get component-shape checking via `satisfies Meta<typeof Component>`.
export type StoryObj<_M = unknown> = AstroStory;
