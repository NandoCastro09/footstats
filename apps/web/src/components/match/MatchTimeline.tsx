import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { formatMinute } from "../../lib/format";
import type { MatchDetails, MatchEvent, MatchEventType } from "../../types";

const titles: Record<MatchEventType, string> = {
  goal: "Gol",
  penalty: "Gol de pênalti",
  "own-goal": "Gol contra",
  "missed-penalty": "Pênalti perdido",
  "yellow-card": "Cartão amarelo",
  "red-card": "Cartão vermelho",
  substitution: "Substituição",
  var: "VAR",
};

const GOALS = new Set<MatchEventType>(["goal", "penalty", "own-goal"]);

function Marker({ event }: { event: MatchEvent }) {
  if (GOALS.has(event.type)) {
    return (
      <span
        className={cn(
          "h-3 w-3 rounded-full",
          event.side === "home" ? "bg-primary" : "bg-live"
        )}
      />
    );
  }
  if (event.type === "yellow-card")
    return <span className="h-3 w-2 rounded-sm bg-warning" />;
  if (event.type === "red-card")
    return <span className="h-3 w-2 rounded-sm bg-danger" />;
  if (event.type === "substitution")
    return (
      <span className="h-2.5 w-2.5 rounded-full border-2 border-primary-bright" />
    );
  return <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-ink-muted" />;
}

interface Row {
  key: string;
  minute: string;
  marker: ReactNode;
  title: string;
  subtitle?: string;
  highlight?: boolean;
  muted?: boolean;
}

function describe(
  event: MatchEvent,
  team: string
): Pick<Row, "title" | "subtitle"> {
  const title = titles[event.type];
  switch (event.type) {
    case "substitution":
      return {
        title: `${title} · ${team}`,
        subtitle: [
          event.related && `Entra ${event.related}`,
          event.player && `sai ${event.player}`,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    case "var":
      return {
        title: `${title} · ${event.related ?? "revisão"}`,
        subtitle: [team, event.player].filter(Boolean).join(" · "),
      };
    case "goal":
      return {
        title: `${title} · ${event.player ?? team}`,
        subtitle: [team, event.related && `assistência de ${event.related}`]
          .filter(Boolean)
          .join(" · "),
      };
    default:
      return { title: `${title} · ${event.player ?? team}`, subtitle: team };
  }
}

export default function MatchTimeline({ details }: { details: MatchDetails }) {
  const { match, events, halfTime } = details;
  const team = (side: MatchEvent["side"]) =>
    side === "home" ? match.homeTeam.name : match.awayTeam.name;

  const rows: Row[] = [];
  const finalScore = `${match.homeScore ?? 0} – ${match.awayScore ?? 0}`;
  if (match.status === "finished") {
    rows.push({
      key: "fim",
      minute: "FIM",
      marker: <span className="h-2.5 w-2.5 rounded-sm bg-surface-strong" />,
      title: `Fim de jogo · ${finalScore}`,
      muted: true,
    });
  }

  const showHalfTime =
    halfTime !== null &&
    (match.status === "finished" ||
      (match.minute ?? 0) > 45 ||
      details.phase === "Intervalo");
  let halfTimeAdded = false;
  const addHalfTime = () => {
    if (!halfTime || !showHalfTime || halfTimeAdded) return;
    rows.push({
      key: "int",
      minute: "INT",
      marker: <span className="h-2.5 w-2.5 rounded-sm bg-surface-strong" />,
      title: `Intervalo · ${halfTime.home} – ${halfTime.away}`,
      muted: true,
    });
    halfTimeAdded = true;
  };

  [...events].reverse().forEach((event, index) => {
    if (event.minute <= 45) addHalfTime();
    rows.push({
      key: `${index}-${event.minute}-${event.type}`,
      minute: formatMinute(event.minute, event.extra),
      marker: <Marker event={event} />,
      ...describe(event, team(event.side)),
      highlight: GOALS.has(event.type),
    });
  });
  addHalfTime();

  return (
    <ol className="flex flex-col">
      {rows.map((row, index) => (
        <li key={row.key} className="flex gap-3">
          <span className="w-12 shrink-0 pt-2.5 text-right font-display text-sm font-bold tabular-nums text-ink-muted">
            {row.minute}
          </span>
          <div
            className="flex flex-col items-center self-stretch pt-3.5"
            aria-hidden="true"
          >
            <span className="flex h-3 w-3 items-center justify-center">
              {row.marker}
            </span>
            {index < rows.length - 1 && (
              <span className="mt-1.5 w-px flex-1 bg-line" />
            )}
          </div>
          <div
            className={cn(
              "mb-3 min-w-0 flex-1",
              row.highlight
                ? "rounded-control border border-line bg-surface px-4 py-3"
                : "py-2"
            )}
          >
            <p
              className={cn(
                "font-display text-sm",
                row.highlight ? "font-bold" : "font-medium",
                row.muted && "text-ink-soft"
              )}
            >
              {row.title}
            </p>
            {row.subtitle && (
              <p className="mt-0.5 text-xs text-ink-muted">{row.subtitle}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
