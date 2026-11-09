import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface FilterOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface FilterPillsProps<T extends string> {
  legend: string;
  name: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Grupo de filtros com cara de "pílulas", mas feito de radios nativos:
 * setas do teclado, Tab e leitores de tela funcionam sem código extra.
 */
export default function FilterPills<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  return (
    <fieldset className={className}>
      <legend className="eyebrow mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "inline-flex min-h-touch cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
              "border-line bg-surface-raised text-ink-soft hover:border-primary hover:text-ink",
              "has-[:checked]:border-primary-solid has-[:checked]:bg-primary-solid has-[:checked]:font-semibold has-[:checked]:text-white",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.icon}
            {option.label}
            {option.count !== undefined && (
              <span className="tabular-nums opacity-90">({option.count})</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
