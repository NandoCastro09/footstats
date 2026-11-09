import { Link } from "react-router-dom";
import TeamCrest from "./TeamCrest";
import type { Scorer } from "../types";

interface ScorersTableProps {
  scorers: Scorer[];
  caption: string;
  /** Na página de um time a coluna "Time" é redundante. */
  showTeam?: boolean;
}

const dash = (value: number | null) => (value === null ? "—" : value);

/** Tabela de artilharia: posição, jogador, (time), gols, assistências, jogos. */
export default function ScorersTable({ scorers, caption, showTeam = true }: ScorersTableProps) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      {/* relative: prende os textos sr-only na área de rolagem (ver LeagueTable). */}
      <div className="relative overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-raised">
            <tr className="text-xs uppercase tracking-[0.12em] text-ink-muted">
              <th scope="col" className="px-3 py-3 text-center font-semibold">#</th>
              <th scope="col" className="px-3 py-3 text-left font-semibold">Jogador</th>
              {showTeam && <th scope="col" className="px-3 py-3 text-left font-semibold">Time</th>}
              <th scope="col" className="px-3 py-3 text-center font-semibold">Gols</th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">
                <abbr title="Assistências" className="no-underline">Assist.</abbr>
              </th>
              <th scope="col" className="px-3 py-3 text-center font-semibold">Jogos</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((scorer, index) => (
              <tr key={`${scorer.team.id}-${scorer.player.id}`} className="border-t border-line">
                <td className="px-3 py-2 text-center font-display font-bold tabular-nums">{index + 1}</td>
                <th scope="row" className="px-3 py-2 text-left font-display font-medium text-ink">
                  {scorer.player.name}
                  {scorer.player.nationality && (
                    <span className="block text-xs font-normal text-ink-muted">{scorer.player.nationality}</span>
                  )}
                </th>
                {showTeam && (
                  <td className="px-3 py-2">
                    <Link
                      to={`/times/${scorer.team.id}`}
                      // min-w-max: sem ele, o Firefox calcula a coluna estreita demais
                      // e o nome do time invade a coluna ao lado.
                      className="inline-flex min-h-touch min-w-max items-center gap-2 rounded-control font-display text-ink hover:text-primary hover:underline"
                    >
                      <TeamCrest team={scorer.team} size="sm" />
                      <span className="whitespace-nowrap">{scorer.team.name}</span>
                    </Link>
                  </td>
                )}
                <td className="bg-success-light/60 px-3 py-2 text-center font-display text-base font-bold tabular-nums text-success">
                  {scorer.goals}
                </td>
                <td className="px-3 py-2 text-center tabular-nums">{dash(scorer.assists)}</td>
                <td className="px-3 py-2 text-center tabular-nums">{dash(scorer.playedMatches)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
