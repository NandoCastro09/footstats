// Contrato da API. O front tem uma cópia em apps/web/src/types/index.ts.

export type MatchStatus = "live" | "finished" | "scheduled";

/** Liga/competição disponível (código da football-data.org: BSA, PL, PD...). */
export interface Competition {
  code: string;
  name: string;
  country: string;
  emblem: string;
  season: string; // "2026" ou "2026/27"
}

export interface TeamSummary {
  id: string;
  name: string;
  shortName: string; // sigla de 3 letras (não é única: use o id para identificar)
  crest: string | null; // URL do escudo; null nos dados mock
}

export interface Match {
  id: string;
  competition: string; // código da liga
  round: number;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute: number | null;
  kickoff: string;
  venue: string;
}

// ---- Detalhes da partida (GET /api/matches/:id/details) ----

/** G goleiro, D defensor, M meio-campo, F atacante. */
export type LineupPosition = "G" | "D" | "M" | "F";

export interface LineupPlayer {
  id: string;
  name: string;
  number: number | null;
  position: LineupPosition | null;
  /** Posição no campo "linha:coluna" (linha 1 = goleiro). null no banco. */
  grid: string | null;
  /** Nota na partida (0–10); null quando a fonte não avalia. */
  rating: number | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  photo: string | null;
}

export interface TeamLineup {
  formation: string | null; // "4-3-3"
  coach: string | null;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export type MatchEventType =
  | "goal"
  | "own-goal"
  | "penalty"
  | "missed-penalty"
  | "yellow-card"
  | "red-card"
  | "substitution"
  | "var";

export interface MatchEvent {
  minute: number;
  extra: number | null; // acréscimo: 90+3 → minute 90, extra 3
  side: "home" | "away";
  type: MatchEventType;
  player: string | null; // autor; na substituição, quem SAI
  /** Assistência (gols), quem ENTRA (substituição) ou a decisão do VAR. */
  related: string | null;
}

export interface MatchStat {
  key: string;
  label: string;
  home: number | null;
  away: number | null;
  format: "number" | "percent" | "decimal";
}

export interface MatchDetails {
  /** Partida com placar e minuto já atualizados pela fonte dos detalhes. */
  match: Match;
  /** Momento do jogo ao vivo: "1º tempo", "Intervalo", "2º tempo"... */
  phase: string | null;
  /** Acréscimos do minuto atual (ao vivo): 45+2 → 2. */
  extraMinute: number | null;
  halfTime: { home: number; away: number } | null;
  referee: string | null;
  statistics: MatchStat[];
  lineups: { home: TeamLineup; away: TeamLineup } | null;
  events: MatchEvent[];
  /**
   * false quando a fonte não tem dados detalhados desta partida (liga sem
   * cobertura, limite diário da API atingido): a tela mostra só o básico.
   */
  detailed: boolean;
}

export type FormResult = "W" | "D" | "L";

export interface Standing {
  position: number;
  team: TeamSummary;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: FormResult[];
}

export type PlayerPosition = "Goleiro" | "Defensor" | "Meio-campo" | "Atacante";

// Campos null = a fonte de dados não informa (a football-data.org gratuita
// não traz número da camisa nem estatísticas por jogador).
export interface Player {
  id: string;
  name: string;
  number: number | null;
  position: PlayerPosition | null;
  nationality: string;
  age: number | null;
  goals: number | null;
  assists: number | null;
  yellowCards: number | null;
  injured: boolean;
  photo: string | null; // URL da foto (API-Football); null quando não há
}

export interface Coach {
  name: string;
  photo: string | null;
  nationality: string | null;
  age: number | null;
}

/** Artilharia da temporada (football-data.org: os 100 primeiros). */
export interface Scorer {
  player: { id: string; name: string; nationality: string };
  team: TeamSummary;
  goals: number;
  assists: number | null;
  penalties: number | null;
  playedMatches: number | null;
}

export interface Team extends TeamSummary {
  fullName: string;
  /** Liga do time (de onde vêm a classificação e a artilharia). */
  competition: string | null;
  city: string; // "" quando a fonte não informa
  stadium: string;
  founded: number | null;
  coach: Coach | null;
  standing: Standing | null;
  squad: Player[];
}

/** De onde vêm os dados que a API está servindo. */
export interface DataSourceInfo {
  name: "mock" | "football-data";
  attribution: string;
  /** Serviços externos usados, para o crédito no rodapé do site. */
  providers: Array<{ name: string; url: string }>;
  /** true quando a fonte real falhou e a API está servindo o mock no lugar. */
  fallback: boolean;
}

/** Palpite como fica armazenado em memória. */
export interface PredictionRecord {
  id: string;
  name: string;
  email: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

/** Palpite como sai na API: com a partida embutida. */
export interface Prediction extends PredictionRecord {
  match: Match;
}
