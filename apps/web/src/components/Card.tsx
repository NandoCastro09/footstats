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
  default: "border-line bg-white",
  stat: "border-primary-light bg-primary-light",
  live: "border-live bg-white",
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
        "rounded-card border p-4 shadow-sm",
        variantStyles[variant],
        interactive && "transition-shadow duration-200 hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
