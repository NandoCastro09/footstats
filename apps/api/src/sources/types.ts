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

/**
 * Fonte de dados de futebol. As rotas só conhecem esta interface, então dá
 * para trocar o mock pela football-data.org (ou outra API) sem mexer nelas
 * nem no front. `competition` é o código da liga (BSA, PL, PD...).
 */
export interface DataSource {
  info(): DataSourceInfo;
  /** Ligas que esta fonte consegue servir. */
  listCompetitions(): Competition[];
  /** Partidas em destaque da liga: rodada anterior, atual e próxima (+ ao vivo). */
  listMatches(competition: string): Promise<Match[]>;
  /** Qualquer partida, de qualquer liga (usada para validar palpites). */
  findMatch(id: string): Promise<Match | null>;
  /**
   * Partida com estatísticas, escalações e eventos. null = partida não existe.
   * Sem dados detalhados da fonte, devolve `detailed: false` (nunca falha por isso).
   */
  getMatchDetails(id: string): Promise<MatchDetails | null>;
  listStandings(competition: string): Promise<Standing[]>;
  listTeams(competition: string): Promise<TeamSummary[]>;
  /** Qualquer time, de qualquer liga. */
  getTeam(id: string): Promise<Team | null>;
  /** Artilharia da liga, do maior para o menor número de gols. */
  listScorers(competition: string): Promise<Scorer[]>;
}
