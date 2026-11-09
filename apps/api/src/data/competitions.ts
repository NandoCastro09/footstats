import type { Competition } from "../types.js";

// Competições do plano gratuito da football-data.org com temporada em andamento.
// (A Euro e a Copa do Mundo também são gratuitas, mas não têm jogos agora.)

interface CompetitionConfig {
  code: string;
  name: string;
  country: string;
  emblem: string;
  /** "year": temporada no ano civil (Brasileirão). "split": agosto a maio (Europa). */
  calendar: "year" | "split";
}

const configs: CompetitionConfig[] = [
  { code: "BSA", name: "Brasileirão Série A", country: "Brasil", emblem: "https://crests.football-data.org/bsa.png", calendar: "year" },
  { code: "PL", name: "Premier League", country: "Inglaterra", emblem: "https://crests.football-data.org/PL.png", calendar: "split" },
  { code: "PD", name: "La Liga", country: "Espanha", emblem: "https://crests.football-data.org/laliga.png", calendar: "split" },
  { code: "SA", name: "Serie A", country: "Itália", emblem: "https://crests.football-data.org/c111.png", calendar: "split" },
  { code: "BL1", name: "Bundesliga", country: "Alemanha", emblem: "https://crests.football-data.org/BL1.png", calendar: "split" },
  { code: "FL1", name: "Ligue 1", country: "França", emblem: "https://crests.football-data.org/FL1.png", calendar: "split" },
  { code: "DED", name: "Eredivisie", country: "Holanda", emblem: "https://crests.football-data.org/ED.png", calendar: "split" },
  { code: "PPL", name: "Primeira Liga", country: "Portugal", emblem: "https://crests.football-data.org/PPL.png", calendar: "split" },
  { code: "ELC", name: "Championship", country: "Inglaterra", emblem: "https://crests.football-data.org/ELC.png", calendar: "split" },
  { code: "CL", name: "Champions League", country: "Europa", emblem: "https://crests.football-data.org/CL.png", calendar: "split" },
];

export const DEFAULT_COMPETITION = "BSA";

/** "2026" (ano civil) ou "2026/27" (temporada europeia que começa em agosto). */
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
