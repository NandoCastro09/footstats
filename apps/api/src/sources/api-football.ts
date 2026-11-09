import type { Match, Player } from "../types.js";
import { teamLinks } from "../data/team-links.js";
import { createCache } from "../lib/cache.js";
import { mapPosition, translateCountry, type FetchJson } from "./football-data.js";
import {
  findFixture,
  toAfMatchDetails,
  type AfFixture,
  type AfFixtureSummary,
  type AfMatchDetails,
} from "./api-football-match.js";

const BASE_URL = "https://v3.football.api-sports.io";
// Quanto tempo cada resposta fica em cache (a cota da API-Football é por dia).
const TTL = 24 * 60 * 60_000;
const MINUTE = 60_000;
const FIXTURE_TTL = { live: 3 * MINUTE, scheduled: 20 * MINUTE, finished: 7 * 24 * 60 * MINUTE };
const DATE_TTL = 6 * 60 * MINUTE;

export function inFreeDateWindow(date: string, now: number) {
  const day = Date.parse(`${date}T00:00:00Z`);
  const today = Date.parse(new Date(now).toISOString().slice(0, 10) + "T00:00:00Z");
  return Math.abs(day - today) <= 24 * 60 * MINUTE;
}
const COOLDOWN = 60_000;

interface AfSquadResponse {
  response: Array<{
    players: Array<{
      id: number;
      name: string;
      age: number | null;
      number: number | null;
      position: string | null;
      photo: string | null;
    }>;
  }>;
}

interface AfCoachesResponse {
  response: Array<{
    name: string;
    age: number | null;
    nationality: string | null;
    photo: string | null;
    career: Array<{ team: { id: number } | null; start: string | null; end: string | null }> | null;
  }>;
}

export function createApiFootballFetch(key: string): FetchJson {
  return async <T>(path: string) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "x-apisports-key": key },
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await response.json().catch(() => null)) as { errors?: unknown } | null;
    if (!response.ok) throw new Error(`API-Football respondeu ${response.status}`);
    const errors = body?.errors;
    const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0;
    if (hasErrors) throw new Error(`API-Football: ${JSON.stringify(errors)}`);
    return body as T;
  };
}

export interface CoachCandidate {
  name: string;
  photo: string | null;
  nationality: string | null;
  age: number | null;
  since: string | null;
}

export interface TeamEnrichment {
  squad(teamId: string): Promise<Player[] | null>;
  coaches(teamId: string): Promise<CoachCandidate[]>;
  matchDetails(match: Match): Promise<AfMatchDetails | null>;
}

export function createApiFootballEnrichment({
  fetchJson,
  now = Date.now,
}: {
  fetchJson: FetchJson;
  now?: () => number;
}): TeamEnrichment {
  const cache = createCache(now);
  let pausedUntil = 0;

  // Toda chamada passa pelo cache. Se der erro, pausa 1 minuto para não gastar a cota insistindo.
  function call<T>(key: string, path: string, ttl = TTL, transform?: (body: unknown) => T) {
    return cache.get(key, ttl, async () => {
      if (now() < pausedUntil) throw new Error("API-Football em pausa após um erro recente.");
      try {
        const body = await fetchJson<T>(path);
        return transform ? transform(body) : body;
      } catch (error) {
        pausedUntil = now() + COOLDOWN;
        throw error;
      }
    });
  }

  const summarize = (body: unknown) =>
    (body as { response: AfFixtureSummary[] }).response.map((f) => ({
      fixture: { id: f.fixture.id, date: f.fixture.date, status: { short: f.fixture.status.short } },
      teams: {
        home: { id: f.teams.home.id, name: f.teams.home.name },
        away: { id: f.teams.away.id, name: f.teams.away.name },
      },
    }));

  const fixturesOn = (date: string) =>
    call<AfFixtureSummary[]>(`date:${date}`, `/fixtures?date=${date}`, DATE_TTL, summarize);

  return {
    async squad(teamId) {
      const link = teamLinks[teamId];
      if (!link) return null;
      const id = link.apiFootballId;
      const data = await call<AfSquadResponse>(`squad:${id}`, `/players/squads?team=${id}`);
      return (data.response[0]?.players ?? []).map((p) => ({
        id: `af-${p.id}`,
        name: p.name,
        number: p.number ?? null,
        position: mapPosition(p.position),
        nationality: "",
        age: p.age ?? null,
        goals: null,
        assists: null,
        yellowCards: null,
        injured: false,
        photo: p.photo ?? null,
      }));
    },

    async coaches(teamId) {
      const link = teamLinks[teamId];
      if (!link) return [];
      const id = link.apiFootballId;
      const data = await call<AfCoachesResponse>(`coaches:${id}`, `/coachs?team=${id}`);
      return data.response
        .map((coach) => {
          const stint = (coach.career ?? []).find((c) => c.team?.id === id && !c.end);
          return stint
            ? {
                name: coach.name,
                photo: coach.photo ?? null,
                nationality: coach.nationality ? translateCountry(coach.nationality) : null,
                age: coach.age ?? null,
                since: stint.start,
              }
            : null;
        })
        .filter((c): c is CoachCandidate => c !== null)
        .sort((a, b) => (b.since ?? "").localeCompare(a.since ?? ""));
    },

    async matchDetails(match) {
      const home = { afId: teamLinks[match.homeTeam.id]?.apiFootballId, name: match.homeTeam.name };
      const away = { afId: teamLinks[match.awayTeam.id]?.apiFootballId, name: match.awayTeam.name };
      const date = match.kickoff.slice(0, 10);

      // A football-data e a API-Football têm ids diferentes para a mesma partida.
      // Achamos o jogo pela data + times: jogos de ontem/hoje/amanhã vêm numa lista do dia;
      // os mais antigos, pelo histórico de confrontos (head-to-head) dos dois times.
      let found: AfFixtureSummary | null = null;
      if (inFreeDateWindow(date, now())) {
        found = findFixture(await fixturesOn(date), home, away);
      } else if (home.afId !== undefined && away.afId !== undefined) {
        const meetings = await call<AfFixtureSummary[]>(
          `h2h:${home.afId}-${away.afId}`,
          `/fixtures/headtohead?h2h=${home.afId}-${away.afId}`,
          DATE_TTL,
          summarize
        );
        found = findFixture(meetings.filter((f) => f.fixture.date.slice(0, 10) === date), home, away);
      }
      if (!found) return null;

      const id = found.fixture.id;
      const data = await call<{ response: AfFixture[] }>(
        `fixture:${id}`,
        `/fixtures?id=${id}`,
        FIXTURE_TTL[match.status]
      );
      const fixture = data.response[0];
      return fixture ? toAfMatchDetails(fixture) : null;
    },
  };
}
