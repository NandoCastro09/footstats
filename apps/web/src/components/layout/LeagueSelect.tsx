import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { useLeague } from "../../league/leagueContext";

export default function LeagueSelect({ className }: { className?: string }) {
  const { code, competition, competitions, setLeague } = useLeague();
  const id = useId();

  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      <label
        htmlFor={id}
        className="sr-only text-xs font-semibold uppercase tracking-[0.14em] text-muted sm:not-sr-only"
      >
        Liga
      </label>
      <div className="relative w-full min-w-0 md:w-72">
        {competition && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#F4F6F1] p-1"
          >
            <img src={competition.emblem} alt="" width={28} height={28} className="h-full w-full object-contain" />
          </span>
        )}
        <select
          id={id}
          value={code}
          onChange={(event) => setLeague(event.target.value)}
          disabled={competitions.length === 0}
          className={cn(
            "h-11 w-full min-w-0 appearance-none truncate rounded-full border border-line-field bg-surface pr-10 text-sm font-medium text-ink hover:border-lime",
            competition ? "pl-12" : "pl-4"
          )}
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
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
