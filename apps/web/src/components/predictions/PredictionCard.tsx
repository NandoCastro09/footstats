import { Pencil, Trash2 } from "lucide-react";
import Button from "../Button";
import TeamCrest from "../TeamCrest";
import { cn } from "../../lib/cn";
import { formatDateTime, formatKickoff, maskEmail } from "../../lib/format";
import { useLeague } from "../../league/leagueContext";
import type { Prediction } from "../../types";

interface PredictionCardProps {
  prediction: Prediction;
  isEditing: boolean;
  onEdit: (prediction: Prediction) => void;
  onDelete: (prediction: Prediction) => void;
}

type Outcome = "exact" | "winner" | "wrong" | "pending";

/** Compara o palpite com o resultado (só depois que a partida termina). */
function outcomeOf({ match, homeGoals, awayGoals }: Prediction): Outcome {
  if (match.status !== "finished" || match.homeScore === null || match.awayScore === null) return "pending";
  if (match.homeScore === homeGoals && match.awayScore === awayGoals) return "exact";
  return Math.sign(homeGoals - awayGoals) === Math.sign(match.homeScore - match.awayScore) ? "winner" : "wrong";
}

const outcomeChip: Record<Outcome, { label: string; className: string }> = {
  exact: { label: "Cravou", className: "bg-lime text-ink-inverse" },
  winner: { label: "Acertou vencedor", className: "bg-zone-sula text-ink-inverse" },
  wrong: { label: "Errou", className: "bg-surface-strong text-ink" },
  pending: { label: "Aguardando", className: "border border-lime/40 text-lime" },
};

export default function PredictionCard({
  prediction,
  isEditing,
  onEdit,
  onDelete,
}: PredictionCardProps) {
  const { match, homeGoals, awayGoals } = prediction;
  const edited = prediction.updatedAt !== prediction.createdAt;
  const { competitions } = useLeague();
  const leagueName = competitions.find((c) => c.code === match.competition)?.name;
  const outcome = outcomeChip[outcomeOf(prediction)];
  const finished = match.status === "finished" && match.homeScore !== null && match.awayScore !== null;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-[14px] border bg-surface p-4",
        isEditing ? "border-lime" : "border-line"
      )}
      aria-label={`Palpite de ${prediction.name}: ${match.homeTeam.name} ${homeGoals} x ${awayGoals} ${match.awayTeam.name}. ${outcome.label}.`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {formatKickoff(match.kickoff)}
        </p>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em]", outcome.className)}>
          {isEditing ? "Editando" : outcome.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <TeamCrest team={match.homeTeam} size="sm" />
        <p className="font-display text-[32px] font-bold leading-none tabular-nums text-ink">
          {homeGoals}
          <span className="mx-1.5 text-muted" aria-hidden="true">
            –
          </span>
          {awayGoals}
        </p>
        <TeamCrest team={match.awayTeam} size="sm" />
        {finished && (
          <p className="ml-auto text-right text-xs text-muted">
            Resultado
            <span className="block font-display text-lg font-bold tabular-nums text-ink-2">
              {match.homeScore} – {match.awayScore}
            </span>
          </p>
        )}
      </div>

      <p className="text-sm text-ink">
        <span className="font-semibold">
          {match.homeTeam.name} x {match.awayTeam.name}
        </span>
        {leagueName && <span className="block text-muted">{leagueName}</span>}
      </p>

      {prediction.comment && (
        <blockquote className="border-l-2 border-lime/50 pl-3 text-sm italic text-ink-2">
          “{prediction.comment}”
        </blockquote>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
        <p className="min-w-0 text-xs text-muted">
          <span className="font-semibold text-ink-2">{prediction.name}</span> · {maskEmail(prediction.email)}
          <span className="block">
            {edited ? "Editado em " : "Enviado em "}
            <time dateTime={edited ? prediction.updatedAt : prediction.createdAt}>
              {formatDateTime(edited ? prediction.updatedAt : prediction.createdAt)}
            </time>
          </span>
        </p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(prediction)}
            icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
          >
            Editar<span className="sr-only"> palpite de {prediction.name}</span>
          </Button>
          <Button
            size="sm"
            variant="dangerGhost"
            onClick={() => onDelete(prediction)}
            icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          >
            Excluir<span className="sr-only"> palpite de {prediction.name}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
