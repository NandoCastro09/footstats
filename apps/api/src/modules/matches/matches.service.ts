import type { Match, MatchStatus } from "../../types.js";
import type { DataSource } from "../../sources/types.js";
import { notFound } from "../../lib/errors.js";
import { normalize } from "../../lib/text.js";
import type { MatchesQuery } from "./matches.schemas.js";

// Ao vivo primeiro, depois as próximas, depois as encerradas mais recentes.
const statusOrder: Record<MatchStatus, number> = { live: 0, scheduled: 1, finished: 2 };

export async function listMatches(
  source: DataSource,
  competition: string,
  { status, search }: MatchesQuery
): Promise<Match[]> {
  const term = search ? normalize(search) : "";
  const matches = await source.listMatches(competition);

  return matches
    .filter((match) => !status || match.status === status)
    .filter((match) => {
      if (!term) return true;
      const { homeTeam, awayTeam } = match;
      return [homeTeam.name, homeTeam.shortName, awayTeam.name, awayTeam.shortName].some(
        (value) => normalize(value).includes(term)
      );
    })
    .sort((a, b) => {
      const byStatus = statusOrder[a.status] - statusOrder[b.status];
      if (byStatus !== 0) return byStatus;
      const byDate = Date.parse(a.kickoff) - Date.parse(b.kickoff);
      return a.status === "finished" ? -byDate : byDate;
    });
}

export async function getMatch(source: DataSource, id: string): Promise<Match> {
  const match = await source.findMatch(id);
  if (!match) throw notFound(`Partida "${id}" não encontrada.`);
  return match;
}
