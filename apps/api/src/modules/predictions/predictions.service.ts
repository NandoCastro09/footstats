import { randomUUID } from "node:crypto";
import type { Match, Prediction, PredictionRecord } from "../../types.js";
import type { DataSource } from "../../sources/types.js";
import { predictionsSeed } from "../../data/predictions.js";
import { DEFAULT_COMPETITION } from "../../data/competitions.js";
import { maskEmail } from "../../lib/email.js";
import { conflict, notFound, validationError } from "../../lib/errors.js";
import type { PredictionInput, PredictionUpdateInput } from "./predictions.schemas.js";

export type PredictionsService = ReturnType<typeof createPredictionsService>;

export function createPredictionsService(source: DataSource) {
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

  function toPublic({ email, ...record }: PredictionRecord, match: Match): Prediction {
    return { ...record, emailMasked: maskEmail(email), match };
  }

  async function withMatch(record: PredictionRecord): Promise<Prediction | null> {
    const match = await source.findMatch(record.matchId);
    return match ? toPublic(record, match) : null;
  }

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
      return toPublic(record, match);
    },

    async update(id: string, input: PredictionUpdateInput): Promise<Prediction> {
      await ensureSeeded();
      const current = store.get(id);
      if (!current) throw notFound(`Palpite "${id}" não encontrado.`);
      const merged: PredictionInput = { ...input, email: input.email ?? current.email };
      const match = await assertValid(merged, id);
      const record: PredictionRecord = { ...current, ...merged, updatedAt: new Date().toISOString() };
      store.set(id, record);
      return toPublic(record, match);
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
