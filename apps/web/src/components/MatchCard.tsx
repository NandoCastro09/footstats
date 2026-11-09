import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Trophy } from "lucide-react";
import Badge from "./Badge";
import Card from "./Card";
import TeamCrest from "./TeamCrest";
import { cn } from "../lib/cn";
import { formatKickoff, formatTime } from "../lib/format";
import type { Match, TeamSummary } from "../types";

interface MatchCardProps {
  match: Match;
}

function StatusBadge({ match }: MatchCardProps) {
  const icon = "h-3.5 w-3.5";
  switch (match.status) {
    case "live":
      return (
        <Badge
          variant="live"
          icon={
            <span
              className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-white"
              aria-hidden="true"
            />
          }
        >
          Ao vivo{match.minute !== null && ` · ${match.minute}'`}
        </Badge>
      );
    case "finished":
      return (
        <Badge
          variant="default"
          icon={<CheckCircle2 className={icon} aria-hidden="true" />}
        >
          Encerrado
        </Badge>
      );
    case "scheduled":
      return (
        <Badge
          variant="info"
          icon={<Clock className={icon} aria-hidden="true" />}
        >
          {formatTime(match.kickoff)}
        </Badge>
      );
  }
}

interface TeamSideProps {
  team: TeamSummary;
  isWinner: boolean;
  /** Perdedor fica esmaecido, como no protótipo. */
  isLoser: boolean;
  /** Dentro do card ao vivo (fundo azul). */
  onHero: boolean;
}

function TeamSide({ team, isWinner, isLoser, onHero }: TeamSideProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <TeamCrest team={team} />
      <Link
        to={`/times/${team.id}`}
        className={cn(
          // relative z-10: fica acima do link que cobre o card inteiro.
          "relative z-10 inline-flex min-h-touch items-center gap-1 rounded-control px-1 font-display text-sm font-medium underline-offset-2 hover:underline",
          onHero
            ? "text-white"
            : isLoser
              ? "text-ink-muted hover:text-primary"
              : "text-ink hover:text-primary"
        )}
      >
        {isWinner && (
          <Trophy
            className="h-4 w-4 shrink-0 text-success"
            aria-hidden="true"
          />
        )}
        {/* Nome inteiro em até 2 linhas ("Brighton & Hove Albion"), sem "…". */}
        <span className="line-clamp-2 text-balance break-words">{team.name}</span>
        {isWinner && <span className="sr-only">(vencedor)</span>}
      </Link>
    </div>
  );
}

function describeMatch(match: Match) {
  const { homeTeam, awayTeam, homeScore, awayScore, status } = match;
  if (status === "scheduled") {
    return `${homeTeam.name} contra ${awayTeam.name}, ${formatKickoff(match.kickoff)}`;
  }
  const situation = status === "live" ? "ao vivo" : "encerrado";
  return `${homeTeam.name} ${homeScore}, ${awayTeam.name} ${awayScore}, ${situation}`;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { homeTeam, awayTeam, homeScore, awayScore, status } = match;
  const hasScore = homeScore !== null && awayScore !== null;
  const finished = status === "finished" && hasScore;
  const homeWins = finished && homeScore > awayScore;
  const awayWins = finished && awayScore > homeScore;
  const draw = finished && homeScore === awayScore;
  const live = status === "live";
  // No degradê azul o cinza não tem contraste: usa branco a 90%.
  const muted = live ? "text-white/90" : "text-ink-muted";

  return (
    <Card
      as="article"
      variant={live ? "live" : "default"}
      interactive
      aria-label={describeMatch(match)}
      className="relative flex h-full flex-col gap-3"
    >
      <div
        className={cn("flex items-center justify-between gap-2 text-xs", muted)}
      >
        <StatusBadge match={match} />
        <span className="font-semibold uppercase tracking-[0.08em]">
          Rodada {match.round}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TeamSide
          team={homeTeam}
          isWinner={homeWins}
          isLoser={awayWins}
          onHero={live}
        />

        <div className="flex flex-col items-center gap-1">
          {/* O link cobre o card inteiro (after:inset-0): clicar em qualquer ponto
              abre a partida; os nomes dos times continuam levando ao time. */}
          <Link
            to={`/partidas/${match.id}`}
            className={cn(
              "rounded-control after:absolute after:inset-0 after:rounded-card after:content-['']",
              // Foco de teclado contorna o card todo, não só o placar.
              "focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-[3px] focus-visible:after:outline-offset-2",
              live
                ? "focus-visible:after:outline-white"
                : "focus-visible:after:outline-primary"
            )}
          >
            <span className="sr-only">
              Ver detalhes da partida: {describeMatch(match)}
            </span>
            <p
              aria-hidden="true"
              className={cn(
                "font-display font-bold tabular-nums",
                live ? "text-4xl text-white" : "text-3xl text-ink"
              )}
            >
              {hasScore ? (
                <>
                  {homeScore}
                  <span className={cn("mx-1.5", muted)} aria-hidden="true">
                    –
                  </span>
                  {awayScore}
                </>
              ) : (
                <span className={cn("text-xl", muted)}>x</span>
              )}
            </p>
          </Link>
          {draw && (
            <span className={cn("text-xs font-medium", muted)}>Empate</span>
          )}
        </div>

        <TeamSide
          team={awayTeam}
          isWinner={awayWins}
          isLoser={homeWins}
          onHero={live}
        />
      </div>

      <p
        className={cn(
          "mt-auto border-t pt-2 text-center text-xs",
          live ? "border-white/20" : "border-line",
          muted
        )}
      >
        {formatKickoff(match.kickoff)}
        {match.venue && ` · ${match.venue}`}
      </p>
    </Card>
  );
}
