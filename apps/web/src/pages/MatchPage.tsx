import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  CalendarClock,
  Info,
  ListOrdered,
  Shirt,
} from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Skeleton from "../components/Skeleton";
import MatchHero from "../components/match/MatchHero";
import MatchLineups from "../components/match/MatchLineups";
import MatchStats from "../components/match/MatchStats";
import MatchTabs, { type TabItem } from "../components/match/MatchTabs";
import { panelId, tabId } from "../components/match/tabIds";
import MatchTimeline from "../components/match/MatchTimeline";
import { buttonBase, buttonSizes, buttonVariants } from "../components/styles";
import { useMatchDetails } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { cn } from "../lib/cn";
import { formatTime } from "../lib/format";
import { useLeague } from "../league/leagueContext";
import { ApiError } from "../services/api";
import type { MatchDetails } from "../types";

type TabKey = "estatisticas" | "escalacao" | "eventos";

const tabs: TabItem<TabKey>[] = [
  { id: "estatisticas", label: "Estatísticas" },
  { id: "escalacao", label: "Escalação" },
  { id: "eventos", label: "Eventos" },
];

const PREFIX = "partida";
const icon = "h-10 w-10 text-ink-muted";

/** Aba inicial: jogo agendado abre na escalação; os outros, nas estatísticas. */
function defaultTab(details: MatchDetails): TabKey {
  if (details.match.status === "scheduled") return "escalacao";
  if (details.statistics.length === 0 && details.events.length > 0)
    return "eventos";
  return "estatisticas";
}

function unavailableText(details: MatchDetails, what: string) {
  if (details.match.status === "scheduled") {
    return what === "escalação"
      ? "As escalações são divulgadas cerca de 1 hora antes do início."
      : "Disponível quando a bola rolar.";
  }
  return details.detailed
    ? `A fonte de dados ainda não publicou ${what === "escalação" ? "a escalação" : `os ${what}`} desta partida.`
    : `Sem ${what} para esta partida: a fonte de dados não cobre este jogo ou o limite diário de consultas foi atingido.`;
}

function Panel({ details, tab }: { details: MatchDetails; tab: TabKey }) {
  const { match } = details;
  switch (tab) {
    case "estatisticas":
      return details.statistics.length > 0 ? (
        <MatchStats statistics={details.statistics} match={match} />
      ) : (
        <EmptyState
          icon={<BarChart3 className={icon} aria-hidden="true" />}
          title="Estatísticas indisponíveis"
          description={unavailableText(details, "estatísticas")}
        />
      );
    case "escalacao":
      return details.lineups ? (
        <MatchLineups
          lineups={details.lineups}
          match={match}
          events={details.events}
        />
      ) : (
        <EmptyState
          icon={<Shirt className={icon} aria-hidden="true" />}
          title="Escalações ainda não divulgadas"
          description={unavailableText(details, "escalação")}
        />
      );
    case "eventos":
      return details.events.length > 0 || match.status === "finished" ? (
        <MatchTimeline details={details} />
      ) : (
        <EmptyState
          icon={<ListOrdered className={icon} aria-hidden="true" />}
          title="Nenhum lance registrado"
          description={
            match.status === "live"
              ? "Os gols, cartões e substituições aparecem aqui assim que acontecem."
              : unavailableText(details, "eventos")
          }
        />
      );
  }
}

export default function MatchPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const {
    data: details,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useMatchDetails(id);
  const { competitions } = useLeague();

  const match = details?.match;
  usePageTitle(
    match
      ? `${match.homeTeam.name} x ${match.awayTeam.name}`
      : isError
        ? "Partida não encontrada"
        : "Partida"
  );

  if (isPending) {
    return (
      <div
        role="status"
        aria-busy="true"
        className="mx-auto max-w-4xl space-y-6"
      >
        <span className="sr-only">Carregando partida…</span>
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-28 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-ink">
          {notFound ? "Partida não encontrada" : "Partida"}
        </h1>
        {notFound ? (
          <EmptyState
            title="Essa partida não existe"
            description={`Não encontramos nenhuma partida com o identificador "${id}".`}
            action={
              <Link
                to="/"
                className={cn(
                  buttonBase,
                  buttonVariants.primary,
                  buttonSizes.md
                )}
              >
                Ver partidas
              </Link>
            }
          />
        ) : (
          <ErrorState
            error={error}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        )}
      </div>
    );
  }

  const requested = params.get("aba");
  const active: TabKey = tabs.some((t) => t.id === requested)
    ? (requested as TabKey)
    : defaultTab(details);
  const setTab = (tab: TabKey) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("aba", tab);
        return next;
      },
      { replace: true }
    );
  const leagueName = competitions.find(
    (c) => c.code === details.match.competition
  )?.name;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <MatchHero details={details} leagueName={leagueName}>
        <MatchTabs
          tabs={tabs}
          active={active}
          onChange={setTab}
          idPrefix={PREFIX}
          label="Detalhes da partida"
        />
      </MatchHero>

      {details.match.status === "live" && (
        <p
          className="flex items-center gap-2 text-xs text-ink-muted"
          aria-live="polite"
        >
          <span
            className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-success"
            aria-hidden="true"
          />
          Atualiza sozinho a cada minuto · última atualização às{" "}
          {formatTime(new Date(dataUpdatedAt).toISOString())}
        </p>
      )}

      {details.match.status === "scheduled" && (
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
          {/* Texto num span: dentro do flex, cada pedaço viraria item com espaço entre eles. */}
          <span>
            Partida ainda não começou. Que tal{" "}
            <Link
              to="/palpites"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              dar seu palpite
            </Link>
            ?
          </span>
        </p>
      )}

      {!details.detailed && details.match.status !== "scheduled" && (
        <p className="flex items-start gap-2 rounded-control border border-line bg-surface p-3 text-sm text-ink-soft">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          Estatísticas, escalações e lances desta partida estão indisponíveis
          agora. Placar e informações básicas continuam atualizados.
        </p>
      )}

      <div
        role="tabpanel"
        id={panelId(PREFIX, active)}
        aria-labelledby={tabId(PREFIX, active)}
        tabIndex={0}
        className="rounded-card outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <Panel details={details} tab={active} />
      </div>
    </div>
  );
}
