import type { FastifyError, FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError, validationError, type ErrorBody } from "../lib/errors.js";
import { zodErrorToDetails } from "../lib/validation.js";

/** Todas as falhas saem no formato { error, message, details? }. */
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(error.toBody());
    }

    if (error instanceof ZodError) {
      const appError = validationError(zodErrorToDetails(error));
      return reply.status(400).send(appError.toBody());
    }

    // Erros do próprio Fastify (JSON malformado, corpo vazio, 415...).
    const statusCode = "statusCode" in error ? error.statusCode : undefined;
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      const body: ErrorBody = {
        error: statusCode === 400 ? "BAD_REQUEST" : "REQUEST_ERROR",
        message:
          "code" in error && String(error.code).startsWith("FST_ERR_CTP")
            ? "O corpo da requisição é inválido ou está vazio."
            : error.message,
      };
      return reply.status(statusCode).send(body);
    }

    request.log.error(error);
    const body: ErrorBody = {
      error: "INTERNAL_ERROR",
      message: "Erro interno no servidor. Tente novamente em instantes.",
    };
    return reply.status(500).send(body);
  });

  app.setNotFoundHandler((request, reply) => {
    const body: ErrorBody = {
      error: "NOT_FOUND",
      message: `Rota ${request.method} ${request.url} não encontrada.`,
    };
    return reply.status(404).send(body);
  });
}
