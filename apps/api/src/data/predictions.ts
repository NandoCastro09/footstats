import type { PredictionRecord } from "../types.js";

export const predictionsSeed: Array<Omit<PredictionRecord, "matchId">> = [
  {
    id: "seed-1",
    name: "Ana Souza",
    email: "ana.souza@example.com",
    homeGoals: 2,
    awayGoals: 1,
    comment: "Mandante embalado, acho que vence de virada.",
    createdAt: "2026-11-01T14:00:00.000Z",
    updatedAt: "2026-11-01T14:00:00.000Z",
  },
  {
    id: "seed-2",
    name: "Bruno Lima",
    email: "bruno.lima@example.com",
    homeGoals: 0,
    awayGoals: 0,
    comment: "",
    createdAt: "2026-11-02T18:30:00.000Z",
    updatedAt: "2026-11-02T18:30:00.000Z",
  },
  {
    id: "seed-3",
    name: "Carla Mendes",
    email: "carla.mendes@example.com",
    homeGoals: 1,
    awayGoals: 3,
    comment: "Visitante tem o melhor ataque da rodada.",
    createdAt: "2026-11-03T09:15:00.000Z",
    updatedAt: "2026-11-03T09:15:00.000Z",
  },
];
