import type {
  Coach,
  FormResult,
  Match,
  MatchDetails,
  MatchStatus,
  Player,
  PlayerPosition,
  Scorer,
  Standing,
  Team,
  TeamSummary,
} from "../types.js";
import { coachOverrides } from "../data/coach-overrides.js";
import { competitionCodes, listCompetitionInfo } from "../data/competitions.js";
import { crestFor, teamLinks } from "../data/team-links.js";
import { teamDisplayNames } from "../data/team-names.js";
import { createCache } from "../lib/cache.js";
import { samePerson } from "../lib/names.js";
import type { TeamEnrichment } from "./api-football.js";
import type { DataSource } from "./types.js";

const BASE_URL = "https://api.football-data.org/v4";
// Plano gratuito da football-data: 10 requisições por minuto. Por isso o cache.
const TTL = {
  match: 5 * 60_000,
  matches: 60_000,
  standings: 5 * 60_000,
  scorers: 10 * 60_000,
  teams: 12 * 60 * 60_000,
};
const FORM_LENGTH = 5;
const DAY = 24 * 60 * 60_000;
const LINEUPS_WINDOW = 90 * 60_000;

interface FdTeamRef {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

export interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  minute?: number | string | null;
  venue?: string | null;
  homeTeam: FdTeamRef;
  awayTeam: FdTeamRef;
  score: { fullTime: { home: number | null; away: number | null } };
  season?: { currentMatchday: number | null };
  competition?: { code: string };
}

interface FdTableRow {
  position: number;
  team: FdTeamRef;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface FdPerson {
  id: number;
  name: string;
  position: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  shirtNumber?: number | null;
}

interface FdTeam extends FdTeamRef {
  founded: number | null;
  venue: string | null;
  coach: { name: string | null } | null;
  squad: FdPerson[] | null;
  runningCompetitions?: Array<{ code: string; type: string }>;
}

export interface FdMatchesResponse {
  matches: FdMatch[];
}
export interface FdStandingsResponse {
  standings: Array<{ stage?: string; type: string; table: FdTableRow[] }>;
}
export interface FdTeamsResponse {
  teams: FdTeam[];
}
export interface FdScorersResponse {
  scorers: Array<{
    player: { id: number; name: string; nationality: string | null };
    team: FdTeamRef;
    playedMatches: number | null;
    goals: number | null;
    assists: number | null;
    penalties: number | null;
  }>;
}

export type FetchJson = <T>(path: string) => Promise<T>;

export function createFootballDataFetch(token: string): FetchJson {
  return async <T>(path: string) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "X-Auth-Token": token },
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    if (!response.ok) {
      throw new Error(
        `football-data.org respondeu ${response.status}: ${body?.message ?? response.statusText}`
      );
    }
    return body as T;
  };
}

const LIVE = new Set(["IN_PLAY", "PAUSED", "EXTRA_TIME", "PENALTY_SHOOTOUT", "LIVE"]);
const FINISHED = new Set(["FINISHED", "AWARDED"]);
const SCHEDULED = new Set(["SCHEDULED", "TIMED"]);

export function mapStatus(status: string): MatchStatus | null {
  if (LIVE.has(status)) return "live";
  if (FINISHED.has(status)) return "finished";
  if (SCHEDULED.has(status)) return "scheduled";
  return null;
}

const teamOverrides: Record<number, { name?: string; tla?: string; fullName?: string }> = {
  1766: { name: "Atlético-MG", fullName: "Clube Atlético Mineiro" },
  1768: { name: "Athletico-PR", fullName: "Club Athletico Paranaense" },
  1767: { tla: "GRE" },
  1776: { tla: "SAO" },
  4241: { tla: "CFC" },
};

export function toSummary(team: FdTeamRef): TeamSummary {
  const override = teamOverrides[team.id] ?? {};
  return {
    id: String(team.id),
    name: override.name ?? teamDisplayNames[team.id] ?? team.shortName ?? team.name,
    shortName: override.tla ?? team.tla ?? team.name.slice(0, 3).toUpperCase(),
    crest: crestFor(String(team.id), team.crest ?? null),
  };
}

export function toMatch(
  match: FdMatch,
  venues: Map<string, string>,
  competition = match.competition?.code ?? ""
): Match | null {
  const status = mapStatus(match.status);
  if (!status) return null;
  const minute = Number(match.minute);
  return {
    id: String(match.id),
    competition,
    round: match.matchday ?? 0,
    homeTeam: toSummary(match.homeTeam),
    awayTeam: toSummary(match.awayTeam),
    homeScore: status === "scheduled" ? null : match.score.fullTime.home,
    awayScore: status === "scheduled" ? null : match.score.fullTime.away,
    status,
    minute: status === "live" && Number.isFinite(minute) ? minute : null,
    kickoff: match.utcDate,
    venue: match.venue ?? venues.get(String(match.homeTeam.id)) ?? "",
  };
}

export function mapPosition(position: string | null): PlayerPosition | null {
  const value = position?.toLowerCase() ?? "";
  if (!value) return null;
  if (value.includes("goalkeeper")) return "Goleiro";
  if (value.includes("midfield")) return "Meio-campo";
  if (value.includes("back") || value.includes("defen")) return "Defensor";
  if (/forward|winger|offence|striker|attack/.test(value)) return "Atacante";
  return null;
}

const countries: Record<string, string> = {
  England: "Inglaterra",
  Japan: "Japão",
  Brazil: "Brasil",
  Uruguay: "Uruguai",
  Colombia: "Colômbia",
  Paraguay: "Paraguai",
  Ecuador: "Equador",
  Peru: "Peru",
  Chile: "Chile",
  Argentina: "Argentina",
  Venezuela: "Venezuela",
  Bolivia: "Bolívia",
  Portugal: "Portugal",
  Spain: "Espanha",
  Italy: "Itália",
  France: "França",
  Germany: "Alemanha",
  Netherlands: "Holanda",
  "United States": "Estados Unidos",
};

export function translateCountry(country: string) {
  return countries[country] ?? country;
}

export function ageOn(dateOfBirth: string | null, now: number) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date(now);
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age--;
  return Number.isFinite(age) ? age : null;
}

const positionOrder: Record<string, number> = { Goleiro: 0, Defensor: 1, "Meio-campo": 2, Atacante: 3 };

function toPlayer(person: FdPerson, teamId: string, now: number): Player {
  return {
    id: `${teamId}-${person.id}`,
    name: person.name,
    number: person.shirtNumber ?? null,
    position: mapPosition(person.position),
    nationality: person.nationality ? translateCountry(person.nationality) : "",
    age: ageOn(person.dateOfBirth, now),
    goals: null,
    assists: null,
    yellowCards: null,
    injured: false,
    photo: null,
  };
}

function sortSquad(squad: Player[]) {
  return squad.sort(
    (a, b) =>
      (positionOrder[a.position ?? ""] ?? 9) - (positionOrder[b.position ?? ""] ?? 9) ||
      a.name.localeCompare(b.name, "pt-BR")
  );
}

export function computeForm(matches: Match[], teamId: string): FormResult[] {
  return matches
    .filter(
      (m) =>
        m.status === "finished" &&
        m.homeScore !== null &&
        m.awayScore !== null &&
        (m.homeTeam.id === teamId || m.awayTeam.id === teamId)
    )
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))
    .slice(-FORM_LENGTH)
    .map((m) => {
      const isHome = m.homeTeam.id === teamId;
      const scored = isHome ? m.homeScore! : m.awayScore!;
      const conceded = isHome ? m.awayScore! : m.homeScore!;
      return scored > conceded ? "W" : scored === conceded ? "D" : "L";
    });
}

export function isFeatured(match: Match, currentRound: number, now: number) {
  if (match.status === "live") return true;
  if (Math.abs(match.round - currentRound) <= 1) return true;
  const untilKickoff = Date.parse(match.kickoff) - now;
  return match.status === "scheduled" && untilKickoff > -DAY && untilKickoff < 7 * DAY;
}

interface FootballDataOptions {
  fetchJson: FetchJson;
  now?: () => number;
  competitions?: readonly string[];
  enrichment?: TeamEnrichment;
  onDetailsError?: (error: unknown, matchId: string) => void;
}

export function createFootballDataSource({
  fetchJson,
  now = Date.now,
  enrichment,
  competitions = competitionCodes,
  onDetailsError,
}: FootballDataOptions): DataSource {
  const cache = createCache(now);
  const path = (code: string) => `/competitions/${code}`;

  const loadTeams = (code: string) =>
    cache.get(`${code}:teams`, TTL.teams, () => fetchJson<FdTeamsResponse>(`${path(code)}/teams`));

  function loadSeason(code: string) {
    return cache.get(`${code}:season`, TTL.matches, async () => {
      const [data, teams] = await Promise.all([
        fetchJson<FdMatchesResponse>(`${path(code)}/matches`),
        loadTeams(code),
      ]);
      const venues = new Map(teams.teams.map((team) => [String(team.id), team.venue ?? ""]));
      const matches = data.matches
        .map((match) => toMatch(match, venues, code))
        .filter((match): match is Match => match !== null);
      const pending = matches.filter((m) => m.status !== "finished").map((m) => m.round);
      const currentRound =
        data.matches.find((m) => m.season?.currentMatchday)?.season?.currentMatchday ??
        (pending.length ? Math.min(...pending) : 0);
      return { matches, byId: new Map(matches.map((m) => [m.id, m])), currentRound };
    });
  }

  function loadStandings(code: string): Promise<Standing[]> {
    return cache.get(`${code}:standings`, TTL.standings, async () => {
      const [data, season] = await Promise.all([
        fetchJson<FdStandingsResponse>(`${path(code)}/standings`),
        loadSeason(code),
      ]);
      const table = data.standings.find((s) => s.type === "TOTAL") ?? data.standings[0];
      return (table?.table ?? [])
        .map((row) => {
          const team = toSummary(row.team);
          return {
            position: row.position,
            team,
            played: row.playedGames,
            wins: row.won,
            draws: row.draw,
            losses: row.lost,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDifference: row.goalDifference,
            points: row.points,
            form: computeForm(season.matches, team.id),
          };
        })
        .sort((a, b) => a.position - b.position);
    });
  }

  const loadScorers = (code: string) =>
    cache.get(`${code}:scorers`, TTL.scorers, async () => {
      const data = await fetchJson<FdScorersResponse>(`${path(code)}/scorers?limit=100`);
      return data.scorers.map(
        (s): Scorer => ({
          player: {
            id: String(s.player.id),
            name: s.player.name,
            nationality: s.player.nationality ? translateCountry(s.player.nationality) : "",
          },
          team: toSummary(s.team),
          goals: s.goals ?? 0,
          assists: s.assists ?? null,
          penalties: s.penalties ?? null,
          playedMatches: s.playedMatches ?? null,
        })
      );
    });

  const isNotFound = (error: unknown) => / 40[04]\b/.test(String(error));
  const isNumericId = (id: string) => /^\d+$/.test(id);

  async function findTeam(id: string): Promise<{ team: FdTeam; competition: string | null } | null> {
    if (!isNumericId(id)) return null;
    for (const code of competitions) {
      const team = cache.peek<FdTeamsResponse>(`${code}:teams`)?.teams.find((t) => String(t.id) === id);
      if (team) return { team, competition: code };
    }
    try {
      const team = await cache.get(`team:${id}`, TTL.teams, () => fetchJson<FdTeam>(`/teams/${id}`));
      const running = team.runningCompetitions ?? [];
      const league =
        running.find((c) => c.type === "LEAGUE" && competitions.includes(c.code)) ??
        running.find((c) => competitions.includes(c.code));
      return { team, competition: league?.code ?? null };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  function resolveCoach(
    teamId: string,
    fdName: string | null,
    candidates: Awaited<ReturnType<TeamEnrichment["coaches"]>>
  ): Coach | null {
    const name = coachOverrides[teamId]?.name ?? fdName ?? candidates[0]?.name ?? "";
    if (!name) return null;
    const match = candidates.find((c) => samePerson(c.name, name));
    return {
      name,
      photo: match?.photo ?? null,
      nationality: match?.nationality ?? null,
      age: match?.age ?? null,
    };
  }

  const providers = [
    { name: "football-data.org", url: "https://www.football-data.org" },
    ...(enrichment ? [{ name: "API-Football", url: "https://www.api-football.com" }] : []),
  ];

  const source: DataSource = {
    info: () => ({
      name: "football-data",
      attribution: `Dados fornecidos por ${providers.map((p) => p.name).join(" e ")}`,
      providers,
      fallback: false,
    }),

    listCompetitions: () => listCompetitionInfo(competitions, new Date(now())),

    listMatches: async (code) => {
      const { matches, currentRound } = await loadSeason(code);
      return matches.filter((m) => isFeatured(m, currentRound, now()));
    },

    findMatch: async (id) => {
      for (const code of competitions) {
        const found = cache.peek<{ byId: Map<string, Match> }>(`${code}:season`)?.byId.get(id);
        if (found) return found;
      }
      if (!isNumericId(id)) return null;
      try {
        const match = await cache.get(`match:${id}`, TTL.match, () => fetchJson<FdMatch>(`/matches/${id}`));
        return toMatch(match, new Map());
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },

    getMatchDetails: async (id) => {
      const match = await source.findMatch(id);
      if (!match) return null;
      const details: MatchDetails = {
        match,
        phase: null,
        extraMinute: null,
        halfTime: null,
        referee: null,
        statistics: [],
        lineups: null,
        events: [],
        detailed: Boolean(enrichment),
      };
      if (!enrichment) return details;
      if (match.status === "scheduled" && Date.parse(match.kickoff) - now() > LINEUPS_WINDOW) {
        return details;
      }

      // Estatísticas, escalações e eventos vêm da API-Football. Se ela falhar
      // (ex.: limite diário), a página mostra só o básico em vez de dar erro.
      const extra = await enrichment.matchDetails(match).catch((error: unknown) => {
        onDetailsError?.(error, id);
        return undefined;
      });
      if (extra === undefined || extra === null) return { ...details, detailed: false };

      const { status, homeScore, awayScore, minute, ...rest } = extra;
      const fresh = status !== null && status !== "scheduled";
      return {
        ...details,
        ...rest,
        match: fresh
          ? { ...match, status, homeScore: homeScore ?? match.homeScore, awayScore: awayScore ?? match.awayScore, minute }
          : match,
      };
    },

    listStandings: loadStandings,

    listScorers: loadScorers,

    listTeams: async (code) =>
      (await loadTeams(code)).teams
        .map(toSummary)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),

    getTeam: async (id) => {
      const found = await findTeam(id);
      if (!found) return null;
      const { team, competition } = found;
      const standings = competition ? await loadStandings(competition).catch(() => []) : [];

      const [extraSquad, coaches] = enrichment
        ? await Promise.allSettled([enrichment.squad(id), enrichment.coaches(id)])
        : [];
      const fdSquad = (team.squad ?? []).map((person) => toPlayer(person, id, now()));
      const squad =
        extraSquad?.status === "fulfilled" && extraSquad.value?.length ? extraSquad.value : fdSquad;

      const result: Team = {
        ...toSummary(team),
        fullName: teamOverrides[team.id]?.fullName ?? team.name,
        competition,
        city: teamLinks[id]?.city ?? "",
        stadium: team.venue ?? "",
        founded: team.founded ?? null,
        coach: resolveCoach(id, team.coach?.name ?? null, coaches?.status === "fulfilled" ? coaches.value : []),
        standing: standings.find((row) => row.team.id === id) ?? null,
        squad: sortSquad(squad),
      };
      return result;
    },
  };
  return source;
}
