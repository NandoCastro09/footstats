import React from "react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return React.createElement(
    "div",
    {
      className:
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
      onClick: onClose,
    },
    React.createElement(
      "div",
      {
        className: `bg-white rounded-lg shadow-2xl ${sizeStyles[size]} w-full transform transition-all`,
        onClick: (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation(),
      },
      // Header
      React.createElement(
        "div",
        { className: "bg-blue-50 border-b border-blue-200 p-6" },
        React.createElement(
          "h2",
          { className: "text-xl font-bold text-blue-900" },
          title
        )
      ),

      // Content
      React.createElement(
        "div",
        { className: "p-6" },
        children
      ),

      // Footer
      React.createElement(
        "div",
        {
          className:
            "bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3",
        },
        <Button variant="primary" onClick={onClose}>
          {cancelText}
        </Button>,
        onConfirm ? (
          <Button variant="coral" onClick={onConfirm}>
            {confirmText}
          </Button>
        ) : null
      )
    )
  );
}
