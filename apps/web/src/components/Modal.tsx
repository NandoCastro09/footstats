import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./Button";
import { cn } from "../lib/cn";
import type { ButtonVariant } from "./styles";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  confirmLoading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
};

// Modais abertos, do mais antigo ao mais novo. Só o do topo responde ao teclado,
// para um modal aberto por cima de outro (ex.: confirmar exclusão) não fechar os dois no Esc.
const openStack: HTMLElement[] = [];

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  confirmLoading = false,
  size = "md",
}: ModalProps) {
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    if (dialog) openStack.push(dialog);

    const initial =
      dialog?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0];
    (initial ?? dialog)?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (openStack[openStack.length - 1] !== dialog) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      const index = dialog ? openStack.indexOf(dialog) : -1;
      if (index !== -1) openStack.splice(index, 1);
      // O elemento que abriu o modal pode ter sumido (ex.: card excluído); aí volta para o modal de baixo.
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
      else openStack[openStack.length - 1]?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-2xl",
          sizeStyles[size]
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2 id={titleId} className="text-xl font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-control text-ink-soft hover:bg-surface-raised hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        <div id={bodyId} className="min-h-0 overflow-y-auto px-6 py-5 text-ink">
          {children}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-surface-raised px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} data-autofocus>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={confirmLoading}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
