================================================
FILE: README.md
================================================
# storybook-astro

Storybook framework for Astro components. Render `.astro` files directly in Storybook with full support for props, controls, and automatic source code generation.

## Features

- **Native Astro Support** - Render `.astro` components directly in Storybook
- **Storybook 10** - Built for the latest Storybook version
- **Controls Panel** - Interactive props editing with auto-detected controls
- **Auto Source Code** - Automatically generates Astro component code snippets in docs
- **Global Styles** - Import your global CSS into all stories
- **Inline Docs** - Components render at their natural size in docs mode

## Installation

```bash
npm install -D storybook-astro storybook @storybook/addon-docs @storybook/builder-vite
```

## Quick Start

### 1. Create `.storybook/main.ts`

```typescript
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  
  addons: ['@storybook/addon-docs'],
  
  framework: {
    name: 'storybook-astro',
    options: {},
  },
  
  core: {
    builder: '@storybook/builder-vite',
  },
};

export default config;
```

### 2. Create `.storybook/preview.ts`

```typescript
// Import your global styles
import '../src/styles/global.css';

const preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#ffffff' },
        dark: { name: 'Dark', value: '#1a1a2e' },
      },
    },
  },
};

export default preview;
```

### 3. Write Stories

```typescript
// src/stories/Button.stories.ts
import Button from '../components/Button.astro';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Visual style of the button',
    },
    label: {
      control: 'text',
      description: 'Button text',
    },
  },
};

export default meta;

export const Primary = {
  args: {
    variant: 'primary',
    label: 'Click me',
  },
};

export const Secondary = {
  args: {
    variant: 'secondary',
    label: 'Click me',
  },
};
```

### 4. Add Scripts to `package.json`

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### 5. Run Storybook

```bash
npm run storybook
```

## Astro Dev Toolbar Integration

Add a Storybook link to the Astro dev toolbar for quick access:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';

export default defineConfig({
  integrations: [
    // Only load in development
    ...(isDev
      ? [(await import('storybook-astro')).storybookDevToolbar({ port: 6006 })]
      : []),
  ],
});
```

### Toolbar Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `6006` | The port Storybook is running on |
| `host` | `string` | `localhost` | The host Storybook is running on |

## Running Alongside Astro Dev Server

For the best development experience, run both Astro and Storybook together using `concurrently`:

```bash
npm install -D concurrently
```

Update your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "concurrently -n astro,storybook -c blue,magenta \"astro dev\" \"storybook dev -p 6006 --no-open\"",
    "dev:astro": "astro dev",
    "dev:storybook": "storybook dev -p 6006",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

Now `npm run dev` starts both servers:
- **Astro**: http://localhost:4321
- **Storybook**: http://localhost:6006

## Story Format

### Basic Story

```typescript
import MyComponent from '../components/MyComponent.astro';

export default {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export const Default = {
  args: {
    title: 'Hello World',
    count: 42,
  },
};
```

### Full-Width Components

For components like heroes that need full width:

```typescript
export default {
  title: 'Components/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: true, // Renders at natural size in docs
      },
    },
  },
};
```

### With ArgTypes Documentation

```typescript
export default {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'], // Auto-generate docs page
  argTypes: {
    title: {
      control: 'text',
      description: 'Card heading',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Untitled' },
      },
    },
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
      description: 'Visual variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the card is interactive',
    },
  },
};
```

### Custom Source Code

By default, the "Show code" panel auto-generates Astro syntax. To customize:

```typescript
export const CustomExample = {
  args: {
    title: 'Example',
  },
  parameters: {
    docs: {
      source: {
        code: `---
import Card from '../components/Card.astro';
---

<Card title="Example">
  <p>Custom slot content</p>
</Card>`,
        language: 'astro',
      },
    },
  },
};
```

## Configuration Options

### Framework Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stylesheets` | `string[]` | `[]` | Global stylesheets to inject into stories |
| `scripts` | `string[]` | `[]` | Global scripts to inject into stories |

### Example with Options

```typescript
// .storybook/main.ts
const config = {
  framework: {
    name: 'storybook-astro',
    options: {
      stylesheets: [
        '/src/styles/global.css',
        '/src/styles/components.css',
      ],
      scripts: [
        '/src/scripts/analytics.js',
      ],
    },
  },
};
```

## TypeScript Support

For TypeScript support with `.astro` imports, add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["astro/client"]
  }
}
```

Note: TypeScript may show errors for `.astro` imports in story files. These are safe to ignore - the components will work correctly at runtime.

## How It Works

1. **Astro Vite Plugins** - The framework loads Astro's Vite plugins to compile `.astro` files
2. **Component Compilation** - `.astro` files are compiled to JavaScript component factories
3. **Direct Rendering** - Components render directly in the Storybook canvas
4. **Source Transform** - Args are automatically transformed to Astro template syntax for docs

## Requirements

- **Astro** 5.x
- **Storybook** 10.x
- **Node.js** 20+

## Troubleshooting

### Component not rendering

1. Ensure the component path is correct
2. Check the browser console for errors
3. Verify your component works in Astro first

### Styles not applying

1. Import global styles in `.storybook/preview.ts`
2. Component-scoped styles should work automatically
3. Check that CSS file paths are correct

### "Cannot find module" TypeScript errors

This is expected for `.astro` imports in TypeScript files. The components will still work - this is just a TypeScript limitation.

### Build errors

Run `npm run build-storybook` to see detailed error messages. Common issues:
- Missing dependencies
- Invalid component syntax
- Circular imports

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by [Astro](https://astro.build) or [Storybook](https://storybook.js.org). All trademarks belong to their respective owners.

## License

MIT



================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2025 Ryan Hughes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: package.json
================================================
{
  "name": "storybook-astro",
  "version": "0.1.0",
  "description": "Storybook framework for Astro components - render .astro files directly in Storybook",
  "keywords": [
    "storybook",
    "astro",
    "astro-integration",
    "storybook-framework",
    "component-library",
    "design-system"
  ],
  "license": "MIT",
  "author": {
    "name": "Ryan Hughes",
    "email": "ryan@heyoodle.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/thinkoodle/storybook-astro"
  },
  "homepage": "https://github.com/thinkoodle/storybook-astro#readme",
  "bugs": {
    "url": "https://github.com/thinkoodle/storybook-astro/issues"
  },
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./preset": {
      "types": "./dist/preset.d.ts",
      "import": "./dist/preset.js",
      "require": "./dist/preset.cjs"
    },
    "./renderer": {
      "types": "./dist/renderer/index.d.ts",
      "import": "./dist/renderer/index.js",
      "require": "./dist/renderer/index.cjs"
    },
    "./renderer/entry-preview": {
      "types": "./dist/renderer/entry-preview.d.ts",
      "import": "./dist/renderer/entry-preview.js",
      "require": "./dist/renderer/entry-preview.cjs"
    },
    "./renderer/entry-preview.mjs": {
      "types": "./dist/renderer/entry-preview.d.ts",
      "import": "./dist/renderer/entry-preview.js"
    },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@storybook/builder-vite": "^8.4.0 || ^10.0.0",
    "ts-dedent": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "astro": "^5.0.0",
    "storybook": "^10.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vite": "^6.0.0"
  },
  "peerDependencies": {
    "astro": "^4.0.0 || ^5.0.0",
    "storybook": "^8.0.0 || ^10.0.0",
    "vite": "^5.0.0 || ^6.0.0"
  },
  "peerDependenciesMeta": {
    "astro": {
      "optional": false
    }
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "storybook": {
    "displayName": "Astro",
    "icon": "https://raw.githubusercontent.com/withastro/astro/main/assets/brand/logo.svg",
    "unsupportedFrameworks": []
  }
}



================================================
FILE: preset.js
================================================
/**
 * Preset shim for Storybook compatibility
 * This re-exports the preset from the dist folder
 */
export * from './dist/preset.js';
export { default } from './dist/preset.js';



================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "types": ["vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}



================================================
FILE: tsup.config.ts
================================================
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    preset: 'src/preset.ts',
    'renderer/index': 'src/renderer/index.ts',
    'renderer/entry-preview': 'src/renderer/entry-preview.ts',
    'integration/index': 'src/integration/index.ts',
    'integration/toolbar-app': 'src/integration/toolbar-app.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'astro',
    'astro/container',
    'astro/config',
    'astro/toolbar',
    'storybook',
    'storybook/internal/preview-api',
    'storybook/internal/types',
    'vite',
    /^@storybook\//,
    /^virtual:/,
  ],
  noExternal: ['ts-dedent'],
  treeshake: true,
});



================================================
FILE: src/env.d.ts
================================================
/// <reference types="vite/client" />

/**
 * Type declarations for virtual modules and Vite environment
 */

declare module 'virtual:astro-storybook/styles' {
  export const stylesheets: string[];
}

declare module 'virtual:astro-storybook/scripts' {
  export const scripts: string[];
}

declare module 'virtual:astro-storybook/components' {
  export const components: Record<string, () => Promise<{ default: unknown }>>;
}

// Augment ImportMeta for Vite HMR
interface ImportMeta {
  readonly hot?: {
    readonly data: Record<string, unknown>;
    accept(): void;
    accept(cb: (mod: unknown) => void): void;
    accept(dep: string, cb: (mod: unknown) => void): void;
    accept(deps: readonly string[], cb: (mods: unknown[]) => void): void;
    dispose(cb: (data: Record<string, unknown>) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: unknown[]) => void): void;
    send(event: string, data?: unknown): void;
  };
}



================================================
FILE: src/index.ts
================================================
/**
 * storybook-astro
 * 
 * Storybook framework for rendering Astro components directly in Storybook.
 * Uses Astro's Container API to server-side render .astro files.
 * 
 * @example
 * ```ts
 * // .storybook/main.ts
 * import type { StorybookConfig } from 'storybook-astro';
 * 
 * const config: StorybookConfig = {
 *   stories: ['../src/**\/*.stories.@(ts|tsx|js|jsx)'],
 *   framework: {
 *     name: 'storybook-astro',
 *     options: {
 *       stylesheets: ['/src/styles/global.css'],
 *     },
 *   },
 * };
 * 
 * export default config;
 * ```
 */

export type {
  StorybookConfig,
  FrameworkOptions,
  AstroMeta,
  AstroStory,
  RenderRequestMessage,
  RenderResponseMessage,
} from './types/index.js';

// Export source transformer for docs
export { transformSource } from './docs/sourceTransformer.js';

// Export Astro integration for dev toolbar
export { storybookDevToolbar } from './integration/index.js';
export type { StorybookToolbarOptions } from './integration/index.js';

// Re-export preset for framework auto-detection
export { default } from './preset.js';



================================================
FILE: src/preset.ts
================================================
/**
 * Storybook Preset for Astro Framework
 * 
 * This preset configures Storybook to work with Astro components by:
 * 1. Setting up the Vite builder with Astro-specific plugins
 * 2. Configuring the custom Astro renderer
 * 3. Adding middleware for server-side rendering via Container API
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { FrameworkOptions } from './types/index.js';
import type { InlineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Get absolute path to a package
 */
function getAbsolutePath<T extends string>(input: T): T {
  return dirname(require.resolve(join(input, 'package.json'))) as T;
}

/**
 * Core Storybook configuration
 */
export const core = {
  builder: getAbsolutePath('@storybook/builder-vite'),
  renderer: join(__dirname, 'renderer'),
};

/**
 * Framework name for Storybook
 */
export const frameworkName = 'storybook-astro' as const;

/**
 * Preview annotations - tells Storybook where to find the render functions
 */
export const previewAnnotations = async (input: string[] = []) => {
  return [
    ...input,
    join(__dirname, 'renderer', 'entry-preview.js'),
  ];
};

interface ViteFinalContext {
  presets: {
    apply<T>(preset: string): Promise<T>;
  };
}

/**
 * Vite configuration for Astro support
 */
export async function viteFinal(
  config: InlineConfig,
  { presets }: ViteFinalContext
): Promise<InlineConfig> {
  const frameworkOptions = await presets.apply<FrameworkOptions>('frameworkOptions');
  
  // Dynamic import to avoid bundling issues
  const { createAstroVitePlugins } = await import('./framework/vite-plugins.js');
  
  const astroPlugins = await createAstroVitePlugins(frameworkOptions || {});
  
  const existingPlugins = config.plugins || [];
  const existingOptimizeDeps = config.optimizeDeps || {};
  const existingSsr = config.ssr || {};
  
  return {
    ...config,
    plugins: [...existingPlugins, ...astroPlugins],
    optimizeDeps: {
      ...existingOptimizeDeps,
      include: [
        ...(existingOptimizeDeps.include || []),
        // Pre-bundle CJS modules that Astro depends on
        'cssesc',
        'string-width',
      ],
      exclude: [
        ...(existingOptimizeDeps.exclude || []),
        'astro',
        'astro/container',
      ],
    },
    ssr: {
      ...existingSsr,
      noExternal: [
        ...(Array.isArray(existingSsr.noExternal) ? existingSsr.noExternal : []),
        'storybook-astro',
      ],
    },
  };
}

/**
 * Default export for preset auto-detection
 */
export default {
  core,
  viteFinal,
  frameworkName,
  previewAnnotations,
};



================================================
FILE: src/docs/sourceTransformer.ts
================================================
/**
 * Source code transformer for Astro components in Storybook docs
 * 
 * Transforms story args into proper Astro component syntax for display
 * in the "Show code" panel.
 */

export interface StoryContext {
  id: string;
  name: string;
  title: string;
  component?: {
    displayName?: string;
    name?: string;
    __docgenInfo?: {
      displayName?: string;
    };
  } & ((...args: unknown[]) => unknown);
  args: Record<string, unknown>;
  parameters?: {
    docs?: {
      source?: {
        code?: string;
        language?: string;
        excludeDecorators?: boolean;
      };
    };
  };
}

/**
 * Get the component name from the story context
 */
function getComponentName(context: StoryContext): string {
  const { component, title } = context;
  
  // Try to get name from component
  if (component) {
    if (component.displayName) return component.displayName;
    if (component.name && component.name !== 'default') return component.name;
    if (component.__docgenInfo?.displayName) return component.__docgenInfo.displayName;
  }
  
  // Fall back to extracting from title (e.g., "Components/HeroSection" -> "HeroSection")
  const parts = title.split('/');
  return parts[parts.length - 1];
}

/**
 * Format a prop value for Astro template syntax
 */
function formatPropValue(value: unknown): string {
  if (typeof value === 'string') {
    // Escape quotes in strings
    const escaped = value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `{${value}}`;
  }
  
  if (value === null || value === undefined) {
    return `{${value}}`;
  }
  
  if (Array.isArray(value) || typeof value === 'object') {
    // For complex values, use JSX expression syntax
    return `{${JSON.stringify(value, null, 2)}}`;
  }
  
  return `{${String(value)}}`;
}

/**
 * Format props as Astro component attributes
 */
function formatProps(args: Record<string, unknown>, indent: string = '  '): string {
  const entries = Object.entries(args).filter(([_, value]) => value !== undefined);
  
  if (entries.length === 0) {
    return '';
  }
  
  // For single short prop, keep it inline
  if (entries.length === 1) {
    const [key, value] = entries[0];
    const formatted = formatPropValue(value);
    if (formatted.length < 40) {
      return ` ${key}=${formatted}`;
    }
  }
  
  // For multiple props or long values, format multiline
  return '\n' + entries
    .map(([key, value]) => `${indent}${key}=${formatPropValue(value)}`)
    .join('\n') + '\n';
}

/**
 * Transform story source code to Astro syntax
 * 
 * @param code - The original source code (usually just args object)
 * @param context - The story context with component and args info
 * @returns Formatted Astro component code
 */
export function transformSource(code: string, context: StoryContext): string {
  // If custom source is provided, use it
  if (context.parameters?.docs?.source?.code) {
    return context.parameters.docs.source.code;
  }
  
  const componentName = getComponentName(context);
  const { args } = context;
  
  // Handle empty args
  if (!args || Object.keys(args).length === 0) {
    return `---
import ${componentName} from '../components/${componentName}.astro';
---

<${componentName} />`;
  }
  
  const propsString = formatProps(args);
  const selfClosing = !propsString.includes('\n');
  
  if (selfClosing) {
    return `---
import ${componentName} from '../components/${componentName}.astro';
---

<${componentName}${propsString} />`;
  }
  
  return `---
import ${componentName} from '../components/${componentName}.astro';
---

<${componentName}${propsString}/>`;
}

/**
 * Default export for easy importing
 */
export default transformSource;



================================================
FILE: src/framework/vite-plugins.ts
================================================
/**
 * Vite plugins for Astro Storybook integration
 * 
 * Creates the necessary Vite plugins to:
 * 1. Handle Astro component imports via Astro's Vite plugin
 * 2. Set up WebSocket communication for rendering
 * 3. Inject global styles and scripts
 */

import type { Plugin, ViteDevServer, InlineConfig } from 'vite';
import type { FrameworkOptions, RenderRequestMessage, RenderResponseMessage } from '../types/index.js';

// Cache the Astro Vite config to avoid recreating it
let cachedAstroViteConfig: InlineConfig | null = null;

/**
 * Create all Vite plugins needed for Astro support in Storybook
 */
export async function createAstroVitePlugins(options: FrameworkOptions): Promise<Plugin[]> {
  // Set VITEST env to trick Astro into compiling components for client-side rendering
  // This works around the SSR check in astro:build plugin that would otherwise
  // stub out components with an error
  process.env.VITEST = 'true';
  
  // Get Astro's full Vite configuration including all plugins
  const astroViteConfig = await getAstroViteConfig();
  
  // Extract plugins from Astro's config
  const astroPlugins = extractAstroPlugins(astroViteConfig);
  
  return [
    ...astroPlugins,
    astroContainerPlugin(),
    astroStylesPlugin(options.stylesheets || []),
    astroScriptsPlugin(options.scripts || []),
    astroComponentMarkerPlugin(),
  ];
}

/**
 * Get the full Astro Vite configuration using getViteConfig
 */
async function getAstroViteConfig(): Promise<InlineConfig> {
  if (cachedAstroViteConfig) {
    return cachedAstroViteConfig;
  }
  
  try {
    const { getViteConfig } = await import('astro/config');
    
    // getViteConfig returns a function that takes { mode, command }
    const configFn = getViteConfig({}, {
      // Minimal inline Astro config - will use astro.config.mjs from project
    });
    
    cachedAstroViteConfig = await configFn({ 
      mode: 'development', 
      command: 'serve' 
    });
    
    return cachedAstroViteConfig;
  } catch (error) {
    console.warn('[storybook-astro] Could not load Astro Vite config:', error);
    return { plugins: [] };
  }
}

/**
 * Extract relevant plugins from Astro's Vite configuration
 */
function extractAstroPlugins(config: InlineConfig): Plugin[] {
  if (!config.plugins) return [];
  
  // Flatten nested plugin arrays - use explicit typing to avoid deep recursion
  const flatPlugins: unknown[] = [];
  const flatten = (arr: unknown[]): void => {
    for (const item of arr) {
      if (Array.isArray(item)) {
        flatten(item);
      } else if (item) {
        flatPlugins.push(item);
      }
    }
  };
  flatten(config.plugins as unknown[]);
  
  // Include plugins essential for .astro file compilation
  const essentialPlugins = [
    'astro:build',
    'astro:build:normal', 
    'astro:config-alias',
    'astro:load-fallback',
    'astro:postprocess',
    'astro:markdown',
    'astro:html',
    'astro:scripts',
    'astro:assets',
    'astro:head',
    'astro:container',
  ];
  
  return flatPlugins.filter((p): p is Plugin => {
    if (!p || typeof p !== 'object') return false;
    const name = 'name' in p ? String((p as { name: unknown }).name) : '';
    return essentialPlugins.some(essential => name.startsWith(essential) || name === essential);
  });
}

/**
 * Plugin that sets up the Astro Container API for server-side rendering
 * Handles WebSocket messages from the client to render components
 */
function astroContainerPlugin(): Plugin {
  let viteServer: ViteDevServer;
  
  return {
    name: 'storybook-astro:container',
    
    configureServer(server) {
      viteServer = server;
      
      // Handle render requests from the client
      server.ws.on('astro:render:request', async (data: RenderRequestMessage['data'], client) => {
        try {
          const html = await renderAstroComponent(data, viteServer);
          
          const response: RenderResponseMessage['data'] = {
            id: data.id,
            html,
          };
          
          client.send('astro:render:response', response);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('[storybook-astro] Render error:', errorMessage);
          
          const response: RenderResponseMessage['data'] = {
            id: data.id,
            html: `<div style="color: #dc2626; background: #fef2f2; padding: 16px; border-radius: 8px; font-family: system-ui;">
              <strong>Render Error</strong>
              <pre style="margin: 8px 0 0; white-space: pre-wrap;">${escapeHtml(errorMessage)}</pre>
            </div>`,
            error: errorMessage,
          };
          
          client.send('astro:render:response', response);
        }
      });
    },
  };
}

/**
 * Render an Astro component using the Container API
 */
async function renderAstroComponent(
  data: RenderRequestMessage['data'],
  server: ViteDevServer
): Promise<string> {
  // Dynamic import to get fresh module on HMR
  const { experimental_AstroContainer: AstroContainer } = await import('astro/container');
  
  // Create container for rendering
  const container = await AstroContainer.create({
    // Resolve module paths for client-side scripts
    resolve: async (specifier: string) => {
      if (specifier.startsWith('astro:scripts')) {
        return `/@id/${specifier}`;
      }
      return specifier;
    },
  });
  
  // Import the component module
  const componentModule = await server.ssrLoadModule(data.component);
  const Component = componentModule.default;
  
  if (!Component) {
    throw new Error(`Component not found: ${data.component}`);
  }
  
  // Render to string
  const html = await container.renderToString(Component, {
    props: data.args || {},
    slots: data.slots || {},
  });
  
  return html;
}

/**
 * Virtual module plugin for injecting global stylesheets
 */
function astroStylesPlugin(stylesheets: string[]): Plugin {
  const virtualModuleId = 'virtual:astro-storybook/styles';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  
  return {
    name: 'storybook-astro:styles',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const normalized = stylesheets.map(s => normalizeAssetPath(s));
        return `export const stylesheets = ${JSON.stringify(normalized)};`;
      }
    },
  };
}

/**
 * Virtual module plugin for injecting global scripts
 */
function astroScriptsPlugin(scripts: string[]): Plugin {
  const virtualModuleId = 'virtual:astro-storybook/scripts';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  
  return {
    name: 'storybook-astro:scripts',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const normalized = scripts.map(s => normalizeAssetPath(s));
        return `export const scripts = ${JSON.stringify(normalized)};`;
      }
    },
  };
}

/**
 * Plugin to mark Astro components with their module ID for rendering
 */
function astroComponentMarkerPlugin(): Plugin {
  return {
    name: 'storybook-astro:component-marker',
    enforce: 'post',
    
    transform(code, id) {
      // Only process compiled .astro files
      if (!id.endsWith('.astro') && !id.includes('.astro?')) {
        return null;
      }
      
      // Look for the default export and add moduleId
      // Astro compiles components to have a default export
      if (code.includes('export default') || code.includes('export { $$Component as default }')) {
        const moduleIdLine = `\n;(function() { 
          if (typeof $$Component !== 'undefined') { 
            $$Component.isAstroComponentFactory = true;
            $$Component.moduleId = ${JSON.stringify(id.split('?')[0])}; 
          }
        })();\n`;
        
        return {
          code: code + moduleIdLine,
          map: null,
        };
      }
      
      return null;
    },
    
    // Handle HMR for Astro components
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.astro')) {
        server.ws.send({
          type: 'custom',
          event: 'astro:component:update',
          data: { file },
        });
      }
    },
  };
}

/**
 * Normalize asset paths for injection
 */
function normalizeAssetPath(path: string): string {
  // Keep absolute URLs as-is
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  
  // Remove leading ./ and ensure leading /
  path = path.replace(/^\.\//, '');
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  return path;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}



================================================
FILE: src/integration/index.ts
================================================
/**
 * Astro Integration for Storybook Dev Toolbar App
 * 
 * Adds a Storybook icon to the Astro dev toolbar that links to the running Storybook instance.
 */

import type { AstroIntegration } from 'astro';
import { createRequire } from 'module';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);

// Get the toolbar-app.js path relative to the package root
// This avoids issues with import.meta.url when bundled
function getToolbarEntrypoint(): string {
  // Resolve the package.json to find the package root
  const packageJsonPath = require.resolve('storybook-astro/package.json');
  const packageRoot = dirname(packageJsonPath);
  return join(packageRoot, 'dist', 'integration', 'toolbar-app.js');
}

export interface StorybookToolbarOptions {
  /**
   * The port Storybook is running on
   * @default 6006
   */
  port?: number;
  
  /**
   * The host Storybook is running on
   * @default 'localhost'
   */
  host?: string;
}

/**
 * Astro integration that adds a Storybook link to the dev toolbar
 */
export function storybookDevToolbar(options: StorybookToolbarOptions = {}): AstroIntegration {
  const { port = 6006, host = 'localhost' } = options;
  
  return {
    name: 'storybook-astro/toolbar',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp, command }) => {
        // Only add in dev mode
        if (command !== 'dev') return;
        
        const entrypointPath = getToolbarEntrypoint();
        
        addDevToolbarApp({
          id: 'storybook-toolbar-app',
          name: 'Storybook',
          // Official Storybook icon from https://github.com/storybookjs/brand
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 64" fill="none"><path fill="#FF4785" d="M50.273 2.923a3.12 3.12 0 0 1 .006.194v55.766a3.117 3.117 0 0 1-3.15 3.117l-42.14-1.869a3.108 3.108 0 0 1-3.006-2.997L.002 5.955A3.108 3.108 0 0 1 2.953 2.727L37.427.594l-.3 7.027a.466.466 0 0 0 .753.396l2.758-2.07 2.329 1.816a.467.467 0 0 0 .76-.381l-.26-7.155 3.466-.221a3.108 3.108 0 0 1 3.34 2.917Z"/><path fill="#fff" d="M29.403 23.369c0 1.213 8.254.636 9.362-.215 0-8.259-4.477-12.599-12.676-12.599-8.199 0-12.793 4.408-12.793 11.019 0 11.514 15.7 11.734 15.7 18.015 0 1.763-.872 2.81-2.791 2.81-2.5 0-3.489-1.264-3.373-5.561 0-.932-9.536-1.223-9.827 0-.74 10.414 5.815 13.417 13.316 13.417 7.269 0 12.967-3.834 12.967-10.776 0-12.34-15.933-12.01-15.933-18.125 0-2.48 1.861-2.81 2.966-2.81 1.163 0 3.256.203 3.082 4.825Z"/></svg>`,
          entrypoint: entrypointPath,
        });
      },
      'astro:server:setup': ({ server }) => {
        // Inject the Storybook URL into the client via a virtual module
        server.middlewares.use((req, res, next) => {
          if (req.url === '/__storybook-config') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ port, host }));
            return;
          }
          next();
        });
      },
    },
  };
}

export default storybookDevToolbar;



================================================
FILE: src/integration/toolbar-app.ts
================================================
/**
 * Storybook Dev Toolbar App
 * 
 * Shows a Storybook icon in the Astro dev toolbar that opens Storybook when clicked.
 */

import { defineToolbarApp } from 'astro/toolbar';

export default defineToolbarApp({
  init(canvas) {
    // Fetch Storybook config
    fetch('/__storybook-config')
      .then(res => res.json())
      .then(config => {
        const storybookUrl = `http://${config.host}:${config.port}`;
        
        // Create the UI
        const container = document.createElement('astro-dev-toolbar-window');
        
        const content = document.createElement('div');
        content.style.padding = '1rem';
        
        const title = document.createElement('h2');
        title.textContent = 'Storybook';
        title.style.marginTop = '0';
        title.style.marginBottom = '0.5rem';
        title.style.fontSize = '1.1rem';
        title.style.fontWeight = '600';
        content.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = 'View and develop your components in isolation.';
        description.style.marginTop = '0';
        description.style.marginBottom = '1rem';
        description.style.fontSize = '0.85rem';
        description.style.opacity = '0.8';
        content.appendChild(description);
        
        // Open Storybook button using astro-dev-toolbar-button
        const openButton = document.createElement('astro-dev-toolbar-button');
        openButton.setAttribute('button-style', 'purple');
        openButton.innerHTML = `
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open Storybook
          </span>
        `;
        openButton.addEventListener('click', () => {
          window.open(storybookUrl, '_blank');
        });
        content.appendChild(openButton);
        
        // Status indicator
        const statusContainer = document.createElement('div');
        statusContainer.style.marginTop = '1rem';
        statusContainer.style.fontSize = '0.75rem';
        statusContainer.style.display = 'flex';
        statusContainer.style.alignItems = 'center';
        statusContainer.style.gap = '0.5rem';
        
        const statusDot = document.createElement('span');
        statusDot.style.width = '8px';
        statusDot.style.height = '8px';
        statusDot.style.borderRadius = '50%';
        statusDot.style.backgroundColor = '#888';
        
        const statusText = document.createElement('span');
        statusText.textContent = 'Checking...';
        statusText.style.opacity = '0.7';
        
        statusContainer.appendChild(statusDot);
        statusContainer.appendChild(statusText);
        content.appendChild(statusContainer);
        
        container.appendChild(content);
        canvas.appendChild(container);
        
        // Check if Storybook is running
        checkStorybookStatus(storybookUrl, statusDot, statusText);
      })
      .catch(() => {
        // Fallback if config fetch fails
        const container = document.createElement('astro-dev-toolbar-window');
        const content = document.createElement('div');
        content.style.padding = '1rem';
        content.innerHTML = `
          <h2 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">Storybook</h2>
          <p style="margin: 0; font-size: 0.85rem; opacity: 0.8;">
            Run <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">npm run storybook</code> to start Storybook.
          </p>
        `;
        container.appendChild(content);
        canvas.appendChild(container);
      });
  },
});

/**
 * Check if Storybook is running and update the status indicator
 */
async function checkStorybookStatus(
  url: string, 
  dot: HTMLElement, 
  text: HTMLElement
): Promise<void> {
  try {
    await fetch(url, { mode: 'no-cors' });
    // no-cors mode doesn't give us status, but if it doesn't throw, something is there
    dot.style.backgroundColor = '#4ade80';
    text.textContent = `Running at ${url}`;
  } catch {
    dot.style.backgroundColor = '#f87171';
    text.textContent = 'Not running';
  }
}



================================================
FILE: src/renderer/decorators.ts
================================================
/**
 * Default decorators for Astro Storybook
 * 
 * These decorators are automatically applied to all stories.
 */

// Default decorators array (empty for now, can be extended)
const decorators: unknown[] = [];

export default decorators;



================================================
FILE: src/renderer/entry-preview.ts
================================================
/**
 * Entry preview for Storybook
 * 
 * This is the entry point that Storybook loads for the preview iframe.
 * It sets up the renderer and any global configuration.
 * 
 * IMPORTANT: This file MUST export `render` and `renderToCanvas` for Storybook to work.
 */

// Re-export the render functions - these are required by Storybook
export { render, renderToCanvas } from './render.js';

// Import the source transformer
import { transformSource } from '../docs/sourceTransformer.js';

// Export parameters for the renderer
export const parameters = {
  renderer: 'astro',
  docs: {
    story: {
      inline: true, // Render inline for better sizing
    },
    source: {
      language: 'astro',
      transform: transformSource,
    },
  },
};

// Import global styles if configured
async function injectGlobalAssets() {
  try {
    // Virtual module - types defined in env.d.ts
    const { stylesheets } = await import('virtual:astro-storybook/styles');
    stylesheets.forEach((href: string) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  } catch {
    // No stylesheets configured
  }

  try {
    // Virtual module - types defined in env.d.ts
    const { scripts } = await import('virtual:astro-storybook/scripts');
    scripts.forEach((src: string) => {
      const script = document.createElement('script');
      script.src = src;
      document.body.appendChild(script);
    });
  } catch {
    // No scripts configured
  }
}

// Execute on load
if (typeof document !== 'undefined') {
  injectGlobalAssets();
}



================================================
FILE: src/renderer/index.ts
================================================
/**
 * Astro Storybook Renderer
 * 
 * This module is the renderer entry point for Storybook.
 * It exports the render functions that Storybook uses to display components.
 */

// Export render functions - required by Storybook
export { render, renderToCanvas } from './render.js';

// Export parameters
export const parameters = {
  renderer: 'astro',
};

// Export decorators
export { default as decorators } from './decorators.js';



================================================
FILE: src/renderer/render.ts
================================================
/**
 * Astro Component Renderer for Storybook
 * 
 * This module handles rendering Astro components in the Storybook canvas.
 * It communicates with the server via WebSocket to use the Container API.
 */

import { simulateDOMContentLoaded, simulatePageLoad } from 'storybook/internal/preview-api';
import { dedent } from 'ts-dedent';
import type { RenderResponseMessage, RenderPromise } from '../types/index.js';

// Map of pending render requests
const pendingRequests = new Map<string, RenderPromise>();

// Flag to track if we've initialized the WebSocket listeners
let isInitialized = false;

/**
 * Initialize WebSocket listeners for render responses
 */
function initialize() {
  if (isInitialized) return;
  isInitialized = true;
  
  // Listen for render responses from the server
  if (import.meta.hot) {
    import.meta.hot.on('astro:render:response', (data: RenderResponseMessage['data']) => {
      const pending = pendingRequests.get(data.id);
      if (pending) {
        clearTimeout(pending.timeoutId);
        pendingRequests.delete(data.id);
        pending.resolve(data);
      }
    });
    
    // Listen for component updates (HMR)
    import.meta.hot.on('astro:component:update', () => {
      // Trigger re-render by sending a custom event
      window.dispatchEvent(new CustomEvent('storybook-astro:hmr'));
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArgs = Record<string, any>;

interface StoryContext {
  id: string;
  name: string;
  title: string;
  component?: unknown;
  args: AnyArgs;
}

interface RenderContextLike {
  storyFn: () => unknown;
  showMain: () => void;
  showError: (error: { title: string; description: string }) => void;
  forceRemount: boolean;
  storyContext: StoryContext;
}

/**
 * Main render function - creates the story element
 * This is called by Storybook to get the renderable content
 */
export function render(_args: AnyArgs, context: StoryContext): unknown {
  const { id, component } = context;
  
  if (!component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }
  
  // If component is a string (raw HTML), return it directly
  if (typeof component === 'string') {
    return component;
  }
  
  // If component is already an HTML element, clone it
  if (component instanceof HTMLElement) {
    return component.cloneNode(true) as HTMLElement;
  }
  
  // Check if this is an Astro component (has the factory marker)
  if (typeof component === 'function' && 'isAstroComponentFactory' in component) {
    return component;
  }
  
  // For other function components, try to render them
  if (typeof component === 'function') {
    return component;
  }
  
  console.warn(dedent`
    Storybook Astro renderer received an unexpected component type.
    Received: ${typeof component}
  `);
  
  return component;
}

/**
 * Render story to the canvas element
 * This is the main entry point called by Storybook
 */
export async function renderToCanvas(
  ctx: RenderContextLike,
  canvasElement: HTMLElement
): Promise<void> {
  initialize();
  
  const { storyFn, showMain, showError, forceRemount, storyContext } = ctx;
  const { name, title } = storyContext;
  
  const element = storyFn();
  
  showMain();
  
  // Check if this is an Astro component
  if (isAstroComponent(element)) {
    await renderAstroComponent(element, storyContext, canvasElement);
    return;
  }
  
  // Handle string content
  if (typeof element === 'string') {
    canvasElement.innerHTML = element;
    simulatePageLoad(canvasElement);
    return;
  }
  
  // Handle DOM nodes
  if (element instanceof Node) {
    if (canvasElement.firstChild === element && !forceRemount) {
      return;
    }
    
    canvasElement.innerHTML = '';
    canvasElement.appendChild(element);
    simulateDOMContentLoaded();
    return;
  }
  
  // Unknown element type
  showError({
    title: `Expecting an HTML snippet or DOM node from the story: "${name}" of "${title}".`,
    description: dedent`
      Did you forget to return the HTML snippet from the story?
      Use "() => <your snippet or node>" or when defining the story.
    `,
  });
}

/**
 * Check if an element is an Astro component factory
 */
function isAstroComponent(element: unknown): element is AstroComponentLike {
  return (
    element !== null &&
    typeof element === 'function' &&
    'isAstroComponentFactory' in element &&
    (element as AstroComponentLike).isAstroComponentFactory === true
  );
}

interface AstroComponentLike {
  isAstroComponentFactory: true;
  moduleId?: string;
}

/**
 * Render an Astro component by sending a request to the server
 */
async function renderAstroComponent(
  component: AstroComponentLike,
  storyContext: StoryContext,
  canvasElement: HTMLElement
): Promise<void> {
  const { args } = storyContext;
  
  // Get module ID from component
  const moduleId = component.moduleId;
  if (!moduleId) {
    throw new Error('Astro component is missing moduleId. Make sure the component was imported correctly.');
  }
  
  // Separate slots from regular args
  const { slots = {}, ...props } = args as { slots?: Record<string, string>; [key: string]: unknown };
  
  try {
    // Request render from server
    const response = await sendRenderRequest({
      component: moduleId,
      args: props,
      slots,
    });
    
    // Update canvas with rendered HTML
    canvasElement.innerHTML = response.html;
    
    // Execute any inline scripts
    executeScripts(canvasElement);
    
    // Apply styles that may have been injected
    applyDynamicStyles();
    
    // Simulate page load for any scripts that depend on it
    simulatePageLoad(canvasElement);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    canvasElement.innerHTML = `
      <div style="color: #dc2626; background: #fef2f2; padding: 16px; border-radius: 8px; font-family: system-ui;">
        <strong>Failed to render Astro component</strong>
        <pre style="margin: 8px 0 0; white-space: pre-wrap;">${escapeHtml(message)}</pre>
      </div>
    `;
  }
}

/**
 * Send a render request to the server via WebSocket
 */
async function sendRenderRequest(data: {
  component: string;
  args?: Record<string, unknown>;
  slots?: Record<string, string>;
}): Promise<RenderResponseMessage['data']> {
  const id = crypto.randomUUID();
  const timeoutMs = 10000;
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Render request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    pendingRequests.set(id, { resolve, reject, timeoutId });
    
    if (import.meta.hot) {
      import.meta.hot.send('astro:render:request', { ...data, id });
    } else {
      clearTimeout(timeoutId);
      pendingRequests.delete(id);
      reject(new Error('HMR not available - cannot communicate with server'));
    }
  });
}

/**
 * Execute script tags that were rendered in the component
 */
function executeScripts(container: HTMLElement): void {
  const scripts = container.querySelectorAll('script');
  
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script');
    
    // Copy attributes
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });
    
    // Copy content
    newScript.textContent = oldScript.textContent;
    
    // Replace in DOM to execute
    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });
}

/**
 * Apply any dynamic styles that were added via Vite
 */
function applyDynamicStyles(): void {
  // Find style tags that need to be processed
  const styleTags = document.querySelectorAll('style[data-vite-dev-id]');
  
  styleTags.forEach((style) => {
    const content = style.textContent || '';
    
    // Check if this style needs to be executed as a module
    if (content.includes('__vite__updateStyle')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = content
        .replace(/import\.meta\.hot\.accept\(/g, 'import.meta.hot?.accept(')
        .replace(/import\.meta\.hot\.prune\(/g, 'import.meta.hot?.prune(');
      
      document.head.appendChild(script);
      document.head.removeChild(script);
    }
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}



================================================
FILE: src/types/index.ts
================================================
import type { StorybookConfig as StorybookConfigBase } from 'storybook/internal/types';
import type { BuilderOptions } from '@storybook/builder-vite';

/**
 * Options for the Astro Storybook framework
 */
export interface FrameworkOptions {
  /** 
   * Path to your Astro config file (auto-detected if not provided)
   */
  configFile?: string;
  
  /**
   * Global stylesheets to inject into stories
   */
  stylesheets?: string[];
  
  /**
   * Global scripts to inject into stories
   */
  scripts?: string[];
}

/**
 * Storybook builder options with Vite
 */
export interface StorybookConfigFramework {
  name: 'storybook-astro';
  options: FrameworkOptions;
}

/**
 * Full Storybook configuration type for Astro projects
 */
export interface StorybookConfig extends Omit<StorybookConfigBase, 'framework'> {
  framework: StorybookConfigFramework;
  core?: StorybookConfigBase['core'] & {
    builder?: '@storybook/builder-vite' | BuilderOptions;
  };
}

/**
 * Render request sent from client to server via WebSocket
 */
export interface RenderRequestMessage {
  type: 'astro:render:request';
  data: {
    id: string;
    component: string;
    args?: Record<string, unknown>;
    slots?: Record<string, string>;
  };
}

/**
 * Render response sent from server to client via WebSocket
 */
export interface RenderResponseMessage {
  type: 'astro:render:response';
  data: {
    id: string;
    html: string;
    error?: string;
  };
}

/**
 * Astro component factory type marker
 */
export interface AstroComponentFactory {
  isAstroComponentFactory: true;
  moduleId?: string;
}

/**
 * Story meta configuration for Astro components
 */
export interface AstroMeta<TComponent = unknown> {
  title: string;
  component: TComponent;
  parameters?: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
  args?: Record<string, unknown>;
  decorators?: unknown[];
  tags?: string[];
}

/**
 * Individual story configuration
 */
export interface AstroStory<TArgs = Record<string, unknown>> {
  args?: TArgs;
  slots?: Record<string, string>;
  parameters?: Record<string, unknown>;
  decorators?: unknown[];
  play?: (context: unknown) => Promise<void> | void;
}

/**
 * Promise wrapper for render requests (used for WebSocket communication)
 */
export interface RenderPromise {
  resolve: (data: RenderResponseMessage['data']) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}
