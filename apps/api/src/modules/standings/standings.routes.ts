import type { FastifyInstance } from "fastify";
import { resolveCompetition } from "../../lib/competition.js";

export async function standingsRoutes(app: FastifyInstance) {
  app.get("/standings", async (request) => {
    const { competition } = request.query as { competition?: string };
    return { data: await app.dataSource.listStandings(resolveCompetition(app.dataSource, competition)) };
  });
}
