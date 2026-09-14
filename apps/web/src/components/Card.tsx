import React from "react";

interface CardProps {
  variant?: "default" | "match" | "stat";
  status?: "live" | "finished" | "scheduled";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Card({
  variant = "default",
  status,
  children,
  onClick,
  className = "",
}: CardProps) {
  const baseStyles =
    "rounded-lg shadow-sm border transition-all duration-200 p-4";

  const variantStyles = {
    default:
      "bg-white border-gray-200 hover:shadow-md hover:border-blue-200",
    match:
      "bg-white border-gray-200 hover:shadow-md cursor-pointer",
    stat:
      "bg-blue-50 border-blue-200 hover:shadow-md",
  };

  const statusStyles = {
    live: "border-orange-500 bg-orange-50",
    finished: "border-gray-300 bg-white opacity-75",
    scheduled: "border-blue-300 bg-blue-50",
  };

  const finalVariant = variantStyles[variant];
  const statusStyle = status ? statusStyles[status] : "";

  return React.createElement(
    "div",
    {
      className: `${baseStyles} ${finalVariant} ${statusStyle} ${className}`,
      onClick,
    },
    children
  );
}