import { Pencil, Trash2 } from "lucide-react";
import Badge from "../Badge";
import Button from "../Button";
import Card from "../Card";
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

export default function PredictionCard({
  prediction,
  isEditing,
  onEdit,
  onDelete,
}: PredictionCardProps) {
  const { match, homeGoals, awayGoals } = prediction;
  const edited = prediction.updatedAt !== prediction.createdAt;
  const matchName = `${match.homeTeam.name} x ${match.awayTeam.name}`;
  const { competitions } = useLeague();
  const leagueName = competitions.find((c) => c.code === match.competition)?.name;

  return (
    <Card
      as="article"
      className={cn("flex h-full flex-col gap-3", isEditing && "ring-2 ring-primary")}
      aria-label={`Palpite de ${prediction.name}: ${match.homeTeam.name} ${homeGoals} x ${awayGoals} ${match.awayTeam.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold text-ink">{prediction.name}</h3>
          <p className="truncate text-sm text-ink-muted">{maskEmail(prediction.email)}</p>
        </div>
        {isEditing && (
          <Badge variant="info" icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}>
            Editando
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 rounded-control bg-surface-subtle p-3">
        <TeamCrest team={match.homeTeam} size="sm" />
        <p className="font-display text-2xl font-bold tabular-nums text-ink">
          {homeGoals}
          <span className="mx-1 text-ink-muted" aria-hidden="true">
            x
          </span>
          {awayGoals}
        </p>
        <TeamCrest team={match.awayTeam} size="sm" />
      </div>
      <p className="text-center text-sm text-ink">
        <span className="font-medium">{matchName}</span>
        <span className="block text-ink-muted">
          {leagueName && `${leagueName} · `}
          {formatKickoff(match.kickoff)}
        </span>
      </p>

      {prediction.comment && (
        <blockquote className="border-l-4 border-primary-light pl-3 text-sm italic text-ink">
          “{prediction.comment}”
        </blockquote>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
        <p className="text-xs text-ink-muted">
          {edited ? "Editado em " : "Enviado em "}
          <time dateTime={edited ? prediction.updatedAt : prediction.createdAt}>
            {formatDateTime(edited ? prediction.updatedAt : prediction.createdAt)}
          </time>
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
    </Card>
  );
}
