import type { ReactNode } from "react";
import PortalIcon from "./PortalIcon";

interface PortalCardProps {
  title: string;
  description: string;
  icon?: string;
  href?: string;
  disabled?: boolean;
  badge?: string;
  children?: ReactNode;
}

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
