import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarX2, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import FilterPills from "../components/FilterPills";
import Input from "../components/Input";
import MatchCard from "../components/MatchCard";
import { SkeletonGrid } from "../components/Skeleton";
import { useMatches } from "../hooks/useApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePageTitle } from "../hooks/usePageTitle";
import LeagueTag from "../components/LeagueTag";
import { useLeague } from "../league/leagueContext";
import type { MatchStatus } from "../types";

type StatusFilter = MatchStatus | "all";

const icon = "h-4 w-4";
const statusOptions: Array<{ value: StatusFilter; label: string; icon?: ReactNode }> = [
  { value: "all", label: "Todas" },
  // Ponto coral pulsando, como a pílula "Ao vivo" do protótipo.
  { value: "live", label: "Ao vivo", icon: <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-live" aria-hidden="true" /> },
  { value: "scheduled", label: "Agendadas", icon: <Clock className={icon} aria-hidden="true" /> },
  { value: "finished", label: "Encerradas", icon: <CheckCircle2 className={icon} aria-hidden="true" /> },
];

const groups: Array<{ status: MatchStatus; title: string; icon: ReactNode }> = [
  { status: "live", title: "Ao vivo", icon: <span className="h-2 w-2 animate-live-pulse rounded-full bg-live" aria-hidden="true" /> },
  { status: "scheduled", title: "Próximas partidas", icon: <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> },
  { status: "finished", title: "Resultados", icon: <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" /> },
];

function parseStatus(value: string | null): StatusFilter {
  return value === "live" || value === "scheduled" || value === "finished" ? value : "all";
}

export default function MatchesPage() {
  usePageTitle("Partidas");

  // Filtros ficam na URL (?status=live&q=gremio): dá para compartilhar o link.
  const [params, setParams] = useSearchParams();
  const status = parseStatus(params.get("status"));
  const search = params.get("q") ?? "";
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { code: competition } = useLeague();
  const { data: matches, isPending, isError, error, refetch, isFetching, isPlaceholderData } =
    useMatches({
      competition,
      status: status === "all" ? undefined : status,
      search: debouncedSearch || undefined,
    });

  function updateParam(key: "status" | "q", value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value && value !== "all") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  }

  const hasFilters = status !== "all" || search !== "";
  const clearFilters = () => setParams({}, { replace: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Partidas</h1>
        <p className="mt-1 text-ink-muted">Jogos ao vivo, próximos e resultados recentes.</p>
        <div className="mt-2">
          <LeagueTag />
        </div>
      </header>

      <form
        role="search"
        aria-label="Filtrar partidas"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-4 rounded-card border border-line bg-surface p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <Input
          label="Buscar por time"
          type="search"
          placeholder="Nome ou sigla do time"
          value={search}
          onChange={(event) => updateParam("q", event.target.value)}
          autoComplete="off"
          maxLength={50}
        />
        <FilterPills
          legend="Status da partida"
          name="status"
          options={statusOptions}
          value={status}
          onChange={(value) => updateParam("status", value)}
        />
      </form>

      {/* Anuncia o resultado do filtro para leitores de tela. */}
      <p aria-live="polite" className="flex min-h-6 items-center gap-2 text-sm text-ink-muted">
        {isFetching && !isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Atualizando…
          </>
        ) : (
          matches &&
          !isError &&
          `${matches.length} ${matches.length === 1 ? "partida encontrada" : "partidas encontradas"}`
        )}
      </p>

      {isPending ? (
        <SkeletonGrid count={6} itemClassName="h-52" label="Carregando partidas…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="h-10 w-10 text-ink-muted" aria-hidden="true" />}
          title="Nenhuma partida encontrada"
          description={
            hasFilters
              ? "Nenhum jogo combina com a busca e o filtro escolhidos."
              : "Não há partidas cadastradas no momento."
          }
          action={
            hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )
          }
        />
      ) : (
        // Agrupa por status (a API já devolve na ordem: ao vivo, próximas, encerradas).
        <div className={`space-y-8 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
          {groups.map((group) => {
            const items = matches.filter((match) => match.status === group.status);
            if (items.length === 0) return null;
            return (
              <section key={group.status} aria-labelledby={`grupo-${group.status}`} className="space-y-3">
                <h2 id={`grupo-${group.status}`} className="eyebrow flex items-center gap-2">
                  {group.icon}
                  {group.title}
                  <span className="font-medium">· {items.length}</span>
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((match) => (
                    <li key={match.id}>
                      <MatchCard match={match} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
