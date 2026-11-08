import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type BadgeVariant = "success" | "error" | "warning" | "live" | "info" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Todas as combinações texto/fundo passam no AA (≥ 4.5:1).
const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success-light text-success",
  error: "bg-danger-light text-danger",
  warning: "bg-warning-light text-warning-text",
  live: "border border-live bg-live-light text-live-strong",
  info: "bg-primary-light text-primary",
  default: "border border-line bg-surface-subtle text-ink-muted",
};

export default function Badge({
  variant = "default",
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
