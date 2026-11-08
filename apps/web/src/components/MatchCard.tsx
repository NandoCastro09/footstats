import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Radio, Trophy } from "lucide-react";
import Badge from "./Badge";
import Card from "./Card";
import TeamCrest from "./TeamCrest";
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
        <Badge variant="live" icon={<Radio className={icon} aria-hidden="true" />}>
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
        <Badge variant="info" icon={<Clock className={icon} aria-hidden="true" />}>
          {formatTime(match.kickoff)}
        </Badge>
      );
  }
}

function TeamSide({ team, isWinner }: { team: TeamSummary; isWinner: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <TeamCrest team={team} />
      <Link
        to={`/times/${team.id}`}
        className="inline-flex min-h-touch items-center gap-1 rounded-control px-1 text-sm font-medium text-ink underline-offset-2 hover:text-primary hover:underline"
      >
        {isWinner && (
          <Trophy className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        )}
        <span className="truncate">{team.name}</span>
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

  return (
    <Card
      as="article"
      variant={status === "live" ? "live" : "default"}
      interactive
      aria-label={describeMatch(match)}
      className="flex h-full flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
        <StatusBadge match={match} />
        <span>Rodada {match.round}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TeamSide team={homeTeam} isWinner={homeWins} />

        <div className="flex flex-col items-center gap-1">
          <p className="font-display text-3xl font-bold tabular-nums text-ink">
            {hasScore ? (
              <>
                {homeScore}
                <span className="mx-1 text-ink-muted" aria-hidden="true">
                  -
                </span>
                {awayScore}
              </>
            ) : (
              <span className="text-xl text-ink-muted">x</span>
            )}
          </p>
          {draw && <span className="text-xs font-medium text-ink-muted">Empate</span>}
        </div>

        <TeamSide team={awayTeam} isWinner={awayWins} />
      </div>

      <p className="mt-auto border-t border-line pt-2 text-center text-xs text-ink-muted">
        {formatKickoff(match.kickoff)}
        {match.venue && ` · ${match.venue}`}
      </p>
    </Card>
  );
}
