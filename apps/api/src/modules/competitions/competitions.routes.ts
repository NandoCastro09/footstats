import type { FastifyInstance } from "fastify";

export async function competitionsRoutes(app: FastifyInstance) {
  app.get("/competitions", async () => ({ data: app.dataSource.listCompetitions() }));
}
