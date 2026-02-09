/**
 * Patched entry-preview for storybook-astro (production builds only)
 *
 * This file replaces storybook-astro's entry-preview.js during `storybook build`.
 * It renders Astro components directly using the Astro runtime instead of requiring
 * a WebSocket connection to a dev server (which doesn't exist in static builds).
 *
 * In dev mode, the original entry-preview.js is used (the resolveId redirect is
 * disabled via configResolved check).
 */

import { simulatePageLoad, simulateDOMContentLoaded } from 'storybook/internal/preview-api'
import { renderToString } from 'astro/runtime/server/render/astro/render.js'
import { renderSlotToString } from 'astro/runtime/server/render/slot.js'
import { chunkToString } from 'astro/runtime/server/render/common.js'

// ---------------------------------------------------------------------------
// Minimal SSRResult mock for Astro's renderToString.
// The Astro runtime render functions are pure JavaScript with 0 Node.js deps
// and can run in the browser. We only need to provide the fields that the
// render pipeline accesses.
// ---------------------------------------------------------------------------
function createSSRResult() {
  const result: any = {
    // Render output collectors
    styles: new Set(),
    scripts: new Set(),
    links: new Set(),
    componentMetadata: new Map(),
    inlinedScripts: new Map(),

    // Client-side component directives (client:load, client:idle, etc.)
    clientDirectives: new Map(),

    // Renderers for framework components (React, Vue, etc.) — none needed
    renderers: [],

    // HTML output options
    compressHTML: false,
    partial: true, // skip doctype injection
    cancelled: false,
    base: '/',
    userAssetsBase: '',

    // CSP-related fields
    shouldInjectCspMetaTags: false,
    cspDestination: '',
    cspAlgorithm: '',
    scriptHashes: [],
    scriptResources: [],
    styleHashes: [],
    styleResources: [],
    directives: [],
    isStrictDynamic: false,

    // Server island support
    serverIslandNameMap: new Map(),

    // Metadata used by the render pipeline
    _metadata: {
      hasRenderedHead: false,
      headInTree: false,
      hasHydrationScript: false,
      hasDirectives: new Set(),
      renderedScripts: new Set(),
      hasRenderedServerIslandRuntime: false,
      rendererSpecificHydrationScripts: new Set(),
      propagators: new Map(),
      extraHead: [],
    },

    // Response object (for headers, status)
    response: {
      headers: new Headers(),
      status: 200,
    },

    // Path resolution (for relative imports in components)
    resolve: async (s: string) => s,
    pathname: '/',
    trailingSlash: 'ignore',
    key: Promise.resolve(null),

    // Request/cookies/locals — stubs for server-only APIs
    request: new Request('http://localhost/'),
    cookies: undefined,

    // Creates the Astro global object used by compiled .astro components.
    // The compiled factory calls: const Astro2 = $$result.createAstro($$Astro, $$props, $$slots)
    createAstro(astroGlobal: any, props: any, slotValues: any) {
      const slots = {
        has: (name: string) => !!slotValues?.[name],
        render: async (name: string) => {
          if (!slotValues?.[name]) return undefined
          // Use the Astro runtime's renderSlotToString to properly convert
          // slot content (functions returning RenderTemplateResults) to HTML strings.
          // This matches how the real Astro Slots class works.
          const content = await renderSlotToString(result, slotValues[name])
          return chunkToString(result, content)
        },
      }
      return {
        ...astroGlobal,
        props,
        self: null,
        slots,
        request: new Request('http://localhost/'),
        redirect: () => new Response(null, { status: 302 }),
        url: new URL('http://localhost/'),
        site: undefined,
        params: {},
        cookies: {
          get: () => undefined,
          set: () => {},
          has: () => false,
          delete: () => {},
          headers: () => new Headers(),
        },
        locals: {},
        preferredLocale: undefined,
        preferredLocaleList: [],
        currentLocale: undefined,
        routePattern: '/',
      }
    },
  }
  return result
}

// ---------------------------------------------------------------------------
// Core render functions
// ---------------------------------------------------------------------------

export function render(_args: any, context: any) {
  const { id, component } = context
  if (!component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`,
    )
  }
  if (typeof component === 'string') return component
  if (component instanceof HTMLElement) return component.cloneNode(true)
  if (typeof component === 'function') return component
  return component
}

export async function renderToCanvas(ctx: any, canvasElement: HTMLElement) {
  const { storyFn, showMain, showError, forceRemount, storyContext } = ctx
  const { name, title } = storyContext
  const element = storyFn()
  showMain()

  if (isAstroComponent(element)) {
    await renderAstroComponent(element, storyContext, canvasElement)
    return
  }
  if (typeof element === 'string') {
    canvasElement.innerHTML = element
    simulatePageLoad(canvasElement)
    return
  }
  if (element instanceof Node) {
    if (canvasElement.firstChild === element && !forceRemount) return
    canvasElement.innerHTML = ''
    canvasElement.appendChild(element)
    simulateDOMContentLoaded()
    return
  }
  showError({
    title: `Expecting an HTML snippet or DOM node from the story: "${name}" of "${title}".`,
    description: 'Did you forget to return the HTML snippet from the story?',
  })
}

function isAstroComponent(element: any): boolean {
  return (
    element !== null &&
    typeof element === 'function' &&
    'isAstroComponentFactory' in element &&
    element.isAstroComponentFactory === true
  )
}

async function renderAstroComponent(
  component: any,
  storyContext: any,
  canvasElement: HTMLElement,
) {
  const { args } = storyContext
  const { slots: rawSlots = {}, ...props } = args || {}

  // Convert slot values to functions as required by the Astro runtime.
  // The AstroComponentInstance constructor calls slots[name](result) — each
  // slot value MUST be a callable function that returns renderable content.
  const slots: Record<string, (result: any) => any> = {}
  for (const [name, value] of Object.entries(rawSlots)) {
    slots[name] = () => value
  }

  try {
    const result = createSSRResult()
    const rendered = await renderToString(result, component, props, slots)
    if (typeof rendered !== 'string') {
      console.warn('[storybook-patch-renderer] renderToString returned non-string:', typeof rendered)
    }
    const html = typeof rendered === 'string' ? rendered : ''

    canvasElement.innerHTML = html
    executeScripts(canvasElement)
    simulatePageLoad(canvasElement)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack || '' : ''
    canvasElement.innerHTML = `
      <div style="color: #dc2626; background: #fef2f2; padding: 16px; border-radius: 8px; font-family: system-ui;">
        <strong>Failed to render Astro component</strong>
        <pre style="margin: 8px 0 0; white-space: pre-wrap;">${escapeHtml(message)}</pre>
        <details style="margin-top: 8px;"><summary>Stack trace</summary>
        <pre style="font-size: 11px; white-space: pre-wrap;">${escapeHtml(stack)}</pre>
        </details>
      </div>
    `
  }
}

function executeScripts(container: HTMLElement) {
  container.querySelectorAll('script').forEach((oldScript) => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value)
    })
    newScript.textContent = oldScript.textContent
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ---------------------------------------------------------------------------
// Source transformer for docs panel (unchanged from storybook-astro)
// ---------------------------------------------------------------------------
function getComponentName(context: any): string {
  const { component, title } = context
  if (component) {
    if (component.displayName) return component.displayName
    if (component.name && component.name !== 'default') return component.name
    if (component.__docgenInfo?.displayName) return component.__docgenInfo.displayName
  }
  const parts = title.split('/')
  return parts[parts.length - 1]
}

function formatPropValue(value: unknown): string {
  if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`
  if (typeof value === 'number' || typeof value === 'boolean') return `{${value}}`
  if (value === null || value === undefined) return `{${value}}`
  if (Array.isArray(value) || typeof value === 'object') return `{${JSON.stringify(value, null, 2)}}`
  return `{${String(value)}}`
}

function formatProps(args: Record<string, unknown>, indent = '  '): string {
  const entries = Object.entries(args).filter(([_, v]) => v !== undefined)
  if (entries.length === 0) return ''
  if (entries.length === 1) {
    const [key, value] = entries[0]
    const formatted = formatPropValue(value)
    if (formatted.length < 40) return ` ${key}=${formatted}`
  }
  return '\n' + entries.map(([key, value]) => `${indent}${key}=${formatPropValue(value)}`).join('\n') + '\n'
}

function transformSource(code: string, context: any): string {
  if (context.parameters?.docs?.source?.code) return context.parameters.docs.source.code
  const componentName = getComponentName(context)
  const { args } = context
  if (!args || Object.keys(args).length === 0) {
    return `---\nimport ${componentName} from '../components/${componentName}.astro';\n---\n\n<${componentName} />`
  }
  const propsString = formatProps(args)
  return `---\nimport ${componentName} from '../components/${componentName}.astro';\n---\n\n<${componentName}${propsString}/>`
}

// ---------------------------------------------------------------------------
// Parameters & global asset injection (unchanged from storybook-astro)
// ---------------------------------------------------------------------------
export const parameters = {
  renderer: 'astro',
  docs: {
    story: { inline: true },
    source: { language: 'astro', transform: transformSource },
  },
}

async function injectGlobalAssets() {
  try {
    const { stylesheets } = await import('virtual:astro-storybook/styles')
    stylesheets.forEach((href: string) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    })
  } catch { /* no stylesheets configured */ }
  try {
    const { scripts } = await import('virtual:astro-storybook/scripts')
    scripts.forEach((src: string) => {
      const script = document.createElement('script')
      script.src = src
      document.body.appendChild(script)
    })
  } catch { /* no scripts configured */ }
}

if (typeof document !== 'undefined') {
  injectGlobalAssets()
}
