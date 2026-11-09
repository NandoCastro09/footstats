import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import TeamCrest from "./TeamCrest";
import { cn } from "../lib/cn";
import { formatKickoff, formatTime } from "../lib/format";
import type { Match, TeamSummary } from "../types";

interface MatchCardProps {
  match: Match;
  currentRound?: number;
}

function describeMatch(match: Match) {
  const { homeTeam, awayTeam, homeScore, awayScore, status } = match;
  if (status === "scheduled") {
    return `${homeTeam.name} contra ${awayTeam.name}, ${formatKickoff(match.kickoff)}`;
  }
  const situation = status === "live" ? "ao vivo" : "encerrado";
  return `${homeTeam.name} ${homeScore}, ${awayTeam.name} ${awayScore}, ${situation}`;
}

export function LiveChip({ minute }: { minute?: number | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live-light px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-live-text">
      <span className="h-2 w-2 animate-live-pulse rounded-full bg-live" aria-hidden="true" />
      Ao vivo
      {minute != null && <span className="tabular-nums">· {minute}'</span>}
    </span>
  );
}

function TeamName({
  team,
  align,
  dim,
}: {
  team: TeamSummary;
  align: "left" | "right";
  dim: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:gap-3",
        align === "right" ? "sm:flex-row-reverse sm:text-right" : "sm:text-left"
      )}
    >
      <TeamCrest team={team} size="md" className="h-10 w-10" />
      <Link
        to={`/times/${team.id}`}
        className={cn(
          "relative z-10 min-w-0 max-w-full rounded-control font-display text-base font-bold uppercase leading-tight underline-offset-2 hover:underline sm:text-xl",
          dim ? "text-muted hover:text-ink" : "text-ink hover:text-lime"
        )}
      >
        <span className="line-clamp-2 text-balance">{team.name}</span>
      </Link>
    </div>
  );
}

export default function MatchCard({ match, currentRound }: MatchCardProps) {
  const { homeTeam, awayTeam, homeScore, awayScore, status } = match;
  const hasScore = homeScore !== null && awayScore !== null;
  const finished = status === "finished" && hasScore;
  const live = status === "live";
  const homeWins = finished && homeScore > awayScore;
  const awayWins = finished && awayScore > homeScore;
  const postponed = status === "scheduled" && currentRound !== undefined && match.round < currentRound;

  return (
    <article
      aria-label={describeMatch(match)}
      className={cn(
        "relative flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[14px] border px-4 py-4 transition-colors sm:gap-x-7 sm:px-5",
        finished ? "border-line bg-surface-2" : "border-line bg-surface",
        live && "border-live/50",
        "hover:border-line-strong"
      )}
    >
      <div className="flex w-full items-baseline gap-3 sm:w-[84px] sm:flex-col sm:gap-1">
        {live ? (
          <LiveChip minute={match.minute} />
        ) : finished ? (
          <span className="rounded-md bg-surface px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-ink-2">
            Fim
          </span>
        ) : (
          <span className="font-display text-[28px] font-bold leading-none tabular-nums text-ink">
            {formatTime(match.kickoff)}
          </span>
        )}
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Rodada {match.round}</span>
      </div>

      <div className="grid min-w-0 flex-[1_1_380px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <TeamName team={homeTeam} align="right" dim={awayWins} />
        <Link
          to={`/partidas/${match.id}`}
          className={cn(
            // O ::after deste link cobre a linha inteira: clicar em qualquer ponto abre a partida.
            "rounded-control after:absolute after:inset-0 after:rounded-[14px] after:content-['']",
            "focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-lime"
          )}
        >
          <span className="sr-only">Ver detalhes da partida: {describeMatch(match)}</span>
          {hasScore ? (
            <span
              aria-hidden="true"
              className={cn(
                "block whitespace-nowrap rounded-[10px] bg-bg px-3 py-1 font-display text-[30px] font-bold leading-tight tabular-nums",
                live ? "text-lime" : "text-ink"
              )}
            >
              {homeScore}
              <span className="mx-1.5 text-muted">–</span>
              {awayScore}
            </span>
          ) : (
            <span aria-hidden="true" className="block w-8 text-center font-display text-xl font-bold text-muted">
              x
            </span>
          )}
        </Link>
        <TeamName team={awayTeam} align="left" dim={homeWins} />
      </div>

      <div className="flex min-w-0 flex-[1_1_150px] flex-wrap items-center gap-2 text-[13px] text-muted sm:flex-[1_1_220px]">
        {match.venue && (
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{match.venue}</span>
          </span>
        )}
        {postponed && (
          <span className="rounded-full border border-alert/60 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-alert-text">
            Adiado
          </span>
        )}
      </div>

      {status === "scheduled" ? (
        <Link
          to={`/palpites?partida=${match.id}`}
          className="relative z-10 ml-auto inline-flex min-h-touch items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-semibold text-ink hover:border-lime"
        >
          Palpitar
          <span className="sr-only">: {homeTeam.name} contra {awayTeam.name}</span>
          <ArrowRight className="h-4 w-4 text-lime" aria-hidden="true" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className="ml-auto inline-flex min-h-touch items-center gap-2 px-1 text-sm font-semibold text-ink-2"
        >
          Detalhes
          <ArrowRight className="h-4 w-4 text-lime" />
        </span>
      )}
    </article>
  );
}
