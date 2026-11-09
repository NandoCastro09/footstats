import { z } from "zod";

const goals = (side: string) =>
  z
    .number({
      required_error: `Informe os gols do ${side}.`,
      invalid_type_error: `Informe os gols do ${side}.`,
    })
    .int("Use um número inteiro.")
    .min(0, "O placar não pode ser negativo.")
    .max(20, "O placar máximo é 20.");

export const predictionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe seu nome.")
    .min(2, "O nome precisa ter pelo menos 2 caracteres.")
    .max(60, "O nome pode ter no máximo 60 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  matchId: z.string().min(1, "Selecione uma partida."),
  homeGoals: goals("mandante"),
  awayGoals: goals("visitante"),
  comment: z.string().trim().max(280, "O comentário pode ter no máximo 280 caracteres."),
});

export type PredictionFormValues = z.infer<typeof predictionSchema>;

export const COMMENT_MAX = 280;

export const predictionFields = [
  "name",
  "email",
  "matchId",
  "homeGoals",
  "awayGoals",
  "comment",
] as const satisfies ReadonlyArray<keyof PredictionFormValues>;
