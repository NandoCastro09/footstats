import { useId, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../lib/cn";

/** Props de acessibilidade que o Field entrega para o controle (input/select/textarea). */
export interface FieldControlProps {
  id: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

export interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
}

interface FieldWrapperProps extends FieldProps {
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label + dica + controle + mensagem de erro, já ligados por id:
 * aria-invalid quando há erro e aria-describedby apontando dica e erro.
 */
export default function Field({
  label,
  error,
  hint,
  required,
  id,
  className,
  children,
}: FieldWrapperProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={controlId} className="text-sm font-medium text-ink">
        {label}
        {/* O atributo required já é anunciado pelo leitor de tela; o * é só visual. */}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {children({
        id: controlId,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      <p
        id={errorId}
        aria-live="polite"
        className="flex min-h-5 items-start gap-1 text-sm font-medium text-danger"
      >
        {error && (
          <>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </>
        )}
      </p>
    </div>
  );
}
