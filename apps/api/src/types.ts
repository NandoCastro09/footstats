export type MatchStatus = "live" | "finished" | "scheduled";

export interface Competition {
  code: string;
  name: string;
  country: string;
  emblem: string;
  season: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  shortName: string;
  crest: string | null;
}

export interface Match {
  id: string;
  competition: string;
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

export type LineupPosition = "G" | "D" | "M" | "F";

export interface LineupPlayer {
  id: string;
  name: string;
  number: number | null;
  position: LineupPosition | null;
  grid: string | null;
  rating: number | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  photo: string | null;
}

export interface TeamLineup {
  formation: string | null;
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
  extra: number | null;
  side: "home" | "away";
  type: MatchEventType;
  player: string | null;
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
  match: Match;
  phase: string | null;
  extraMinute: number | null;
  halfTime: { home: number; away: number } | null;
  referee: string | null;
  statistics: MatchStat[];
  lineups: { home: TeamLineup; away: TeamLineup } | null;
  events: MatchEvent[];
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
  photo: string | null;
}

export interface Coach {
  name: string;
  photo: string | null;
  nationality: string | null;
  age: number | null;
}

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
  competition: string | null;
  city: string;
  stadium: string;
  founded: number | null;
  coach: Coach | null;
  standing: Standing | null;
  squad: Player[];
}

export interface DataSourceInfo {
  name: "mock" | "football-data";
  attribution: string;
  providers: Array<{ name: string; url: string }>;
  fallback: boolean;
}

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

export interface Prediction extends PredictionRecord {
  match: Match;
}
