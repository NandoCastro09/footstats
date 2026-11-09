import type { Player } from "../types.js";
import { teamLinks } from "../data/team-links.js";
import { createCache } from "../lib/cache.js";
import { mapPosition, translateCountry, type FetchJson } from "./football-data.js";

// API-Football (plano gratuito): só os endpoints SEM temporada funcionam —
// elenco atual (/players/squads: foto, número, idade, posição) e técnicos
// (/coachs: foto, nacionalidade). Limite: 100 req/dia e ~10 req/minuto, então
// tudo fica em cache por 24 h e, após um erro, a API faz uma pausa de 1 min.

const BASE_URL = "https://v3.football.api-sports.io";
const TTL = 24 * 60 * 60_000;
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

/** fetch autenticado. A API-Football responde 200 com `errors` preenchido em falhas (ex.: limite). */
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

/** Dados complementares por time (chave: id da football-data.org). */
export interface TeamEnrichment {
  /** Elenco atual com fotos; null se o time não tem ligação com a API-Football. */
  squad(teamId: string): Promise<Player[] | null>;
  /** Técnicos com vínculo em aberto no time, do mais recente ao mais antigo. */
  coaches(teamId: string): Promise<CoachCandidate[]>;
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

  function call<T>(key: string, path: string) {
    return cache.get(key, TTL, async () => {
      if (now() < pausedUntil) throw new Error("API-Football em pausa após um erro recente.");
      try {
        return await fetchJson<T>(path);
      } catch (error) {
        pausedUntil = now() + COOLDOWN; // não insiste: protege o limite por minuto
        throw error;
      }
    });
  }

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
        nationality: "", // o endpoint de elenco não informa
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
  };
}
