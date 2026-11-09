import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../config/env.js";
import { createApiFootballEnrichment, createApiFootballFetch } from "./api-football.js";
import { withFallback } from "./fallback.js";
import { createFootballDataFetch, createFootballDataSource } from "./football-data.js";
import { createMockSource } from "./mock.js";
import type { DataSource } from "./types.js";

/**
 * DATA_SOURCE=auto (padrão): football-data.org se houver FOOTBALL_DATA_TOKEN, senão mock.
 * DATA_SOURCE=football-data: exige o token.
 * DATA_SOURCE=mock: sempre os dados fictícios (testes, demonstração offline).
 */
export function createDataSource(env: Env, log: Pick<FastifyBaseLogger, "warn" | "info">): DataSource {
  const mock = createMockSource();
  const token = env.FOOTBALL_DATA_TOKEN;
  const wantsReal = env.DATA_SOURCE === "football-data" || (env.DATA_SOURCE === "auto" && token);

  if (!wantsReal) {
    log.info("Fonte de dados: mock.");
    return mock;
  }
  if (!token) {
    throw new Error("DATA_SOURCE=football-data exige a variável FOOTBALL_DATA_TOKEN.");
  }

  const enrichment = env.API_FOOTBALL_KEY
    ? createApiFootballEnrichment({ fetchJson: createApiFootballFetch(env.API_FOOTBALL_KEY) })
    : undefined;
  log.info(
    `Fonte de dados: football-data.org${enrichment ? " + API-Football (fotos e técnicos)" : ""}, com reserva em mock.`
  );
  return withFallback(
    createFootballDataSource({ fetchJson: createFootballDataFetch(token), enrichment }),
    mock,
    log
  );
}

export type { DataSource } from "./types.js";
