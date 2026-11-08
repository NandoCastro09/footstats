import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import { ToastContext, type Toast, type ToastApi, type ToastVariant } from "./toastContext";

const DURATION_MS = 6000;

const styles: Record<ToastVariant, { icon: typeof CheckCircle2; className: string; iconClass: string }> = {
  success: { icon: CheckCircle2, className: "border-success", iconClass: "text-success" },
  error: { icon: XCircle, className: "border-danger", iconClass: "text-danger" },
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, variant, title, description }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Região sempre presente: leitores de tela anunciam o que entra nela. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => {
          const { icon: Icon, className, iconClass } = styles[toast.variant];
          return (
            <div
              key={toast.id}
              role={toast.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border-l-4 bg-white p-4 shadow-lg",
                className
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{toast.title}</p>
                {toast.description && (
                  <p className="text-sm text-ink-muted">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-2 inline-flex min-h-touch min-w-touch items-center justify-center rounded-control text-ink-muted hover:bg-surface-subtle hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Fechar aviso</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
