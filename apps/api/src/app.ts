import Fastify, { type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { loadEnv, type Env } from "./config/env.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { registerSimulation } from "./plugins/simulation.js";
import { matchesRoutes } from "./modules/matches/matches.routes.js";
import { predictionsRoutes } from "./modules/predictions/predictions.routes.js";
import { standingsRoutes } from "./modules/standings/standings.routes.js";
import { teamsRoutes } from "./modules/teams/teams.routes.js";
import { scorersRoutes } from "./modules/scorers/scorers.routes.js";
import { competitionsRoutes } from "./modules/competitions/competitions.routes.js";
import {
  createPredictionsService,
  type PredictionsService,
} from "./modules/predictions/predictions.service.js";
import { createDataSource, type DataSource } from "./sources/index.js";

declare module "fastify" {
  interface FastifyInstance {
    dataSource: DataSource;
    predictions: PredictionsService;
  }
}

export function createOriginMatcher(list: string) {
  const patterns = list
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)
    .map((origin) => {
      if (!origin.includes("*")) return origin;
      const escaped = origin
        .split("*")
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join("[a-z0-9-]*");
      return new RegExp(`^${escaped}$`, "i");
    });

  return (origin: string | undefined) =>
    !origin ||
    patterns.some((pattern) =>
      typeof pattern === "string" ? pattern === origin : pattern.test(origin)
    );
}

interface CreateAppOptions {
  env?: Env;
  logger?: FastifyServerOptions["logger"];
  dataSource?: DataSource;
}

export async function createApp({
  env = loadEnv(),
  logger = true,
  dataSource,
}: CreateAppOptions = {}) {
  const app = Fastify({ logger });

  const source = dataSource ?? createDataSource(env, app.log);
  app.decorate("dataSource", source);
  app.decorate("predictions", createPredictionsService(source));

  const isAllowedOrigin = createOriginMatcher(env.CORS_ORIGIN);
  await app.register(cors, {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  registerErrorHandler(app);
  registerSimulation(app);

  app.get("/health", async () => ({
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    dataSource: app.dataSource.info(),
  }));

  await app.register(
    async (api) => {
      await api.register(competitionsRoutes);
      await api.register(matchesRoutes);
      await api.register(standingsRoutes);
      await api.register(teamsRoutes);
      await api.register(scorersRoutes);
      await api.register(predictionsRoutes);
    },
    { prefix: "/api" }
  );

  return app;
}
