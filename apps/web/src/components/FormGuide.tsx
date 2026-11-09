import { cn } from "../lib/cn";
import type { FormResult } from "../types";

const formStyles: Record<FormResult, { letter: string; label: string; className: string }> = {
  // A letra é que informa; a cor só reforça. Contrastes: V 15:1, E 8:1, D 7.6:1.
  W: { letter: "V", label: "vitória", className: "bg-lime text-ink-inverse" },
  D: { letter: "E", label: "empate", className: "bg-surface-strong text-ink" },
  L: { letter: "D", label: "derrota", className: "bg-alert text-ink-inverse" },
};

const sizes = {
  sm: "h-6 w-6 text-sm",
  md: "h-8 w-8 text-base",
  lg: "h-7 w-7 text-base", // 28px (página do time)
};

interface FormGuideProps {
  form: FormResult[];
  size?: keyof typeof sizes;
  /** Contorno claro + "mais recente" no último jogo. */
  markLatest?: boolean;
  className?: string;
}

/** Últimos jogos como quadradinhos V/E/D, do mais antigo ao mais recente. */
export default function FormGuide({ form, size = "sm", markLatest = false, className }: FormGuideProps) {
  const description = form.map((result) => formStyles[result].label).join(", ");
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="img"
        aria-label={`Últimos ${form.length} jogos, do mais antigo ao mais recente: ${description}`}
        className="flex gap-1"
      >
        {form.map((result, index) => {
          const style = formStyles[result];
          const latest = markLatest && index === form.length - 1;
          return (
            <span
              key={index}
              aria-hidden="true"
              className={cn(
                "inline-flex items-center justify-center rounded-md font-display font-bold",
                sizes[size],
                style.className,
                latest && "outline outline-2 outline-offset-2 outline-ink"
              )}
            >
              {style.letter}
            </span>
          );
        })}
      </div>
      {markLatest && form.length > 0 && (
        <span aria-hidden="true" className="text-xs text-muted">
          ← mais recente
        </span>
      )}
    </div>
  );
}
