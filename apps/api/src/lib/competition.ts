import { DEFAULT_COMPETITION } from "../data/competitions.js";
import type { DataSource } from "../sources/types.js";
import { notFound } from "./errors.js";

/** ?competition=pl → "PL" (padrão: Brasileirão). 404 se a fonte não oferece essa liga. */
export function resolveCompetition(source: DataSource, value: unknown) {
  const code = (typeof value === "string" && value.trim() ? value : DEFAULT_COMPETITION)
    .trim()
    .toUpperCase();
  if (!source.listCompetitions().some((c) => c.code === code)) {
    throw notFound(`A liga "${code}" não está disponível.`);
  }
  return code;
}
