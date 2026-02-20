interface PortalSkeletonProps {
  lines?: number;
  showIcon?: boolean;
}

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
