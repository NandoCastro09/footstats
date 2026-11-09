import { randomUUID } from "node:crypto";
import type { Prediction, PredictionRecord } from "../../types.js";
import type { DataSource } from "../../sources/types.js";
import { predictionsSeed } from "../../data/predictions.js";
import { DEFAULT_COMPETITION } from "../../data/competitions.js";
import { conflict, notFound, validationError } from "../../lib/errors.js";
import type { PredictionInput } from "./predictions.schemas.js";

export type PredictionsService = ReturnType<typeof createPredictionsService>;

export function createPredictionsService(source: DataSource) {
  // Sem banco de dados: os palpites ficam em memória (somem quando a API reinicia).
  const store = new Map<string, PredictionRecord>();
  let seeding: Promise<void> | null = null;

  function ensureSeeded() {
    seeding ??= (async () => {
      const upcoming = (await source.listMatches(DEFAULT_COMPETITION))
        .filter((match) => match.status === "scheduled")
        .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff));
      predictionsSeed.forEach((seed, index) => {
        const match = upcoming[index];
        if (match) store.set(seed.id, { ...seed, matchId: match.id });
      });
    })().catch((error) => {
      seeding = null;
      throw error;
    });
    return seeding;
  }

  async function withMatch(record: PredictionRecord): Promise<Prediction | null> {
    const match = await source.findMatch(record.matchId);
    return match ? { ...record, match } : null;
  }

  // Regras de negócio: a partida precisa existir, não pode ter começado
  // e cada e-mail só pode ter um palpite por partida (409 Conflict).
  async function assertValid(input: PredictionInput, ignoreId?: string) {
    const match = await source.findMatch(input.matchId);
    if (!match) {
      throw validationError({ matchId: "Partida não encontrada." });
    }
    if (match.status !== "scheduled") {
      throw validationError({
        matchId: "Só é possível palpitar em partidas que ainda não começaram.",
      });
    }

    const duplicate = [...store.values()].some(
      (p) => p.id !== ignoreId && p.email === input.email && p.matchId === input.matchId
    );
    if (duplicate) {
      throw conflict("Este e-mail já tem um palpite para essa partida.", {
        matchId: "Você já palpitou nesta partida. Edite o palpite existente.",
      });
    }
    return match;
  }

  return {
    async list(matchId?: string): Promise<Prediction[]> {
      await ensureSeeded();
      const records = [...store.values()]
        .filter((p) => !matchId || p.matchId === matchId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const predictions = await Promise.all(records.map(withMatch));
      return predictions.filter((p): p is Prediction => p !== null);
    },

    async create(input: PredictionInput): Promise<Prediction> {
      await ensureSeeded();
      const match = await assertValid(input);
      const now = new Date().toISOString();
      const record: PredictionRecord = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
      store.set(record.id, record);
      return { ...record, match };
    },

    async update(id: string, input: PredictionInput): Promise<Prediction> {
      await ensureSeeded();
      const current = store.get(id);
      if (!current) throw notFound(`Palpite "${id}" não encontrado.`);
      const match = await assertValid(input, id);
      const record: PredictionRecord = { ...current, ...input, updatedAt: new Date().toISOString() };
      store.set(id, record);
      return { ...record, match };
    },

    async remove(id: string) {
      await ensureSeeded();
      if (!store.delete(id)) throw notFound(`Palpite "${id}" não encontrado.`);
    },

    reset() {
      store.clear();
      seeding = null;
    },
  };
}
