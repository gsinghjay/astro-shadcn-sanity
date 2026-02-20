/**
 * Props for the {@link PortalSkeleton} component.
 */
interface PortalSkeletonProps {
  /**
   * Number of horizontal bars to render. The last bar is shorter (60% width)
   * to create a natural "paragraph ending" look.
   *
   * @default 3
   */
  lines?: number;
  /**
   * When true, renders a small square placeholder above the text lines.
   * Use when the final content will include an icon or avatar.
   *
   * @default false
   */
  showIcon?: boolean;
}

/**
 * An animated loading placeholder for portal cards and panels.
 *
 * Renders pulsing gray bars that indicate content is loading or will be
 * available in a future release. The bars use the site's `bg-accent` color
 * with a CSS `animate-pulse` animation — no JavaScript needed for the animation.
 *
 * **Design note:** Bars have sharp corners (no border-radius) to match the
 * Swiss design system used throughout the site.
 *
 * **Astro integration:**
 * This component works identically whether server-rendered or client-hydrated.
 * Since it has no state or interactivity, it's typically rendered without a
 * `client:*` directive (static HTML with CSS animation).
 *
 * @example
 * ```tsx
 * // Inside a React component
 * import PortalSkeleton from "./PortalSkeleton";
 *
 * // Default: 3 lines, no icon
 * <PortalSkeleton />
 *
 * // 2 short lines (for compact cards)
 * <PortalSkeleton lines={2} />
 *
 * // With an icon placeholder square
 * <PortalSkeleton lines={3} showIcon />
 * ```
 *
 * @example
 * ```astro
 * ---
 * // Typical usage: inside a PortalCard as a placeholder for future content
 * import PortalCard from "@/components/portal/PortalCard";
 * import PortalSkeleton from "@/components/portal/PortalSkeleton";
 * ---
 *
 * <PortalCard title="Events" description="..." icon="calendar" disabled>
 *   <PortalSkeleton lines={2} />
 * </PortalCard>
 * ```
 *
 * @see {@link PortalCard} where this is commonly used as children
 */
export default function PortalSkeleton({
  lines = 3,
  showIcon = false,
}: PortalSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      {showIcon && (
        <div className="bg-accent animate-pulse size-8" />
      )}
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="bg-accent animate-pulse h-4"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}
