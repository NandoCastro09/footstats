/** Formato padronizado de erro de todas as respostas da API. */
export interface ErrorBody {
  error: string; // código legível por máquina, ex.: "NOT_FOUND"
  message: string; // mensagem amigável em português
  details?: Record<string, string>; // erros por campo (validação)
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
  }

  toBody(): ErrorBody {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

export const notFound = (message: string) =>
  new AppError(404, "NOT_FOUND", message);

export const validationError = (details: Record<string, string>) =>
  new AppError(
    400,
    "VALIDATION_ERROR",
    "Alguns campos estão inválidos. Verifique e tente novamente.",
    details
  );

export const conflict = (message: string, details?: Record<string, string>) =>
  new AppError(409, "CONFLICT", message, details);
