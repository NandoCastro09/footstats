import type { FastifyBaseLogger } from "fastify";
import { DEFAULT_COMPETITION } from "../data/competitions.js";
import { AppError } from "../lib/errors.js";
import type { DataSource } from "./types.js";

function upstreamError(error: unknown) {
  const rateLimited = /\b429\b|too many|rate ?limit/i.test(String(error));
  return new AppError(
    503,
    "UPSTREAM_UNAVAILABLE",
    rateLimited
      ? "Limite de consultas à fonte de dados atingido. Tente novamente em 1 minuto."
      : "Não foi possível obter os dados desta liga agora. Tente novamente em instantes."
  );
}

// Tenta a fonte real (football-data.org); se ela cair, responde com os dados mock
// em vez de quebrar o site.
export function withFallback(
  primary: DataSource,
  fallback: DataSource,
  log: Pick<FastifyBaseLogger, "warn" | "info">
): DataSource {
  let usingFallback = false;
  const fallbackCodes = fallback.listCompetitions().map((c) => c.code);

  async function attempt<T>(
    operation: string,
    run: (source: DataSource) => Promise<T>,
    competition: string = DEFAULT_COMPETITION
  ) {
    try {
      const result = await run(primary);
      if (usingFallback && fallbackCodes.includes(competition)) {
        log.info(`Fonte principal voltou (${operation}).`);
        usingFallback = false;
      }
      return result;
    } catch (error) {
      if (!fallbackCodes.includes(competition)) {
        log.warn({ err: error }, `Fonte principal falhou em ${operation} (${competition}), sem reserva.`);
        throw upstreamError(error);
      }
      if (!usingFallback) {
        log.warn({ err: error }, `Fonte principal falhou em ${operation}; usando dados mock.`);
      }
      usingFallback = true;
      return run(fallback);
    }
  }

  return {
    info: () => ({ ...(usingFallback ? fallback : primary).info(), fallback: usingFallback }),
    listCompetitions: () => primary.listCompetitions(),
    listMatches: (code) => attempt("listMatches", (s) => s.listMatches(code), code),
    findMatch: (id) => attempt("findMatch", (s) => s.findMatch(id)),
    getMatchDetails: (id) => attempt("getMatchDetails", (s) => s.getMatchDetails(id)),
    listStandings: (code) => attempt("listStandings", (s) => s.listStandings(code), code),
    listTeams: (code) => attempt("listTeams", (s) => s.listTeams(code), code),
    getTeam: (id) => attempt("getTeam", (s) => s.getTeam(id)),
    listScorers: (code) => attempt("listScorers", (s) => s.listScorers(code), code),
  };
}
