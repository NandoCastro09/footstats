import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Badge from "../components/Badge";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeleton";
import { useCompetitions } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { cn } from "../lib/cn";
import { useLeague } from "../league/leagueContext";

export default function LeaguesPage() {
  usePageTitle("Ligas");
  const { code } = useLeague();
  const { data: competitions, isPending, isError, error, refetch, isFetching } = useCompetitions();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Ligas</h1>
        <p className="mt-1 text-ink-muted">
          Escolha a competição. Partidas, classificação, artilharia e palpites passam a mostrar a
          liga escolhida.
        </p>
      </header>

      {isPending ? (
        <SkeletonGrid count={10} itemClassName="h-28" label="Carregando ligas…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => {
            const selected = competition.code === code;
            return (
              <li key={competition.code}>
                <Link
                  to={`/?liga=${competition.code}`}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "flex h-full items-center gap-4 rounded-card border bg-surface p-4 transition-colors",
                    selected
                      ? "border-2 border-primary bg-primary-light/50"
                      : "border-line hover:border-line-strong"
                  )}
                >
                  <img
                    src={competition.emblem}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    className="logo-outline h-14 w-14 shrink-0 object-contain"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold text-ink">
                      {competition.name}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {competition.country} · temporada {competition.season}
                    </span>
                  </span>
                  {selected && (
                    <Badge
                      variant="info"
                      icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    >
                      Atual
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
