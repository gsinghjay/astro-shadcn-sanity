import { getIconData, iconToSVG, iconToHTML } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/utils";
import lucideIcons from "@iconify-json/lucide/icons.json";

interface PortalIconProps {
  name: string;
  className?: string;
}

/**
 * React icon component for portal pages.
 * Uses the same @iconify/utils + @iconify-json/lucide packages as the Astro Icon component.
 *
 * Usage:
 *   <PortalIcon name="lucide:folder" />
 *   <PortalIcon name="folder" />           // "lucide:" prefix is optional
 *   <PortalIcon name="calendar" className="size-6 text-primary" />
 *
 * NOTE: This component imports the full lucide icon set (~500KB).
 * Use WITHOUT a client:* directive (SSR-only) to avoid bundling icons into client JS.
 * If you need a client-side icon, use a static <svg> or install lucide-react.
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
