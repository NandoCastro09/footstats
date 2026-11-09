import { z } from "zod";

export const matchesQuerySchema = z.object({
  competition: z.string().optional(),
  status: z
    .enum(["live", "finished", "scheduled"], {
      errorMap: () => ({ message: "Use live, finished ou scheduled." }),
    })
    .optional(),
  search: z
    .string()
    .trim()
    .max(50, "A busca pode ter no máximo 50 caracteres.")
    .optional(),
});

export const matchParamsSchema = z.object({
  id: z.string().min(1),
});

export type MatchesQuery = z.infer<typeof matchesQuerySchema>;
