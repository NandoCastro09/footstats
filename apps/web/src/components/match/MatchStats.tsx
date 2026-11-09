import { cn } from "../../lib/cn";
import { formatStat } from "../../lib/format";
import type { Match, MatchStat } from "../../types";

// Cores dos times em toda a tela da partida: mandante lime, visitante laranja.
const HOME = "#C8F135";
const AWAY = "#FF7A45";

function Possession({ stat, match }: { stat: MatchStat; match: Match }) {
  const home = stat.home ?? 50;
  const away = stat.away ?? 100 - home;
  const leader = home >= away ? match.homeTeam.name : match.awayTeam.name;
  return (
    <div className="flex items-center gap-5 rounded-card border border-line bg-surface p-4">
      {/* Rosca de posse (conic-gradient); os números estão na legenda ao lado. */}
      <div
        aria-hidden="true"
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${HOME} 0 ${home}%, ${AWAY} ${home}% 100%)`,
        }}
      >
        <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-surface">
          <span className="font-display text-lg font-bold leading-none text-primary">
            {Math.round(home)}%
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            Posse
          </span>
        </div>
      </div>
      <dl className="flex min-w-0 flex-1 flex-col gap-2">
        {[
          { team: match.homeTeam.name, value: home, color: HOME, strong: true },
          {
            team: match.awayTeam.name,
            value: away,
            color: AWAY,
            strong: false,
          },
        ].map((row) => (
          <div key={row.team} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: row.color }}
              aria-hidden="true"
            />
            <dt
              className={cn(
                "min-w-0 flex-1 truncate font-display text-sm font-medium",
                !row.strong && "text-ink-soft"
              )}
            >
              {row.team}
            </dt>
            <dd className="font-display text-sm font-bold tabular-nums">
              {Math.round(row.value)}%
            </dd>
          </div>
        ))}
        <p className="text-xs text-ink-muted">
          {home === away
            ? "Posse dividida igualmente."
            : `${leader} tem mais a bola.`}
        </p>
      </dl>
    </div>
  );
}

function StatRow({ stat, match }: { stat: MatchStat; match: Match }) {
  const home = stat.home ?? 0;
  const away = stat.away ?? 0;
  const total = home + away;
  const cards = stat.key === "yellowCards";
  const red = stat.key === "redCards";
  // Quem lidera a estatística fica colorido; o outro, apagado.
  const homeColor = cards
    ? "#D99A2B"
    : red
      ? "#FF9A62"
      : home >= away
        ? HOME
        : "#3A463D";
  const awayColor = cards
    ? "#8A6A2A"
    : red
      ? "#9A3A38"
      : away > home
        ? AWAY
        : "#3A463D";

  return (
    <li className="flex flex-col gap-1.5">
      <div
        aria-hidden="true"
        className="flex items-baseline justify-between gap-3"
      >
        <span
          className={cn(
            "font-display text-sm font-bold tabular-nums",
            home < away && "text-ink-soft"
          )}
        >
          {formatStat(stat.home, stat.format)}
        </span>
        <span className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
          {stat.label}
        </span>
        <span
          className={cn(
            "font-display text-sm font-bold tabular-nums",
            away < home && "text-ink-soft"
          )}
        >
          {formatStat(stat.away, stat.format)}
        </span>
      </div>
      <span className="sr-only">
        {stat.label}: {match.homeTeam.name} {formatStat(stat.home, stat.format)}
        , {match.awayTeam.name} {formatStat(stat.away, stat.format)}
      </span>
      <div className="flex h-1.5 gap-1" aria-hidden="true">
        {total === 0 ? (
          <div className="flex-1 rounded-full bg-surface-raised" />
        ) : (
          <>
            <div
              className="rounded-full"
              style={{ flex: home || 0.001, background: homeColor }}
            />
            <div
              className="rounded-full"
              style={{ flex: away || 0.001, background: awayColor }}
            />
          </>
        )}
      </div>
    </li>
  );
}

/** Aba "Estatísticas": rosca de posse + barras comparativas, como no protótipo. */
export default function MatchStats({
  statistics,
  match,
}: {
  statistics: MatchStat[];
  match: Match;
}) {
  const possession = statistics.find((s) => s.key === "possession");
  const rest = statistics.filter((s) => s.key !== "possession");

  return (
    <div className="flex flex-col gap-6">
      {possession && <Possession stat={possession} match={match} />}
      <div className="rounded-card border border-line bg-surface p-4">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm font-semibold">
          <span className="flex items-center gap-2 truncate">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: HOME }}
              aria-hidden="true"
            />
            {match.homeTeam.name}
          </span>
          <span className="flex items-center gap-2 truncate text-ink-soft">
            {match.awayTeam.name}
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: AWAY }}
              aria-hidden="true"
            />
          </span>
        </div>
        <ul className="flex flex-col gap-4">
          {rest.map((stat) => (
            <StatRow key={stat.key} stat={stat} match={match} />
          ))}
        </ul>
      </div>
    </div>
  );
}
