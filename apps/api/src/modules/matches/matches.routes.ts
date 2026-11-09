import type { FastifyInstance } from "fastify";
import { matchParamsSchema, matchesQuerySchema } from "./matches.schemas.js";
import { getMatch, listMatches } from "./matches.service.js";
import { resolveCompetition } from "../../lib/competition.js";

export async function matchesRoutes(app: FastifyInstance) {
  // GET /api/matches?competition=BSA&status=live|finished|scheduled&search=gremio
  app.get("/matches", async (request) => {
    const query = matchesQuerySchema.parse(request.query);
    const competition = resolveCompetition(app.dataSource, query.competition);
    return { data: await listMatches(app.dataSource, competition, query) };
  });

  // GET /api/matches/:id
  app.get("/matches/:id", async (request) => {
    const { id } = matchParamsSchema.parse(request.params);
    return { data: await getMatch(app.dataSource, id) };
  });
}
