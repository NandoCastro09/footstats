import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { notFound } from "../../lib/errors.js";
import { resolveCompetition } from "../../lib/competition.js";

const teamParamsSchema = z.object({ id: z.string().min(1) });

export async function teamsRoutes(app: FastifyInstance) {
  app.get("/teams", async (request) => {
    const { competition } = request.query as { competition?: string };
    return { data: await app.dataSource.listTeams(resolveCompetition(app.dataSource, competition)) };
  });

  app.get("/teams/:id", async (request) => {
    const { id } = teamParamsSchema.parse(request.params);
    const team = await app.dataSource.getTeam(id);
    if (!team) throw notFound(`Time "${id}" não encontrado.`);
    return { data: team };
  });
}
