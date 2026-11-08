import { useId } from "react";
import { cn } from "../../lib/cn";
import { useLeague } from "../../league/leagueContext";

/** Seletor de liga do header (select nativo: teclado e leitor de tela funcionam). */
export default function LeagueSelect({ className }: { className?: string }) {
  const { code, competitions, setLeague } = useLeague();
  const id = useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-white">
        Liga
      </label>
      <select
        id={id}
        value={code}
        onChange={(event) => setLeague(event.target.value)}
        disabled={competitions.length === 0}
        className="min-h-touch w-full min-w-0 rounded-control border border-white/50 bg-primary-dark px-3 text-sm font-medium text-white hover:border-white md:w-56"
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
