import type { Competition } from "../types.js";

interface CompetitionConfig {
  code: string;
  name: string;
  country: string;
  emblem: string;
  calendar: "year" | "split";
}

const configs: CompetitionConfig[] = [
  { code: "BSA", name: "Brasileirão Série A", country: "Brasil", emblem: "https://media.api-sports.io/football/leagues/71.png", calendar: "year" },
  { code: "PL", name: "Premier League", country: "Inglaterra", emblem: "https://media.api-sports.io/football/leagues/39.png", calendar: "split" },
  { code: "PD", name: "La Liga", country: "Espanha", emblem: "https://media.api-sports.io/football/leagues/140.png", calendar: "split" },
  { code: "SA", name: "Serie A", country: "Itália", emblem: "https://media.api-sports.io/football/leagues/135.png", calendar: "split" },
  { code: "BL1", name: "Bundesliga", country: "Alemanha", emblem: "https://media.api-sports.io/football/leagues/78.png", calendar: "split" },
  { code: "FL1", name: "Ligue 1", country: "França", emblem: "https://media.api-sports.io/football/leagues/61.png", calendar: "split" },
  { code: "DED", name: "Eredivisie", country: "Holanda", emblem: "https://media.api-sports.io/football/leagues/88.png", calendar: "split" },
  { code: "PPL", name: "Primeira Liga", country: "Portugal", emblem: "https://media.api-sports.io/football/leagues/94.png", calendar: "split" },
  { code: "ELC", name: "Championship", country: "Inglaterra", emblem: "https://media.api-sports.io/football/leagues/40.png", calendar: "split" },
  { code: "CL", name: "Champions League", country: "Europa", emblem: "https://media.api-sports.io/football/leagues/2.png", calendar: "split" },
];

export const DEFAULT_COMPETITION = "BSA";

export function seasonLabel(calendar: CompetitionConfig["calendar"], now = new Date()) {
  const year = now.getUTCFullYear();
  if (calendar === "year") return String(year);
  const start = now.getUTCMonth() >= 6 ? year : year - 1; // a partir de julho, nova temporada
  return `${start}/${String(start + 1).slice(-2)}`;
}

export function listCompetitionInfo(codes: readonly string[] = configs.map((c) => c.code), now = new Date()): Competition[] {
  return configs
    .filter((c) => codes.includes(c.code))
    .map(({ calendar, ...c }) => ({ ...c, season: seasonLabel(calendar, now) }));
}

export const competitionCodes = configs.map((c) => c.code);
