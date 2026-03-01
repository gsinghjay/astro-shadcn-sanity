/**
 * Shared TypeScript types for portal components.
 *
 * These types are used across both `.astro` layout files and `.tsx` React components.
 * If you're coming from a pure React project, note that Astro pages (`.astro` files)
 * can also import and use these types in their frontmatter section (the `---` block
 * at the top of the file).
 *
 * @module portal/types
 *
 * @example
 * ```tsx
 * // In a React component (.tsx)
 * import type { PortalUser } from "./types";
 * ```
 *
 * @example
 * ```astro
 * ---
 * // In an Astro page (.astro) — imports go in the frontmatter (between the --- lines)
 * import type { PortalNavItem } from "@/components/portal/types";
 * ---
 * ```
 */

/**
 * The authenticated user object available on every portal page.
 *
 * This comes from Cloudflare Access JWT validation — the middleware (`src/middleware.ts`)
 * extracts the email from the JWT and puts it in `Astro.locals.user`. You never need to
 * do auth yourself; just read this object.
 *
 * **How to access it:**
 * - In `.astro` pages: `const user = Astro.locals.user;`
 * - In server endpoints: `const user = locals.user;`
 * - In React components: receive it as a prop from the `.astro` page
 *
 * @example
 * ```astro
 * ---
 * // In a portal .astro page — user is guaranteed by middleware
 * const user = Astro.locals.user!;
 * ---
 * <MyReactComponent userEmail={user.email} client:load />
 * ```
 *
 * @example
 * ```tsx
 * // In a React component — receive as a prop, NOT from context
 * interface Props {
 *   userEmail: string;
 * }
 * export default function MyComponent({ userEmail }: Props) {
 *   return <p>Hello, {userEmail}</p>;
 * }
 * ```
 */
export interface PortalUser {
  email: string;
}

/**
 * A navigation link in the portal sidebar.
 *
 * Used by `PortalLayout.astro` to render the left sidebar nav. You generally won't
 * use this directly in React components — the layout handles navigation. But it's
 * exported here in case you need to build portal-aware components that reference
 * navigation routes.
 *
 * @example
 * ```ts
 * const navItem: PortalNavItem = {
 *   href: "/portal/projects",
 *   label: "My Projects",
 *   icon: "lucide:folder",       // Any Lucide icon name
 *   disabled: true,              // Grays out the link (for unreleased features)
 *   badge: "Coming Soon",        // Small label shown next to the nav item
 * };
 * ```
 */
export interface PortalNavItem {
  /** The URL path this nav item links to (e.g., "/portal/projects"). Omit for disabled items. */
  href?: string;
  /** Display text shown in the sidebar. */
  label: string;
  /**
   * Lucide icon name. Use "lucide:folder" format or just "folder" (prefix is optional).
   * Browse available icons at https://lucide.dev/icons
   */
  icon: string;
  /** When true, the link is grayed out and not clickable. Use for features not yet built. */
  disabled?: boolean;
  /** Small text label displayed next to the nav item (e.g., "Coming Soon", "New"). */
  badge?: string;
}
