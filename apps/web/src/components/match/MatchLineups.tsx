import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatRating } from "../../lib/format";
import type {
  LineupPlayer,
  LineupPosition,
  Match,
  MatchEvent,
  TeamLineup,
} from "../../types";

type Side = "home" | "away";

const positionLabel: Record<LineupPosition, string> = {
  G: "Goleiro",
  D: "Defensor",
  M: "Meio-campo",
  F: "Atacante",
};

/** "Giorgian de Arrascaeta" → "Arrascaeta" (nome curto embaixo da bolinha). */
function shortName(name: string) {
  const parts = name.replace(/\./g, ". ").trim().split(/\s+/);
  return parts[parts.length - 1];
}

function parseGrid(grid: string | null) {
  const [row, col] = (grid ?? "").split(":").map(Number);
  return Number.isFinite(row) && Number.isFinite(col) ? { row, col } : null;
}

/** Posição no campo (em %) a partir da grade "linha:coluna". Mandante ataca para a direita. */
function placeTeam(lineup: TeamLineup, side: Side) {
  const placed = lineup.startXI.flatMap((player) => {
    const grid = parseGrid(player.grid);
    return grid ? [{ player, ...grid }] : [];
  });
  const rows = Math.max(1, ...placed.map((p) => p.row));
  const perRow = new Map<number, number>();
  for (const p of placed)
    perRow.set(p.row, Math.max(perRow.get(p.row) ?? 0, p.col));

  return placed.map(({ player, row, col }) => {
    const depth = rows > 1 ? (row - 1) / (rows - 1) : 0; // 0 = goleiro, 1 = ataque
    const across = col / ((perRow.get(row) ?? 1) + 1);
    return {
      player,
      left: side === "home" ? 5 + depth * 39 : 95 - depth * 39,
      top: (side === "home" ? across : 1 - across) * 100,
    };
  });
}

function Pitch({
  lineups,
}: {
  lineups: { home: TeamLineup; away: TeamLineup };
}) {
  const players = [
    ...placeTeam(lineups.home, "home").map((p) => ({
      ...p,
      side: "home" as Side,
    })),
    ...placeTeam(lineups.away, "away").map((p) => ({
      ...p,
      side: "away" as Side,
    })),
  ];
  const line = "border-[rgba(155,208,92,0.2)]";

  return (
    // Só visual: as listas abaixo trazem as mesmas informações em texto.
    <div
      aria-hidden="true"
      className="relative h-[300px] overflow-hidden rounded-card border border-line bg-[linear-gradient(90deg,#12241A_0%,#0F1F16_50%,#12241A_100%)] sm:h-[400px]"
    >
      <div className={cn("absolute inset-2.5 rounded border", line)} />
      <div className="absolute bottom-2.5 left-1/2 top-2.5 w-px bg-[rgba(155,208,92,0.16)]" />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border sm:h-24 sm:w-24",
          line
        )}
      />
      <div
        className={cn(
          "absolute left-2.5 top-1/2 h-2/5 w-[11%] -translate-y-1/2 border border-l-0",
          line
        )}
      />
      <div
        className={cn(
          "absolute right-2.5 top-1/2 h-2/5 w-[11%] -translate-y-1/2 border border-r-0",
          line
        )}
      />

      {players.map(({ player, side, left, top }) => {
        const scored = player.goals > 0;
        return (
          <div
            key={`${side}-${player.id}`}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{
              left: `${left}%`,
              top: `${Math.min(92, Math.max(8, top))}%`,
            }}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold text-ink-inverse sm:h-8 sm:w-8",
                scored
                  ? "bg-success ring-[3px] ring-success/25"
                  : side === "home"
                    ? "bg-primary"
                    : "bg-live"
              )}
            >
              {player.number ?? "–"}
            </span>
            <span className="hidden max-w-[80px] truncate text-[11px] font-medium text-ink sm:block">
              {shortName(player.name)}
            </span>
          </div>
        );
      })}

      <span className="absolute left-4 top-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
        {lineups.home.formation}
      </span>
      <span className="absolute right-4 top-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-live-text">
        {lineups.away.formation}
      </span>
    </div>
  );
}

function RatingChip({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 font-display text-xs font-bold tabular-nums",
        rating >= 7.5
          ? "bg-success-light text-success"
          : rating >= 6.5
            ? "bg-primary-light text-primary-bright"
            : "bg-surface-raised text-ink-soft"
      )}
    >
      <span className="sr-only">nota </span>
      {formatRating(rating)}
    </span>
  );
}

interface PlayerRowProps {
  player: LineupPlayer;
  side: Side;
  subbedOut?: MatchEvent;
  subbedIn?: MatchEvent;
}

function PlayerRow({ player, side, subbedOut, subbedIn }: PlayerRowProps) {
  const notes = [
    player.position && positionLabel[player.position],
    player.goals > 0 &&
      `${player.goals} ${player.goals === 1 ? "gol" : "gols"}`,
    player.assists > 0 &&
      `${player.assists} ${player.assists === 1 ? "assistência" : "assistências"}`,
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 border-t border-line py-2.5">
      <span
        className={cn(
          "w-6 shrink-0 text-right font-display text-sm font-bold tabular-nums",
          side === "home" ? "text-primary" : "text-live-text"
        )}
      >
        {player.number ?? "–"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-display text-sm font-medium">
          {player.name}
          {player.yellowCards > 0 && (
            <span
              className="h-3 w-2 shrink-0 rounded-sm bg-warning"
              title="Cartão amarelo"
            >
              <span className="sr-only">, cartão amarelo</span>
            </span>
          )}
          {player.redCards > 0 && (
            <span
              className="h-3 w-2 shrink-0 rounded-sm bg-danger"
              title="Cartão vermelho"
            >
              <span className="sr-only">, cartão vermelho</span>
            </span>
          )}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
          {notes.join(" · ")}
          {subbedOut && (
            <span className="inline-flex items-center gap-0.5 text-danger">
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
              saiu {subbedOut.minute}'
            </span>
          )}
          {subbedIn && (
            <span className="inline-flex items-center gap-0.5 text-success">
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
              entrou {subbedIn.minute}'
            </span>
          )}
        </p>
      </div>
      <RatingChip rating={player.rating} />
    </li>
  );
}

function TeamList({
  name,
  lineup,
  side,
  events,
}: {
  name: string;
  lineup: TeamLineup;
  side: Side;
  events: MatchEvent[];
}) {
  const subs = events.filter(
    (e) => e.type === "substitution" && e.side === side
  );
  const outOf = (p: LineupPlayer) => subs.find((e) => e.player === p.name);
  const inOf = (p: LineupPlayer) => subs.find((e) => e.related === p.name);
  // Quem entrou aparece primeiro no banco.
  const bench = [...lineup.substitutes].sort(
    (a, b) => Number(Boolean(inOf(b))) - Number(Boolean(inOf(a)))
  );

  return (
    <section
      aria-label={`Escalação do ${name}`}
      className="rounded-card border border-line bg-surface px-4 pb-2 pt-4"
    >
      <div className="mb-2">
        <h3
          className={cn(
            "font-display text-base font-bold",
            side === "away" && "text-ink-soft"
          )}
        >
          {name}
        </h3>
        <p className="text-xs text-ink-muted">
          {[lineup.formation, lineup.coach && `téc. ${lineup.coach}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <p className="eyebrow pt-2">Titulares</p>
      <ul>
        {lineup.startXI.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            side={side}
            subbedOut={outOf(player)}
          />
        ))}
      </ul>
      {bench.length > 0 && (
        <details className="group mt-2 border-t border-line">
          <summary className="flex min-h-touch cursor-pointer items-center text-sm font-semibold text-primary">
            Reservas ({bench.length})
          </summary>
          <ul>
            {bench.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                side={side}
                subbedIn={inOf(player)}
              />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

/** Aba "Escalação": campo com os titulares + listas com notas, cartões e substituições. */
export default function MatchLineups({
  lineups,
  match,
  events,
}: {
  lineups: { home: TeamLineup; away: TeamLineup };
  match: Match;
  events: MatchEvent[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <Pitch lineups={lineups} />
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          {match.homeTeam.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-live"
            aria-hidden="true"
          />
          {match.awayTeam.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-success"
            aria-hidden="true"
          />
          marcou gol
        </span>
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TeamList
          name={match.homeTeam.name}
          lineup={lineups.home}
          side="home"
          events={events}
        />
        <TeamList
          name={match.awayTeam.name}
          lineup={lineups.away}
          side="away"
          events={events}
        />
      </div>
    </div>
  );
}
