import { cn } from "../lib/cn";

/** Bloco cinza animado que ocupa o lugar do conteúdo enquanto carrega. */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-control bg-line/60", className)}
    />
  );
}

/** Grid de placeholders com anúncio para leitores de tela. */
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
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className={className}>
        {Array.from({ length: count }, (_, index) => (
          <Skeleton key={index} className={cn("rounded-card", itemClassName)} />
        ))}
      </div>
    </div>
  );
}
