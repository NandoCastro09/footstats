import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  /** Nome do grupo para leitores de tela ("Status da partida"). */
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Grupo segmentado num trilho escuro. Cada opção é um <button aria-pressed>,
 * então Tab, Enter/Espaço e leitores de tela funcionam sem código extra.
 */
export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-1 rounded-[14px] border border-line bg-bg p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-touch flex-auto items-center justify-center gap-2 rounded-[10px] px-4 text-sm transition-colors",
              active ? "bg-lime font-bold text-ink-inverse" : "font-medium text-ink-2 hover:bg-surface hover:text-ink"
            )}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums",
                  active ? "bg-ink-inverse/15 text-ink-inverse" : "bg-surface text-ink-2"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
