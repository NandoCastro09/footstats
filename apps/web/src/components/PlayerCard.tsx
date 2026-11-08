import { HeartPulse } from "lucide-react";
import Badge from "./Badge";
import Card from "./Card";
import PersonPhoto from "./PersonPhoto";
import type { Player } from "../types";

interface PlayerCardProps {
  player: Player;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control bg-surface-subtle p-2 text-center">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-display text-lg font-bold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const details = [
    player.position ?? "Posição não informada",
    player.age !== null && `${player.age} anos`,
    player.nationality,
  ].filter(Boolean);
  // Estatísticas por jogador só existem nos dados mock (as APIs gratuitas não trazem).
  const hasStats = player.goals !== null && player.assists !== null && player.yellowCards !== null;

  return (
    <Card as="article" className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <PersonPhoto
          name={player.name}
          photo={player.photo}
          fallback={player.number !== null ? String(player.number) : undefined}
          fallbackLabel={player.number !== null ? `Camisa ${player.number}` : undefined}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-ink">{player.name}</h3>
          <p className="text-sm text-ink-muted">{details.join(" · ")}</p>
        </div>
        {player.number !== null && player.photo && (
          <span className="font-display text-2xl font-bold tabular-nums text-primary">
            <span className="sr-only">Camisa </span>
            {player.number}
          </span>
        )}
      </div>

      {player.injured && (
        <Badge
          variant="error"
          icon={<HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />}
          className="self-start"
        >
          Lesionado
        </Badge>
      )}

      {hasStats && (
        <dl className="mt-auto grid grid-cols-3 gap-2">
          <Stat label="Gols" value={player.goals!} />
          <Stat label="Assist." value={player.assists!} />
          <Stat label="Amarelos" value={player.yellowCards!} />
        </dl>
      )}
    </Card>
  );
}
