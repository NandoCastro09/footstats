import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ErrorBody } from "../lib/errors.js";

const MAX_DELAY_MS = 10_000;

const errorCodes: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_ERROR",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
  504: "GATEWAY_TIMEOUT",
};

function readFlag(request: FastifyRequest, query: string, header: string) {
  const fromQuery = (request.query as Record<string, unknown> | undefined)?.[query];
  const value = fromQuery ?? request.headers[header];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function parseSimulatedStatus(value: string | undefined) {
  if (!value || value === "false") return null;
  if (value === "true") return 500;
  const status = Number(value);
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
}

export function parseDelay(value: string | undefined) {
  const delay = Number(value);
  if (!value || !Number.isFinite(delay) || delay <= 0) return 0;
  return Math.min(delay, MAX_DELAY_MS);
}

// "Modo demonstração": o front manda ?simulateError=500 ou ?delay=3000
// e a API responde com erro ou atraso de propósito, para mostrar as telas de erro/carregando.
export function registerSimulation(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (request.method === "OPTIONS" || request.url.startsWith("/health")) return;

    const delay = parseDelay(readFlag(request, "delay", "x-simulate-delay"));
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const status = parseSimulatedStatus(
      readFlag(request, "simulateError", "x-simulate-error")
    );
    if (status !== null) {
      const body: ErrorBody = {
        error: errorCodes[status] ?? "SIMULATED_ERROR",
        message: `Erro ${status} simulado para demonstração.`,
      };
      return reply.status(status).send(body);
    }
  });
}
