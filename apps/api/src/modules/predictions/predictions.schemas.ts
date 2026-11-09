import { z } from "zod";

const goals = (side: string) =>
  z
    .number({
      required_error: `Informe os gols do ${side}.`,
      invalid_type_error: `Os gols do ${side} devem ser um número.`,
    })
    .int("Use um número inteiro.")
    .min(0, "O placar não pode ser negativo.")
    .max(20, "O placar máximo é 20.");

/** Corpo do POST e do PUT (o PUT substitui o palpite inteiro). */
export const predictionBodySchema = z.object(
  {
    name: z
      .string({ required_error: "Informe seu nome." })
      .trim()
      .min(1, "Informe seu nome.")
      .min(2, "O nome precisa ter pelo menos 2 caracteres.")
      .max(60, "O nome pode ter no máximo 60 caracteres."),
    email: z
      .string({ required_error: "Informe seu e-mail." })
      .trim()
      .toLowerCase()
      .min(1, "Informe seu e-mail.")
      .email("Informe um e-mail válido."),
    matchId: z
      .string({ required_error: "Selecione uma partida." })
      .min(1, "Selecione uma partida."),
    homeGoals: goals("mandante"),
    awayGoals: goals("visitante"),
    comment: z
      .string({ invalid_type_error: "O comentário deve ser um texto." })
      .trim()
      .max(280, "O comentário pode ter no máximo 280 caracteres.")
      .optional()
      .default(""),
  },
  {
    required_error: "O corpo da requisição é obrigatório.",
    invalid_type_error: "O corpo da requisição deve ser um objeto JSON.",
  }
);

export const predictionParamsSchema = z.object({ id: z.string().min(1) });

export const predictionsQuerySchema = z.object({
  matchId: z.string().min(1).optional(),
});

export type PredictionInput = z.infer<typeof predictionBodySchema>;
