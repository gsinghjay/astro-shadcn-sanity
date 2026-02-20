import type { ReactNode } from "react";
import PortalIcon from "./PortalIcon";

/**
 * Props for the {@link PortalCard} component.
 */
interface PortalCardProps {
  /** The card heading displayed prominently at the top. */
  title: string;
  /** A short explanation shown below the title in muted text. */
  description: string;
  /**
   * Lucide icon name displayed in a square container above the title.
   * Uses {@link PortalIcon} internally — same naming convention.
   *
   * @example "lucide:folder"
   * @example "calendar"
   * @see {@link https://lucide.dev/icons} for available icons
   */
  icon?: string;
  /**
   * When provided and the card is not disabled, the entire card becomes a clickable link.
   * This is a standard `<a href>` — not a React Router link — because Astro uses
   * full-page navigation, not client-side routing.
   */
  href?: string;
  /**
   * When true, the card is grayed out (60% opacity) and not clickable.
   * Use for features that aren't built yet — the card still renders to show
   * what's coming, but users can't interact with it.
   */
  disabled?: boolean;
  /**
   * Small text label shown next to the title (e.g., "Coming Soon", "New", "Beta").
   * Renders as an inline badge with secondary styling.
   */
  badge?: string;
  /**
   * Content rendered below the title and description.
   *
   * In Astro, you pass children by nesting elements inside the component tag.
   * This works the same way whether you use a `client:*` directive or not.
   *
   * Common use: pass a {@link PortalSkeleton} as a placeholder for data that
   * will be loaded in a future story.
   *
   * @example
   * ```astro
   * <PortalCard title="My Projects" description="..." icon="folder" disabled>
   *   <PortalSkeleton lines={2} />
   * </PortalCard>
   * ```
   */
  children?: ReactNode;
}

/**
 * A card component for the portal landing page and section overviews.
 *
 * Renders a bordered card with an optional icon, title, badge, description, and
 * a children slot for additional content (loading skeletons, stats, etc.).
 *
 * **Two rendering modes:**
 * - **Disabled** (`disabled={true}` or no `href`): renders as a `<div>` with reduced
 *   opacity. Use for features that aren't built yet.
 * - **Active** (`href` provided, not disabled): renders as an `<a>` tag that navigates
 *   to the given URL on click. Has a hover highlight effect.
 *
 * **Astro integration notes:**
 *
 * This is a React component (`.tsx`), but on the portal landing page it's used
 * **without** a `client:*` directive. That means Astro renders it to plain HTML on
 * the server and sends zero JavaScript to the browser — the card is static content.
 *
 * If you later need interactivity (click handlers, state, effects), add a directive
 * in the `.astro` file where you use it:
 *
 * ```astro
 * <!-- Static (current usage) — zero JS -->
 * <PortalCard title="..." description="..." icon="folder" />
 *
 * <!-- Interactive — React JS ships to browser -->
 * <PortalCard client:load title="..." description="..." icon="folder" />
 * ```
 *
 * @example
 * ```astro
 * ---
 * // In a .astro page
 * import PortalCard from "@/components/portal/PortalCard";
 * import PortalSkeleton from "@/components/portal/PortalSkeleton";
 * ---
 *
 * <!-- Disabled placeholder card -->
 * <PortalCard
 *   title="My Projects"
 *   description="View your sponsored capstone projects"
 *   icon="folder"
 *   badge="Coming Soon"
 *   disabled
 * >
 *   <PortalSkeleton lines={2} />
 * </PortalCard>
 *
 * <!-- Active linked card (when the feature is built) -->
 * <PortalCard
 *   title="My Projects"
 *   description="View your sponsored capstone projects"
 *   icon="folder"
 *   href="/portal/projects"
 * >
 *   <p>3 active projects</p>
 * </PortalCard>
 * ```
 *
 * @see {@link PortalIcon} for icon rendering details
 * @see {@link PortalSkeleton} for the loading placeholder typically used as children
 * @see `docs/team/portal-react-islands-guide.md` for the full Astro + React guide
 */
export default function PortalCard({
  title,
  description,
  icon,
  href,
  disabled,
  badge,
  children,
}: PortalCardProps) {
  const content = (
    <>
      {icon && (
        <div className="flex size-10 items-center justify-center bg-muted">
          <PortalIcon name={icon} className="size-5" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold leading-none">{title}</h3>
          {badge && (
            <span className="bg-secondary text-secondary-foreground px-1.5 py-0.5 text-[10px] font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="mt-auto pt-4">{children}</div>}
    </>
  );

  if (disabled || !href) {
    return (
      <div className="bg-card text-card-foreground flex flex-col gap-3 border p-6 shadow-sm opacity-60">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      className="bg-card text-card-foreground flex flex-col gap-3 border p-6 shadow-sm transition-colors duration-100 hover:bg-accent/50"
    >
      {content}
    </a>
  );
}
