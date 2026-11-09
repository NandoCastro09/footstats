import type { ZodError } from "zod";

/** Converte um ZodError em { campo: "primeira mensagem" }. */
export function zodErrorToDetails(error: ZodError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "_root";
    details[field] ??= issue.message;
  }
  return details;
}
