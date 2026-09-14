import React from "react";

interface ButtonProps {
  variant?: "primary" | "coral" | "disabled";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 cursor-pointer";

  const variantStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-700 active:bg-blue-800",
    coral: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
    disabled: "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const finalVariant = disabled ? "disabled" : variant;

  return React.createElement(
    "button",
    {
      className: `${baseStyles} ${variantStyles[finalVariant]} ${sizeStyles[size]} ${className}`,
      onClick,
      disabled,
    },
    children,
  );
}