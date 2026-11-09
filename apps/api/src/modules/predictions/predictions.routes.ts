import type { FastifyInstance } from "fastify";
import {
  predictionBodySchema,
  predictionParamsSchema,
  predictionsQuerySchema,
} from "./predictions.schemas.js";

export async function predictionsRoutes(app: FastifyInstance) {
  // GET /api/predictions?matchId=...
  app.get("/predictions", async (request) => {
    const { matchId } = predictionsQuerySchema.parse(request.query);
    return { data: await app.predictions.list(matchId) };
  });

  // POST /api/predictions → 201
  app.post("/predictions", async (request, reply) => {
    const input = predictionBodySchema.parse(request.body);
    const prediction = await app.predictions.create(input);
    return reply.status(201).send({ data: prediction });
  });

  // PUT /api/predictions/:id → 200
  app.put("/predictions/:id", async (request) => {
    const { id } = predictionParamsSchema.parse(request.params);
    const input = predictionBodySchema.parse(request.body);
    return { data: await app.predictions.update(id, input) };
  });

  // DELETE /api/predictions/:id → 204
  app.delete("/predictions/:id", async (request, reply) => {
    const { id } = predictionParamsSchema.parse(request.params);
    await app.predictions.remove(id);
    return reply.status(204).send();
  });
}
