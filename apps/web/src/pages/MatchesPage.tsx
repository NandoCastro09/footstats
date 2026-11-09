import { useId, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarX2, ChevronDown, Loader2, Search } from "lucide-react";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import FeaturedMatch from "../components/FeaturedMatch";
import MatchCard from "../components/MatchCard";
import PageHero, { HeroStats, SectionTitle } from "../components/PageHero";
import SegmentedControl from "../components/SegmentedControl";
import Skeleton, { SkeletonRegion } from "../components/Skeleton";
import { FeaturedMatchSkeleton, MatchListSkeleton } from "../components/skeletons/PageSkeletons";
import LeagueTag from "../components/LeagueTag";
import { fieldBase, fieldState } from "../components/styles";
import { useMatches } from "../hooks/useApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePageTitle } from "../hooks/usePageTitle";
import { useLeague } from "../league/leagueContext";
import { cn } from "../lib/cn";
import { dayKey, formatDayHeading } from "../lib/format";
import type { Match, MatchStatus } from "../types";

type StatusFilter = MatchStatus | "all";

const groups: Array<{ status: MatchStatus; title: string; icon?: ReactNode }> = [
  {
    status: "live",
    title: "Ao vivo",
    icon: <span className="h-3 w-3 animate-live-pulse rounded-full bg-live" aria-hidden="true" />,
  },
  { status: "scheduled", title: "Próximas partidas" },
  { status: "finished", title: "Resultados recentes" },
];

/** Partidas mostradas por seção antes do botão "Mostrar mais". */
const PAGE = 8;

function parseStatus(value: string | null): StatusFilter {
  return value === "live" || value === "scheduled" || value === "finished" ? value : "all";
}

/**
 * Rodada "atual": a mais comum entre as partidas agendadas (uma partida adiada
 * de rodada antiga não puxa o número para trás). Sem agendadas, a última jogada.
 */
function currentRoundOf(matches: Match[]) {
  const scheduled = matches.filter((match) => match.status !== "finished");
  if (scheduled.length > 0) {
    const counts = new Map<number, number>();
    for (const match of scheduled) counts.set(match.round, (counts.get(match.round) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
  }
  return matches.length > 0 ? Math.max(...matches.map((match) => match.round)) : undefined;
}

/** Agrupa por dia (fuso de Brasília), mantendo a ordem que a API devolveu. */
function groupByDay(matches: Match[]) {
  const days = new Map<string, Match[]>();
  for (const match of matches) {
    const key = dayKey(match.kickoff);
    days.set(key, [...(days.get(key) ?? []), match]);
  }
  return [...days.entries()];
}

function MatchSection({
  status,
  title,
  icon,
  items,
  currentRound,
}: {
  status: MatchStatus;
  title: string;
  icon?: ReactNode;
  items: Match[];
  currentRound?: number;
}) {
  const [visible, setVisible] = useState(PAGE);
  const listId = useId();
  const shown = status === "live" ? items : items.slice(0, visible);
  const remaining = items.length - shown.length;

  return (
    <section aria-labelledby={`grupo-${status}`} className="space-y-5">
      <SectionTitle id={`grupo-${status}`} className="flex items-center gap-3">
        {icon}
        {title}
        <span className="font-sans text-base font-medium normal-case text-muted">· {items.length}</span>
      </SectionTitle>

      <div id={listId} className="space-y-6">
        {groupByDay(shown).map(([key, dayMatches]) => (
          <div key={key} className="space-y-3">
            <h3 className="flex items-center gap-4 text-[13px] font-bold uppercase tracking-[0.14em] text-lime">
              <span className="shrink-0">{formatDayHeading(dayMatches[0].kickoff)}</span>
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
              <span className="shrink-0 font-medium normal-case tracking-normal text-muted">
                {dayMatches.length} {dayMatches.length === 1 ? "jogo" : "jogos"}
              </span>
            </h3>
            <ul className="space-y-3">
              {dayMatches.map((match) => (
                <li key={match.id}>
                  <MatchCard match={match} currentRound={currentRound} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            aria-controls={listId}
            onClick={() => setVisible((value) => value + PAGE)}
            className="inline-flex min-h-touch items-center gap-2 rounded-full border border-line-strong px-6 text-sm font-semibold text-ink hover:border-lime"
          >
            <ChevronDown className="h-4 w-4 text-lime" aria-hidden="true" />
            Mostrar mais {Math.min(PAGE, remaining)} {Math.min(PAGE, remaining) === 1 ? "partida" : "partidas"}
          </button>
        </div>
      )}
    </section>
  );
}

export default function MatchesPage() {
  usePageTitle("Partidas");
  const searchId = useId();

  // Filtros ficam na URL (?status=live&q=gremio): dá para compartilhar o link.
  const [params, setParams] = useSearchParams();
  const status = parseStatus(params.get("status"));
  const search = params.get("q") ?? "";
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { code: competition, competition: league } = useLeague();
  const { data: matches, isPending, isError, error, refetch, isFetching, isPlaceholderData } =
    useMatches({
      competition,
      status: status === "all" ? undefined : status,
      search: debouncedSearch || undefined,
    });
  // Lista completa da liga (mesma consulta da página sem filtros, já em cache):
  // alimenta os números do topo, o jogo em destaque e os contadores dos filtros.
  const { data: allMatches, isPlaceholderData: allFromOtherLeague } = useMatches({ competition });

  const summary = useMemo(() => {
    const all = allMatches ?? [];
    const count = (s: MatchStatus) => all.filter((match) => match.status === s).length;
    const upcoming = all
      .filter((match) => match.status === "scheduled")
      .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
    return {
      total: all.length,
      live: count("live"),
      scheduled: count("scheduled"),
      finished: count("finished"),
      currentRound: currentRoundOf(all),
      featured: all.find((match) => match.status === "live") ?? upcoming[0],
    };
  }, [allMatches]);

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
  // Ao trocar de liga, a consulta mostra os dados da liga anterior até chegar a
  // nova (placeholderData): nesse meio-tempo o topo fica em skeleton.
  const ready = allMatches !== undefined && !allFromOtherLeague;
  // Qualquer request da lista (liga, busca, filtro) mostra o skeleton das linhas.
  const listLoading = isPending || isPlaceholderData;

  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={`Partidas · ${league ? `${league.name} ${league.season}` : "carregando liga"}`}
        title={
          !ready ? (
            <>
              <span className="sr-only">Partidas</span>
              <Skeleton as="span" className="inline-block h-[0.85em] w-[8ch] max-w-full align-top" />
            </>
          ) : summary.currentRound !== undefined ? (
            <>
              <span className="sr-only">Partidas, </span>Rodada <span className="text-lime">{summary.currentRound}</span>
            </>
          ) : (
            "Partidas"
          )
        }
        description="Jogos ao vivo, próximos e resultados recentes. Escolha uma partida para ver escalações e estatísticas, ou dê o seu palpite."
        aside={
          !ready ? (
            <FeaturedMatchSkeleton />
          ) : summary.featured ? (
            <FeaturedMatch match={summary.featured} />
          ) : undefined
        }
      >
        {!ready ? (
          <div className="mt-7 flex gap-10" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-11 w-14" />
                <Skeleton className="mt-2 h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <HeroStats
            items={[
              { value: summary.total, label: summary.total === 1 ? "partida" : "partidas" },
              { value: summary.scheduled, label: "próximas", accent: true },
              { value: summary.finished, label: "encerradas" },
            ]}
          />
        )}
        <div className="mt-6">
          <LeagueTag />
        </div>
      </PageHero>

      <form
        role="search"
        aria-label="Filtrar partidas"
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-surface p-4"
      >
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
          <label htmlFor={searchId} className="text-sm font-semibold text-ink">
            Buscar por time
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              placeholder="Nome ou sigla do time"
              value={search}
              onChange={(event) => updateParam("q", event.target.value)}
              autoComplete="off"
              maxLength={50}
              className={cn(fieldBase, fieldState(false), "pl-11")}
            />
          </div>
        </div>
        <SegmentedControl<StatusFilter>
          label="Status da partida"
          value={status}
          onChange={(value) => updateParam("status", value)}
          className="flex-[1_1_420px]"
          options={[
            { value: "all", label: "Todas", count: ready ? summary.total : undefined },
            {
              value: "live",
              label: "Ao vivo",
              count: ready ? summary.live : undefined,
              icon: <span className="h-2 w-2 animate-live-pulse rounded-full bg-live" aria-hidden="true" />,
            },
            { value: "scheduled", label: "Agendadas", count: ready ? summary.scheduled : undefined },
            { value: "finished", label: "Encerradas", count: ready ? summary.finished : undefined },
          ]}
        />
      </form>

      {/* Anuncia o resultado do filtro para leitores de tela. */}
      <p aria-live="polite" className="-mt-4 flex min-h-6 items-center gap-2 text-sm text-muted">
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

      {listLoading ? (
        <SkeletonRegion label="Carregando partidas…">
          <MatchListSkeleton />
        </SkeletonRegion>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="h-10 w-10 text-muted" aria-hidden="true" />}
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
        <div className="space-y-14">
          {groups.map((group) => {
            const items = matches.filter((match) => match.status === group.status);
            if (items.length === 0) return null;
            return (
              <MatchSection
                // key com filtros: ao mudar a busca, volta a mostrar só a primeira página.
                key={`${group.status}-${debouncedSearch}-${competition}`}
                status={group.status}
                title={group.title}
                icon={group.icon}
                items={items}
                currentRound={summary.currentRound}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
