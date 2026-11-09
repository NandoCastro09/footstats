import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { resolveCompetition } from "../../lib/competition.js";

const scorersQuerySchema = z.object({
  competition: z.string().optional(),
  team: z.string().min(1).optional(),
  limit: z.coerce
    .number({ invalid_type_error: "Use um número." })
    .int("Use um número inteiro.")
    .min(1, "O mínimo é 1.")
    .max(100, "O máximo é 100.")
    .default(100),
});

export async function scorersRoutes(app: FastifyInstance) {
  app.get("/scorers", async (request) => {
    const { competition, team, limit } = scorersQuerySchema.parse(request.query);
    const scorers = await app.dataSource.listScorers(resolveCompetition(app.dataSource, competition));
    return { data: scorers.filter((s) => !team || s.team.id === team).slice(0, limit) };
  });
}
