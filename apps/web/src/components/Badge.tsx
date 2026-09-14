import React from "react";

interface BadgeProps {
  variant?: "success" | "error" | "warning" | "live" | "default";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-block px-3 py-1 rounded-full text-sm font-medium transition-all";

  const variantStyles = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    live: "bg-orange-100 text-orange-800 border border-orange-500",
    default: "bg-gray-200 text-gray-800",
  };

  return React.createElement(
    "span",
    {
      className: `${baseStyles} ${variantStyles[variant]} ${className}`,
    },
    children
  );
}