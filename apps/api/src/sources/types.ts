import type {
  Competition,
  DataSourceInfo,
  Match,
  MatchDetails,
  Scorer,
  Standing,
  Team,
  TeamSummary,
} from "../types.js";

export interface DataSource {
  info(): DataSourceInfo;
  listCompetitions(): Competition[];
  listMatches(competition: string): Promise<Match[]>;
  findMatch(id: string): Promise<Match | null>;
  getMatchDetails(id: string): Promise<MatchDetails | null>;
  listStandings(competition: string): Promise<Standing[]>;
  listTeams(competition: string): Promise<TeamSummary[]>;
  getTeam(id: string): Promise<Team | null>;
  listScorers(competition: string): Promise<Scorer[]>;
}
