import type { Player, PlayerPosition } from "../types.js";
import { createRandom, pick, randomInt, type Random } from "../lib/random.js";
import { teams } from "./teams.js";

const firstNames = [
  "Lucas", "Gabriel", "Matheus", "Pedro", "Rafael", "Gustavo", "Felipe", "Bruno",
  "Thiago", "Vitor", "Diego", "Rodrigo", "Caio", "Igor", "João", "Arthur",
  "Henrique", "Daniel", "Eduardo", "Leonardo", "Marcos", "Wesley", "Renan", "Alan",
  "Davi", "Samuel", "Murilo", "Otávio", "Yuri", "Kaique",
];
const lastNames = [
  "Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Ferreira",
  "Almeida", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Barbosa", "Araújo",
  "Moreira", "Cardoso", "Teixeira", "Nunes", "Mendes", "Freitas", "Vieira", "Batista",
  "Campos", "Moura", "Pinheiro", "Fonseca",
];
const foreignFirstNames = ["Matías", "Facundo", "Nicolás", "Santiago", "Joaquín", "Agustín", "Sebastián"];
const foreignLastNames = ["Gómez", "Fernández", "Rodríguez", "Suárez", "Benítez", "Acosta", "Cabrera"];
const foreignCountries = ["Argentina", "Uruguai", "Colômbia", "Paraguai", "Equador"];

const template: Array<[number, PlayerPosition]> = [
  [1, "Goleiro"], [12, "Goleiro"],
  [2, "Defensor"], [3, "Defensor"], [4, "Defensor"], [6, "Defensor"], [13, "Defensor"], [14, "Defensor"],
  [5, "Meio-campo"], [8, "Meio-campo"], [10, "Meio-campo"], [15, "Meio-campo"], [16, "Meio-campo"], [18, "Meio-campo"],
  [7, "Atacante"], [9, "Atacante"], [11, "Atacante"], [19, "Atacante"],
];

const statRanges: Record<PlayerPosition, { goals: number; assists: number; cards: number }> = {
  Goleiro: { goals: 0, assists: 1, cards: 3 },
  Defensor: { goals: 3, assists: 3, cards: 9 },
  "Meio-campo": { goals: 7, assists: 9, cards: 8 },
  Atacante: { goals: 16, assists: 7, cards: 5 },
};

function createName(random: Random, foreign: boolean) {
  return foreign
    ? `${pick(random, foreignFirstNames)} ${pick(random, foreignLastNames)}`
    : `${pick(random, firstNames)} ${pick(random, lastNames)}`;
}

function createSquad(teamId: string, seed: number): Player[] {
  const random = createRandom(seed);
  const used = new Set<string>();

  return template.map(([number, position]) => {
    const foreign = random() < 0.15;
    let name = createName(random, foreign);
    while (used.has(name)) name = createName(random, foreign);
    used.add(name);

    const range = statRanges[position];
    const weight = number <= 11 ? 1 : 0.45;
    return {
      id: `${teamId}-${number}`,
      name,
      number,
      position,
      nationality: foreign ? pick(random, foreignCountries) : "Brasil",
      age: randomInt(random, 18, 35),
      goals: Math.round(randomInt(random, 0, range.goals) * weight),
      assists: Math.round(randomInt(random, 0, range.assists) * weight),
      yellowCards: Math.round(randomInt(random, 0, range.cards) * weight),
      injured: random() < 0.08,
      photo: null,
    };
  });
}

export const squadsByTeam = new Map(
  teams.map((team, index) => [team.id, createSquad(team.id, 1000 + index)])
);
