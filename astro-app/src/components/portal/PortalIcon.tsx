import { getIconData, iconToSVG, iconToHTML } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/utils";
import lucideIcons from "@iconify-json/lucide/icons.json";

/**
 * Props for the {@link PortalIcon} component.
 */
interface PortalIconProps {
  /**
   * The Lucide icon name to render.
   *
   * Use the `"lucide:name"` format or just `"name"` — the `"lucide:"` prefix is optional.
   * Browse available icons at {@link https://lucide.dev/icons}.
   *
   * @example "lucide:folder"
   * @example "calendar"
   * @example "git-pull-request"
   */
  name: string;
  /**
   * Tailwind CSS classes applied to the rendered `<svg>` element.
   *
   * Use Tailwind size utilities to control dimensions (e.g., `"size-4"`, `"size-6"`).
   *
   * @default "size-5"
   */
  className?: string;
}

/**
 * A React-compatible icon component for portal pages.
 *
 * This is the React equivalent of the Astro-only `<Icon>` component (`components/ui/icon/`).
 * It uses the same `@iconify/utils` + `@iconify-json/lucide` packages under the hood,
 * so icons look identical whether rendered by Astro or React.
 *
 * **Why this exists:**
 * The site's `<Icon>` component is an `.astro` file — it can only be used inside `.astro`
 * templates, not inside `.tsx` React components. `PortalIcon` gives React developers
 * the same icon rendering capability.
 *
 * **Bundle size warning:**
 * This component imports the full Lucide icon set (~500KB of JSON data). When used
 * **without** a `client:*` directive (server-rendered only), this has zero impact on
 * the browser — the JSON never ships to the client. But if you add `client:load` or
 * `client:visible` to a parent component, all that icon data gets bundled into JS.
 *
 * **Rule of thumb:**
 * - Server-rendered (no directive) — use `PortalIcon` freely
 * - Client-hydrated (`client:load` etc.) — use inline `<svg>` or install `lucide-react`
 *
 * @example
 * ```tsx
 * // Basic usage inside a React component
 * import PortalIcon from "./PortalIcon";
 *
 * function MyComponent() {
 *   return <PortalIcon name="folder" />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom size and color
 * <PortalIcon name="calendar" className="size-6 text-primary" />
 * ```
 *
 * @example
 * ```astro
 * ---
 * // In an .astro file — rendered server-side, zero JS sent to browser
 * import PortalIcon from "@/components/portal/PortalIcon";
 * ---
 * <PortalIcon name="activity" />
 * ```
 *
 * @see {@link https://lucide.dev/icons} for the full list of available icon names
 * @see `astro-app/src/components/ui/icon/icon.astro` for the Astro equivalent
 */
export default function PortalIcon({
  name,
  className = "size-5",
}: PortalIconProps) {
  const iconName = name.includes(":") ? name.split(":")[1] : name;
  const data = getIconData(lucideIcons as unknown as IconifyJSON, iconName);
  if (!data) return null;

  const svg = iconToSVG(data);
  const html = iconToHTML(svg.body, { ...svg.attributes, class: className });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
