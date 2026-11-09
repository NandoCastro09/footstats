import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface PageHeroProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export default function PageHero({ eyebrow, title, description, children, aside, className }: PageHeroProps) {
  return (
    <header
      className={cn(
        "grid items-center gap-8 pt-4 sm:pt-8 lg:pt-12",
        Boolean(aside) && "grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))]",
        className
      )}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          <span className="h-2 w-2 shrink-0 rounded-full bg-lime" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="mt-3 break-words font-display text-[clamp(48px,11vw,128px)] font-extrabold uppercase leading-[0.85] text-ink">
          {title}
        </h1>
        {description && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">{description}</p>}
        {children}
      </div>
      {aside && <div className="min-w-0">{aside}</div>}
    </header>
  );
}

export function HeroStats({ items }: { items: Array<{ value: ReactNode; label: string; accent?: boolean }> }) {
  return (
    <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse">
          <dt className="text-[13px] text-muted">{item.label}</dt>
          <dd
            className={cn(
              "font-display text-[44px] font-bold leading-none tabular-nums",
              item.accent ? "text-lime" : "text-ink"
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionTitle({
  id,
  children,
  className,
  size = "lg",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <h2
      id={id}
      className={cn(
        "font-display font-extrabold uppercase leading-none text-ink",
        size === "lg" ? "text-[28px] sm:text-4xl" : "text-[28px]",
        className
      )}
    >
      {children}
    </h2>
  );
}
