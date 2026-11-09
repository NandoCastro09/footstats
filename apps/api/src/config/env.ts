import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  // Lista separada por vírgula; aceita curinga (*) para previews da Vercel.
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  // auto: usa a football-data.org quando houver token; senão, o mock.
  DATA_SOURCE: z.enum(["auto", "football-data", "mock"]).default("auto"),
  FOOTBALL_DATA_TOKEN: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  // Opcional: fotos dos jogadores, número da camisa e técnicos (API-Football).
  API_FOOTBALL_KEY: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Variáveis de ambiente inválidas: ${issues}`);
  }
  return parsed.data;
}
