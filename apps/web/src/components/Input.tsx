import React from "react";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "search";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = false,
  disabled = false,
  className = "",
  label,
}: InputProps) {
  return React.createElement(
    "div",
    { className: `flex flex-col gap-2 ${className}` },
    label
      ? React.createElement(
          "label",
          {
            className:
              "text-sm font-medium text-gray-900 uppercase tracking-wide",
          },
          label
        )
      : null,

    React.createElement("input", {
      type,
      placeholder,
      value,
      onChange,
      disabled,
      className: `
        px-4 py-3 rounded-lg border-2 transition-all duration-200
        font-medium text-gray-900 placeholder-gray-500
        ${
          error
            ? "border-red-500 bg-red-50 focus:outline-none focus:border-red-600"
            : "border-gray-300 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500"
        }
        ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60" : ""}
      `,
    })
  );
}