import { useId } from "react";
import { cn } from "../../lib/cn";
import { useLeague } from "../../league/leagueContext";

/** Seletor de liga do header (select nativo: teclado e leitor de tela funcionam). */
export default function LeagueSelect({ className }: { className?: string }) {
  const { code, competitions, setLeague } = useLeague();
  const id = useId();

  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      {/* Em telas estreitas o rótulo some da vista, mas continua para leitores de tela. */}
      <label htmlFor={id} className="eyebrow sr-only sm:not-sr-only">
        Liga
      </label>
      <select
        id={id}
        value={code}
        onChange={(event) => setLeague(event.target.value)}
        disabled={competitions.length === 0}
        className="min-h-touch w-full min-w-0 rounded-full border border-line-strong bg-surface-raised px-4 text-sm font-medium text-ink hover:border-primary md:w-60"
      >
        {competitions.length === 0 ? (
          <option value={code}>Carregando ligas…</option>
        ) : (
          competitions.map((competition) => (
            <option key={competition.code} value={competition.code}>
              {competition.name} ({competition.country})
            </option>
          ))
        )}
      </select>
    </div>
  );
}
