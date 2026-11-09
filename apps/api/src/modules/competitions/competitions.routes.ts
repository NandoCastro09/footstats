import type { FastifyInstance } from "fastify";

export async function competitionsRoutes(app: FastifyInstance) {
  // GET /api/competitions — ligas disponíveis
  app.get("/competitions", async () => ({ data: app.dataSource.listCompetitions() }));
}
