import type { ReactNode } from "react";

interface PortalCardProps {
  title: string;
  description: string;
  icon: string;
  href?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export default function PortalCard({
  title,
  description,
  href,
  disabled,
  children,
}: PortalCardProps) {
  const content = (
    <>
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold leading-none">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="mt-auto pt-4">{children}</div>}
    </>
  );

  if (disabled || !href) {
    return (
      <div className="bg-card text-card-foreground flex flex-col border p-6 shadow-sm opacity-60">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      className="bg-card text-card-foreground flex flex-col border p-6 shadow-sm transition-colors duration-100 hover:bg-accent/50"
    >
      {content}
    </a>
  );
}
