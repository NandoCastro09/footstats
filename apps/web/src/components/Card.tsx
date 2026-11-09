import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type CardElement = "div" | "article" | "section" | "li";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement;
  variant?: "default" | "stat" | "live";
  interactive?: boolean;
  children: ReactNode;
}

const variantStyles = {
  default: "border-line bg-surface",
  stat: "border-line bg-surface",
  // Partida ao vivo: borda laranja (sem gradiente).
  live: "border-live/50 bg-surface",
};

export default function Card({
  as: Component = "div",
  variant = "default",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-card border p-4",
        variantStyles[variant],
        interactive && "transition-colors duration-200 hover:border-line-strong",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
