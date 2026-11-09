import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export default function Skeleton({
  className,
  as: Tag = "div",
}: {
  className?: string;
  as?: "div" | "span";
}) {
  return (
    <Tag
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-control bg-[#18201B]",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:content-['']",
        "after:bg-[linear-gradient(90deg,transparent,rgba(238,242,236,0.06),transparent)]",
        className
      )}
    />
  );
}

export function SkeletonRegion({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  itemClassName = "h-48",
  label = "Carregando…",
  className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  itemClassName?: string;
  label?: string;
  className?: string;
}) {
  return (
    <SkeletonRegion label={label}>
      <div className={className}>
        {Array.from({ length: count }, (_, index) => (
          <Skeleton key={index} className={cn("rounded-card", itemClassName)} />
        ))}
      </div>
    </SkeletonRegion>
  );
}
