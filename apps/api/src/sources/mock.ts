import type { FormResult, Match, Scorer, Standing, Team } from "../types.js";
import { buildMockDetails } from "../data/match-details.js";
import { squadsByTeam } from "../data/players.js";
import { season, seasonById, VISIBLE_ROUNDS, type MatchRecord } from "../data/season.js";
import { teams, teamsById, toSummary } from "../data/teams.js";
import { DEFAULT_COMPETITION, listCompetitionInfo } from "../data/competitions.js";
import type { DataSource } from "./types.js";

const FORM_LENGTH = 5;

function toMatch(record: MatchRecord): Match {
  const home = teamsById.get(record.homeId)!;
  const away = teamsById.get(record.awayId)!;
  return {
    id: record.id,
    competition: DEFAULT_COMPETITION,
    round: record.round,
    homeTeam: toSummary(home),
    awayTeam: toSummary(away),
    homeScore: record.homeScore,
    awayScore: record.awayScore,
    status: record.status,
    minute: record.minute,
    kickoff: record.kickoff.toISOString(),
    venue: home.stadium,
  };
}

function computeStandings(): Standing[] {
  const finished = season
    .filter((match) => match.status === "finished")
    .sort((a, b) => a.round - b.round);

  const rows = teams.map((team) => {
    const row = {
      team: toSummary(team),
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      form: [] as FormResult[],
    };

    for (const match of finished) {
      const isHome = match.homeId === team.id;
      if (!isHome && match.awayId !== team.id) continue;

      const scored = (isHome ? match.homeScore : match.awayScore)!;
      const conceded = (isHome ? match.awayScore : match.homeScore)!;
      const result: FormResult = scored > conceded ? "W" : scored === conceded ? "D" : "L";

      row.played++;
      row.goalsFor += scored;
      row.goalsAgainst += conceded;
      if (result === "W") row.wins++;
      else if (result === "D") row.draws++;
      else row.losses++;
      row.form.push(result);
    }

    return {
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
      points: row.wins * 3 + row.draws,
      form: row.form.slice(-FORM_LENGTH),
    };
  });

  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.name.localeCompare(b.team.name, "pt-BR")
  );

  return rows.map((row, index) => ({ position: index + 1, ...row }));
}

export function createMockSource(): DataSource {
  const visibleMatches = season.filter((m) => VISIBLE_ROUNDS.includes(m.round)).map(toMatch);
  const standings = computeStandings();
  const scorers: Scorer[] = teams
    .flatMap((team) =>
      (squadsByTeam.get(team.id) ?? [])
        .filter((p) => (p.goals ?? 0) > 0)
        .map((p) => ({
          player: { id: p.id, name: p.name, nationality: p.nationality },
          team: toSummary(team),
          goals: p.goals ?? 0,
          assists: p.assists,
          penalties: null,
          playedMatches: null,
        }))
    )
    .sort((a, b) => b.goals - a.goals || (b.assists ?? 0) - (a.assists ?? 0) || a.player.name.localeCompare(b.player.name))
    .slice(0, 100);

  return {
    info: () => ({
      name: "mock",
      attribution: "Dados fictícios gerados pela própria API.",
      providers: [],
      fallback: false,
    }),

    listCompetitions: () => listCompetitionInfo([DEFAULT_COMPETITION]),

    listScorers: async () => scorers,

    listMatches: async () => visibleMatches,

    findMatch: async (id) => {
      const record = seasonById.get(id);
      return record ? toMatch(record) : null;
    },

    getMatchDetails: async (id) => {
      const record = seasonById.get(id);
      return record ? buildMockDetails(record, toMatch(record)) : null;
    },

    listStandings: async () => standings,

    listTeams: async () =>
      teams.map(toSummary).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),

    getTeam: async (id) => {
      const team = teamsById.get(id);
      if (!team) return null;
      const result: Team = {
        ...toSummary(team),
        fullName: team.name,
        competition: DEFAULT_COMPETITION,
        city: team.city,
        stadium: team.stadium,
        founded: team.founded,
        coach: { name: team.coach, photo: null, nationality: null, age: null },
        standing: standings.find((row) => row.team.id === team.id) ?? null,
        squad: squadsByTeam.get(team.id) ?? [],
      };
      return result;
    },
  };
}
