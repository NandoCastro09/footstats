import { HeartPulse } from "lucide-react";
import PersonPhoto from "./PersonPhoto";
import type { Player } from "../types";

interface PlayerCardProps {
  player: Player;
}

/** Card do jogador: foto, nome, "Nº 15 · 29 anos" e o número da camisa como marca d'água. */
export default function PlayerCard({ player }: PlayerCardProps) {
  const details = [
    player.number !== null && `Nº ${player.number}`,
    player.age !== null && `${player.age} anos`,
  ].filter(Boolean);
  // Estatísticas por jogador só existem nos dados mock (as APIs gratuitas não trazem).
  const stats =
    player.goals !== null && player.assists !== null && player.yellowCards !== null
      ? `${player.goals} gols · ${player.assists} assist. · ${player.yellowCards} amarelos`
      : null;

  return (
    <article className="relative flex h-full items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-surface p-4 transition-colors hover:border-line-strong">
      {player.number !== null && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 right-2 select-none font-display text-[72px] font-extrabold leading-none tabular-nums text-[#1A221C]"
        >
          {player.number}
        </span>
      )}
      <PersonPhoto name={player.name} photo={player.photo} size="sm" className="relative" />
      <div className="relative min-w-0 flex-1">
        <h3 className="truncate font-sans text-base font-semibold text-ink">{player.name}</h3>
        <p className="text-sm text-ink-2">{details.length > 0 ? details.join(" · ") : player.position ?? "—"}</p>
        <p className="truncate text-xs text-muted">{player.nationality}</p>
        {stats && <p className="text-xs text-muted">{stats}</p>}
        {player.injured && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-danger-light px-2 py-0.5 text-xs font-semibold text-alert-text">
            <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
            Lesionado
          </span>
        )}
      </div>
    </article>
  );
}
