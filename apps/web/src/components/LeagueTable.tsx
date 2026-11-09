import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import FormGuide from "./FormGuide";
import TeamCrest from "./TeamCrest";
import { cn } from "../lib/cn";
import { formatGoalDifference } from "../lib/format";
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
}

export default function LeagueTable({
  standings,
  caption = "Classificação",
}: LeagueTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "position",
    direction: "asc",
  });

  const rows = useMemo(() => {
    const sorted = [...standings].sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      const result =
        typeof va === "string" && typeof vb === "string"
          ? va.localeCompare(vb, "pt-BR")
          : Number(va) - Number(vb);
      // Desempate sempre pela posição na tabela.
      return result !== 0 ? result : a.position - b.position;
    });
    return sort.direction === "asc" ? sorted : sorted.reverse();
  }, [standings, sort]);

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : // Posição e nome começam crescentes; números, do maior para o menor.
          { key, direction: key === "position" || key === "team" ? "asc" : "desc" }
    );
  }

  const sortedLabel = columns.find((c) => c.key === sort.key)?.label ?? "";
  const sortDescription = `Ordenado por ${sortedLabel.toLowerCase()} (${
    sort.direction === "asc" ? "crescente" : "decrescente"
  }).`;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      {/* Cabeçalho visual fora da área com scroll, para não ser cortado no mobile.
          O <caption> (sr-only) é o que os leitores de tela usam. */}
      <div aria-hidden="true" className="border-b border-line px-4 py-3">
        <p className="font-display text-lg font-bold text-ink">{caption}</p>
        <p className="text-sm text-ink-muted">
          {sortDescription}{" "}
          <span className="md:hidden">Deslize a tabela para o lado para ver todas as colunas.</span>
        </p>
      </div>
      {/* relative: os textos sr-only (position: absolute) das células precisam ficar
          presos aqui. Sem isso eles "escapam" da rolagem, a página passa a ter ~800px
          e o iPhone reduz o zoom da tela inteira. */}
      <div
        className="relative overflow-x-auto"
        role="region"
        aria-label={`${caption} (role para os lados para ver todas as colunas)`}
        tabIndex={0}
      >
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">
            {caption}. {sortDescription} Use os botões do cabeçalho para mudar a ordenação.
          </caption>
          <thead className="bg-surface-raised">
            <tr>
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
                      "px-1 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted",
                      column.key === "team"
                        ? "sticky left-0 z-10 bg-surface-raised text-left"
                        : "text-center"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className={cn(
                        "inline-flex min-h-touch min-w-touch items-center gap-1 rounded-control px-2 hover:bg-primary-light hover:text-ink",
                        column.key === "team" ? "justify-start" : "justify-center",
                        active && "text-primary"
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
              <th scope="col" className="px-3 py-1 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Últimos 5
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.team.id}
                className="group border-t border-line hover:bg-surface-raised"
              >
                <td className="px-3 py-2 text-center font-display font-bold tabular-nums">
                  {row.position}
                </td>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface px-3 py-2 text-left font-medium group-hover:bg-surface-raised"
                >
                  <Link
                    to={`/times/${row.team.id}`}
                    // min-w-max: sem ele, o Firefox calcula a coluna estreita demais
                    // e o nome do time invade a coluna de pontos.
                    className="inline-flex min-h-touch min-w-max items-center gap-2 rounded-control font-display text-ink hover:text-primary hover:underline"
                  >
                    <TeamCrest team={row.team} size="sm" />
                    <span className="whitespace-nowrap">{row.team.name}</span>
                  </Link>
                </th>
                <td className="bg-primary-light/60 px-3 py-2 text-center font-display text-base font-bold tabular-nums text-ink">
                  {row.points}
                </td>
                <td className="px-3 py-2 text-center tabular-nums text-ink-muted">{row.played}</td>
                <td className="px-3 py-2 text-center tabular-nums">{row.wins}</td>
                <td className="px-3 py-2 text-center tabular-nums">{row.draws}</td>
                <td className="px-3 py-2 text-center tabular-nums">{row.losses}</td>
                <td className="px-3 py-2 text-center tabular-nums">{row.goalsFor}</td>
                <td className="px-3 py-2 text-center tabular-nums">{row.goalsAgainst}</td>
                <td
                  className={cn(
                    "px-3 py-2 text-center tabular-nums",
                    row.goalDifference > 0
                      ? "text-success"
                      : row.goalDifference < 0
                        ? "text-danger"
                        : "text-ink-muted"
                  )}
                >
                  {formatGoalDifference(row.goalDifference)}
                </td>
                <td className="px-3 py-2">
                  <FormGuide form={row.form} className="justify-center" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
