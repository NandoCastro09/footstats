import { cn } from "../lib/cn";
import type { FormResult } from "../types";

const formStyles: Record<FormResult, { letter: string; label: string; className: string }> = {
  W: { letter: "V", label: "Vitória", className: "bg-success text-white" },
  D: { letter: "E", label: "Empate", className: "bg-ink-muted text-white" },
  L: { letter: "D", label: "Derrota", className: "bg-danger text-white" },
};

interface FormGuideProps {
  form: FormResult[];
  size?: "sm" | "md";
  className?: string;
}

/** Últimos jogos como letras V/E/D: a cor reforça, mas a letra é que informa. */
export default function FormGuide({ form, size = "sm", className }: FormGuideProps) {
  return (
    <ol className={cn("flex gap-1", className)} aria-label="Últimos jogos, do mais antigo ao mais recente">
      {form.map((result, index) => {
        const style = formStyles[result];
        return (
          <li
            key={index}
            className={cn(
              "inline-flex items-center justify-center rounded font-bold",
              size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm",
              style.className
            )}
          >
            <span aria-hidden="true">{style.letter}</span>
            <span className="sr-only">{style.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
