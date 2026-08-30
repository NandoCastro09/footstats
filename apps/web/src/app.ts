import Fastify from "fastify";
import cors from "@fastify/cors";

export async function createApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: "http://localhost:5173",
  });

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  app.get("/api/leagues", async () => {
    return { 
      data: [],
      message: "Placeholder - dados virão do Sportmonks"
    };
  });

  return app;
}