import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Intercept lucide-static SVG imports and provide Astro components
 * that render SVGs inline, bypassing createSvgComponent which
 * crashes in Storybook's SSR runner (import.meta.env is undefined).
 */
function lucideStaticSvgStub(): Plugin {
  return {
    name: 'storybook-lucide-static-svg-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id.includes('lucide-static/icons/') && id.endsWith('.svg')) {
        const svgPath = resolve(__dirname, '../../node_modules', id)
        // Drop .svg so Astro's image plugin doesn't try to load it
        return '\0lucide-stub:' + svgPath.slice(0, -4)
      }
    },
    load(id) {
      if (!id.startsWith('\0lucide-stub:')) return
      const svgPath = id.slice('\0lucide-stub:'.length) + '.svg'
      const svg = readFileSync(svgPath, 'utf-8')
      // Extract attributes from <svg ...> tag (drop xmlns, class, xmlns:xlink)
      const attrMatch = svg.match(/<svg\s([^>]+)>/)
      const innerMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
      const inner = (innerMatch?.[1] || '').trim()
      const attrs: Record<string, string> = {}
      if (attrMatch) {
        for (const m of attrMatch[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)) {
          if (m[1] !== 'xmlns' && m[1] !== 'class') attrs[m[1]] = m[2]
        }
      }
      const attrsStr = JSON.stringify(attrs)
      return `import { createComponent, render, spreadAttributes, unescapeHTML } from 'astro/runtime/server/index.js';
const defaultAttrs = ${attrsStr};
const children = ${JSON.stringify(inner)};
const Component = createComponent((_, props) => {
  return render\`<svg\${spreadAttributes({...defaultAttrs, ...props})}>\${unescapeHTML(children)}</svg>\`;
});
export default Component;
`
    },
  }
}

/**
 * Stub astro:assets with a plain <img> component so the image
 * service (which doesn't exist outside Astro's build) isn't loaded.
 * Must run before Astro's own Vite plugin resolves the import.
 */
function astroAssetsStub(): Plugin {
  // Stub all known astro:assets exports. Only Image is used today;
  // the rest prevent silent undefined if future code imports them.
  const code = `
import { createComponent, render, spreadAttributes } from 'astro/runtime/server/index.js';
export const Image = createComponent((_, props) => {
  const { inferSize, widths, densities, sizes, priority, quality, format, ...imgProps } = props;
  if (priority) { imgProps.loading = 'eager'; imgProps.fetchpriority = 'high'; }
  return render\`<img\${spreadAttributes(imgProps)} />\`;
});
export const Picture = Image;
export async function getImage(options) {
  const src = typeof options.src === 'string' ? options.src : options.src?.src || '';
  return { src, attributes: { src } };
}
export async function inferRemoteSize() { return { width: 0, height: 0 }; }
export function getConfiguredImageService() { return {}; }
export function isLocalService() { return false; }
`
  return {
    name: 'storybook-astro-assets-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'astro:assets') return '\0astro:assets'
    },
    load(id) {
      if (id === '\0astro:assets') return code
    },
  }
}

/**
 * Stub Astro virtual modules that aren't available outside
 * Astro's build pipeline (astro-icon, astro:assets fonts).
 *
 * Loads real icon data from @iconify-json packages so that
 * components using <Icon name="lucide:..." /> render correctly.
 */
function astroVirtualModuleStubs(): Plugin {
  const iconSets = ['lucide', 'simple-icons']
  const iconEntries = iconSets.map((set) => {
    const jsonPath = resolve(__dirname, `../../node_modules/@iconify-json/${set}/icons.json`)
    return `"${set}": ${readFileSync(jsonPath, 'utf-8')}`
  })

  const virtualModules: Record<string, string> = {
    'virtual:astro-icon': `export default { ${iconEntries.join(', ')} }; export const config = { include: { ${iconSets.map((s) => `"${s}": ["*"]`).join(', ')} } };`,
    'virtual:astro:assets/fonts/runtime': 'export {};',
    'virtual:astro:assets/fonts/internal': 'export {};',
  }

  return {
    name: 'storybook-astro-virtual-stubs',
    resolveId(id) {
      if (id in virtualModules) return '\0' + id
    },
    load(id) {
      for (const [key, code] of Object.entries(virtualModules)) {
        if (id === '\0' + key) return code
      }
    },
  }
}

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
  viteFinal: (config: any) => {
    if (process.env.STORYBOOK_BASE_PATH) {
      config.base = process.env.STORYBOOK_BASE_PATH
    }
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '../src'),
    }
    config.plugins = config.plugins || []
    config.plugins.push(tailwindcss())
    config.plugins.push(astroAssetsStub())
    config.plugins.push(astroVirtualModuleStubs())
    config.plugins.push(lucideStaticSvgStub())
    // Pre-bundle CJS deps that fail ESM interop
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      'debug',
    ]
    return config
  },
}
export default config
