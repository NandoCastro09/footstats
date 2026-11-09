import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import FormGuide from "./FormGuide";
import TeamCrest from "./TeamCrest";
import { cn } from "../lib/cn";
import { formatGoalDifference } from "../lib/format";
import { zoneOf, zoneSquare, zonesFor } from "../lib/zones";
import type { Standing } from "../types";

type SortKey =
  | "position"
  | "team"
  | "played"
  | "wins"
  | "draws"
  | "losses"
  | "goalsFor"
  | "goalsAgainst"
  | "goalDifference"
  | "points";
type SortDirection = "asc" | "desc";

interface Column {
  key: SortKey;
  short: string;
  label: string;
}

const columns: Column[] = [
  { key: "position", short: "#", label: "Posição" },
  { key: "team", short: "Time", label: "Time" },
  { key: "points", short: "Pts", label: "Pontos" },
  { key: "played", short: "J", label: "Jogos" },
  { key: "wins", short: "V", label: "Vitórias" },
  { key: "draws", short: "E", label: "Empates" },
  { key: "losses", short: "D", label: "Derrotas" },
  { key: "goalsFor", short: "GP", label: "Gols pró" },
  { key: "goalsAgainst", short: "GC", label: "Gols contra" },
  { key: "goalDifference", short: "SG", label: "Saldo de gols" },
];

function sortValue(row: Standing, key: SortKey) {
  return key === "team" ? row.team.name : row[key];
}

interface LeagueTableProps {
  standings: Standing[];
  caption?: string;
  competition?: string;
}

export default function LeagueTable({
  standings,
  caption = "Classificação",
  competition = "",
}: LeagueTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "position",
    direction: "asc",
  });
  const { zones, dividers } = zonesFor(competition, standings.length);

  const rows = useMemo(() => {
    const sorted = [...standings].sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      const result =
        typeof va === "string" && typeof vb === "string"
          ? va.localeCompare(vb, "pt-BR")
          : Number(va) - Number(vb);
      return result !== 0 ? result : a.position - b.position;
    });
    return sort.direction === "asc" ? sorted : sorted.reverse();
  }, [standings, sort]);

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "position" || key === "team" ? "asc" : "desc" }
    );
  }

  const naturalOrder = sort.key === "position" && sort.direction === "asc";
  const sortedLabel = columns.find((c) => c.key === sort.key)?.label ?? "";
  const sortDescription = `Ordenado por ${sortedLabel.toLowerCase()} (${
    sort.direction === "asc" ? "crescente" : "decrescente"
  }).`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div aria-hidden="true" className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-4">
        <p className="font-display text-2xl font-bold uppercase text-ink">{caption}</p>
        <p className="text-sm text-muted">
          {sortDescription}{" "}
          <span className="md:hidden">Deslize a tabela para o lado.</span>
        </p>
      </div>
      <div
        // relative: sem ele os textos sr-only escapam da rolagem e o iPhone reduz o zoom da página
        className="relative overflow-x-auto"
        role="region"
        aria-label={`${caption} (role para os lados para ver todas as colunas)`}
        tabIndex={0}
      >
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <caption className="sr-only">
            {caption}. {sortDescription} Use os botões do cabeçalho para mudar a ordenação.
          </caption>
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => {
                const active = sort.key === column.key;
                const Icon = !active
                  ? ArrowUpDown
                  : sort.direction === "asc"
                    ? ArrowUp
                    : ArrowDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      "px-1 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted",
                      column.key === "team"
                        ? "sticky left-0 z-10 bg-surface text-left"
                        : "text-center"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className={cn(
                        "inline-flex min-h-touch min-w-touch items-center gap-1 rounded-control px-2 uppercase hover:bg-surface-2 hover:text-ink",
                        column.key === "team" ? "justify-start" : "justify-center",
                        active && "text-lime"
                      )}
                    >
                      <abbr title={column.label} className="no-underline">
                        {column.short}
                      </abbr>
                      <span className="sr-only">, ordenar por {column.label}</span>
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                Últimos 5
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const zone = zoneOf(row.position, zones);
              const divider = naturalOrder && dividers.includes(row.position - 1);
              return (
                <tr
                  key={row.team.id}
                  className={cn(
                    "border-t hover:bg-surface-2",
                    divider ? "border-t-2 border-t-[#3A463D]" : "border-line"
                  )}
                >
                  <td className="px-3 py-2 text-center">
                    <span
                      className={cn(
                        "inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg font-display text-base font-bold tabular-nums",
                        zoneSquare[zone?.color ?? "none"]
                      )}
                    >
                      {row.position}
                    </span>
                    {zone && <span className="sr-only">, {zone.label}</span>}
                  </td>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-surface px-3 py-2 text-left font-medium"
                  >
                    <Link
                      to={`/times/${row.team.id}`}
                      // min-w-max: no Firefox o nome do time invadia a coluna de pontos
                      className="inline-flex min-h-touch min-w-max items-center gap-3 rounded-control text-[15px] font-semibold text-ink hover:text-lime hover:underline"
                    >
                      <TeamCrest team={row.team} size="sm" />
                      <span className="whitespace-nowrap">{row.team.name}</span>
                    </Link>
                  </th>
                  <td className="px-3 py-2 text-center font-display text-[22px] font-bold tabular-nums text-ink">
                    {row.points}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums text-ink-2">{row.played}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-ink-2">{row.wins}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-ink-2">{row.draws}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-ink-2">{row.losses}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-ink-2">{row.goalsFor}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-ink-2">{row.goalsAgainst}</td>
                  <td
                    className={cn(
                      "px-3 py-2 text-center font-semibold tabular-nums",
                      row.goalDifference > 0
                        ? "text-lime"
                        : row.goalDifference < 0
                          ? "text-alert-text"
                          : "text-ink-2"
                    )}
                  >
                    {formatGoalDifference(row.goalDifference)}
                  </td>
                  <td className="px-3 py-2">
                    <FormGuide form={row.form} className="justify-center" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line px-5 py-4 text-[13px] text-ink-2">
        {zones.map((zone) => (
          <li key={zone.label} className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-sm", zoneSquare[zone.color].split(" ")[0])} aria-hidden="true" />
            {zone.label}
            <span className="text-muted tabular-nums">
              ({zone.from === zone.to ? `${zone.from}º` : `${zone.from}º–${zone.to}º`})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
