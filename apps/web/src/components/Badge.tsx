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
  // Pílula sólida, como o "AO VIVO" do protótipo (branco sobre coral escuro: 5.7:1).
  live: "rounded-full bg-live-strong text-white",
  info: "bg-primary-light text-primary-bright",
  default: "border border-line bg-surface-raised text-ink-soft",
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
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase leading-none tracking-[0.08em]",
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
