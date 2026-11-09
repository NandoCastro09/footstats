import type { FastifyInstance } from "fastify";
import { matchParamsSchema, matchesQuerySchema } from "./matches.schemas.js";
import { getMatch, getMatchDetails, listMatches } from "./matches.service.js";
import { resolveCompetition } from "../../lib/competition.js";

export async function matchesRoutes(app: FastifyInstance) {
  app.get("/matches", async (request) => {
    const query = matchesQuerySchema.parse(request.query);
    const competition = resolveCompetition(app.dataSource, query.competition);
    return { data: await listMatches(app.dataSource, competition, query) };
  });

  app.get("/matches/:id", async (request) => {
    const { id } = matchParamsSchema.parse(request.params);
    return { data: await getMatch(app.dataSource, id) };
  });

  app.get("/matches/:id/details", async (request) => {
    const { id } = matchParamsSchema.parse(request.params);
    return { data: await getMatchDetails(app.dataSource, id) };
  });
}
