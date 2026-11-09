import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flag, MapPin } from "lucide-react";
import TeamCrest from "../TeamCrest";
import { formatLongKickoff, formatMinute } from "../../lib/format";
import type { MatchDetails, TeamSummary } from "../../types";

interface MatchHeroProps {
  details: MatchDetails;
  leagueName?: string;
  /** As abas ficam dentro do hero, como no protótipo. */
  children?: ReactNode;
}

function Side({ team }: { team: TeamSummary }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <TeamCrest team={team} size="lg" className="h-14 w-14 sm:h-20 sm:w-20" />
      <Link
        to={`/times/${team.id}`}
        // Nome inteiro em até 2 linhas, sem cortar com "…".
        className="line-clamp-2 max-w-full text-balance break-words rounded-control font-display text-lg font-bold uppercase leading-tight text-ink hover:text-lime hover:underline sm:text-2xl"
      >
        {team.name}
      </Link>
    </div>
  );
}

function StatusPill({ details }: { details: MatchDetails }) {
  const { match, phase, extraMinute } = details;
  if (match.status === "live") {
    const minute =
      match.minute !== null ? formatMinute(match.minute, extraMinute) : null;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-live-strong px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
        <span
          className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-white"
          aria-hidden="true"
        />
        {phase === "Intervalo"
          ? "Intervalo"
          : ["Ao vivo", minute].filter(Boolean).join(" · ")}
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-2">
        {phase && phase !== "Encerrado" ? phase : "Encerrado"}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-2">
      Agendado
    </span>
  );
}

/** Cabeçalho da partida: degradê azul com escudos, placar, status e as abas. */
export default function MatchHero({
  details,
  leagueName,
  children,
}: MatchHeroProps) {
  const { match, halfTime, referee } = details;
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const scoreLabel = hasScore
    ? `${match.homeTeam.name} ${match.homeScore}, ${match.awayTeam.name} ${match.awayScore}`
    : `${match.homeTeam.name} contra ${match.awayTeam.name}`;

  return (
    <header className="overflow-hidden rounded-panel border border-[#243027] bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/"
          className="inline-flex min-h-touch items-center gap-1 rounded-control pr-2 text-sm font-medium text-ink-2 hover:text-ink hover:underline"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Partidas
        </Link>
        <p className="text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          {leagueName && `${leagueName} · `}Rodada {match.round}
        </p>
      </div>

      {/* O h1 é o confronto; o placar visual fica escondido do leitor de tela (já está no texto). */}
      <h1 className="sr-only">
        {scoreLabel}
        {match.status === "live"
          ? " (ao vivo)"
          : match.status === "finished"
            ? " (encerrado)"
            : ""}
      </h1>

      <div className="flex items-center gap-3 py-5 sm:gap-6">
        <Side team={match.homeTeam} />
        <div className="flex shrink-0 flex-col items-center gap-2">
          <StatusPill details={details} />
          <p
            aria-hidden="true"
            className="font-display text-5xl font-bold tabular-nums text-ink sm:text-6xl"
          >
            {hasScore ? (
              <>
                {match.homeScore}
                <span className="mx-2 text-muted">–</span>
                {match.awayScore}
              </>
            ) : (
              <span className="text-3xl text-muted">x</span>
            )}
          </p>
          {halfTime && match.status !== "scheduled" && (
            <p className="text-xs text-muted">
              Intervalo: {halfTime.home} – {halfTime.away}
            </p>
          )}
        </div>
        <Side team={match.awayTeam} />
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pb-4 text-center text-sm text-muted">
        {match.status === "scheduled" && (
          <li className="first-letter:uppercase">
            {formatLongKickoff(match.kickoff)}
          </li>
        )}
        {match.venue && (
          <li className="flex items-center gap-1">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {match.venue}
          </li>
        )}
        {referee && (
          <li className="flex items-center gap-1">
            <Flag className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Árbitro:</span>
            {referee}
          </li>
        )}
      </ul>

      {children}
    </header>
  );
}
