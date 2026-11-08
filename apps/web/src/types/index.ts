// Tipos de domínio compartilhados pelo front. Espelham o contrato da API.

export type MatchStatus = "live" | "finished" | "scheduled";

/** Liga/competição (código da football-data.org: BSA, PL, PD...). */
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
  minute: number | null; // só em partidas ao vivo
  kickoff: string; // ISO 8601
  venue: string;
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
  form: FormResult[]; // últimos 5 jogos, do mais antigo ao mais recente
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

/** Artilharia da temporada. */
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
  competition: string | null; // liga do time (classificação e artilharia)
  city: string; // "" quando a fonte não informa
  stadium: string;
  founded: number | null;
  coach: Coach | null;
  standing: Standing | null;
  squad: Player[];
}

export interface Prediction {
  id: string;
  name: string;
  email: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  match: Match; // a API devolve a partida embutida
}

/** De onde vêm os dados que a API está servindo (GET /health). */
export interface DataSourceInfo {
  name: "mock" | "football-data";
  attribution: string;
  providers: Array<{ name: string; url: string }>;
  fallback: boolean; // true = a fonte real falhou e a API está servindo o mock
}

/** Corpo do POST/PUT de palpites. */
export type PredictionInput = Pick<
  Prediction,
  "name" | "email" | "matchId" | "homeGoals" | "awayGoals" | "comment"
>;

/** Formato padronizado de erro da API. */
export interface ApiErrorBody {
  error: string;
  message: string;
  details?: Record<string, string>;
}
