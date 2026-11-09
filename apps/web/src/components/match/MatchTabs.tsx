import { useRef, type KeyboardEvent } from "react";
import { cn } from "../../lib/cn";
import { panelId, tabId } from "./tabIds";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface MatchTabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Prefixo dos ids (liga cada aba ao seu painel). */
  idPrefix: string;
  label: string;
}

/**
 * Abas no padrão ARIA (role="tablist"): setas trocam de aba, Home/End vão
 * para a primeira/última e só a aba ativa entra no Tab do teclado.
 * Visual do protótipo: segmento claro sobre o degradê azul.
 */
export default function MatchTabs<T extends string>({
  tabs,
  active,
  onChange,
  idPrefix,
  label,
}: MatchTabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 rounded-control bg-black/30 p-1"
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "min-h-touch flex-1 rounded-lg px-2 text-sm font-semibold transition-colors",
              selected
                ? "bg-lime text-ink-inverse"
                : "text-ink-2 hover:bg-surface hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
