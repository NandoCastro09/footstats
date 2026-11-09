import { describe, expect, it, vi } from "vitest";
import { samePerson } from "../lib/names.js";
import { createApiFootballEnrichment, type TeamEnrichment } from "./api-football.js";
import { createFootballDataSource, type FetchJson } from "./football-data.js";

const NOW = Date.parse("2026-11-05T12:00:00Z");

describe("samePerson: nomes escritos de jeitos diferentes", () => {
  it.each([
    ["E. Domínguez", "Eduardo Dominguez"],
    ["Ceni Rogerio", "Rogério Ceni"],
    ["Marcao", "Marcão"],
    ["A. Rossi", "Agustín Rossi"],
    ["Lacerda Rafael", "Lacerda"],
  ])("%s = %s", (a, b) => expect(samePerson(a, b)).toBe(true));

  it.each([
    ["Roger Machado", "Dorival Júnior"],
    ["G. Silva", "Pedro Silva"],
    ["", "Tite"],
  ])("%s ≠ %s", (a, b) => expect(samePerson(a, b)).toBe(false));
});

function apiFootballFetch(overrides: Record<string, unknown> = {}) {
  const responses: Record<string, unknown> = {
    "/players/squads?team=127": {
      response: [
        {
          players: [
            { id: 1, name: "A. Rossi", age: 30, number: 1, position: "Goalkeeper", photo: "https://media/1.png" },
            { id: 9, name: "Pedro", age: 29, number: 9, position: "Attacker", photo: "https://media/9.png" },
          ],
        },
      ],
    },
    "/coachs?team=127": {
      response: [
        { name: "Ex Técnico", age: 60, nationality: "Brazil", photo: "https://media/c0.png", career: [{ team: { id: 127 }, start: "2024-01-01", end: "2025-06-01" }] },
        { name: "Interino Antigo", age: 45, nationality: "Brazil", photo: "https://media/c1.png", career: [{ team: { id: 127 }, start: "2025-07-01", end: null }] },
        { name: "L. Jardim", age: 52, nationality: "Portugal", photo: "https://media/c2.png", career: [{ team: { id: 127 }, start: "2026-09-01", end: null }] },
      ],
    },
    ...overrides,
  };
  return vi.fn(async (path: string) => {
    const value = responses[path];
    if (value instanceof Error) throw value;
    if (!value) throw new Error(`rota inesperada: ${path}`);
    return structuredClone(value);
  }) as unknown as FetchJson & ReturnType<typeof vi.fn>;
}

describe("API-Football: elenco e técnicos", () => {
  it("elenco com foto, número e posição (chave: id da football-data.org)", async () => {
    const enrichment = createApiFootballEnrichment({ fetchJson: apiFootballFetch(), now: () => NOW });
    const squad = (await enrichment.squad("1783"))!;
    expect(squad[1]).toMatchObject({ name: "Pedro", number: 9, position: "Atacante", age: 29, photo: "https://media/9.png" });
    expect(await enrichment.squad("999999")).toBeNull();
  });

  it("técnicos com vínculo em aberto, do mais recente ao mais antigo", async () => {
    const enrichment = createApiFootballEnrichment({ fetchJson: apiFootballFetch(), now: () => NOW });
    const coaches = await enrichment.coaches("1783");
    expect(coaches.map((c) => c.name)).toEqual(["L. Jardim", "Interino Antigo"]);
    expect(coaches[0]).toMatchObject({ nationality: "Portugal", photo: "https://media/c2.png" });
  });

  it("faz uma pausa depois de um erro (não estoura o limite por minuto)", async () => {
    let time = NOW;
    const fetchJson = apiFootballFetch({ "/coachs?team=127": new Error("rateLimit") });
    const enrichment = createApiFootballEnrichment({ fetchJson, now: () => time });
    await expect(enrichment.coaches("1783")).rejects.toThrow("rateLimit");
    await expect(enrichment.squad("1783")).rejects.toThrow("pausa");
    expect(fetchJson).toHaveBeenCalledTimes(1);
    time += 61_000;
    await expect(enrichment.squad("1783")).resolves.toHaveLength(2);
  });
});

const fla = { id: 1783, name: "CR Flamengo", shortName: "Flamengo", tla: "FLA", crest: null };
const vas = { id: 1780, name: "CR Vasco da Gama", shortName: "Vasco da Gama", tla: "VAS", crest: null };
const footballData: Record<string, unknown> = {
  "/competitions/BSA/matches": { matches: [] },
  "/competitions/BSA/standings": { standings: [{ type: "TOTAL", table: [] }] },
  "/competitions/BSA/teams": {
    teams: [
      { ...fla, founded: 1895, venue: "Maracanã", coach: { name: "Leonardo Jardim" }, runningCompetitions: [{ code: "BSA", type: "LEAGUE" }], squad: [{ id: 5, name: "Agustín Rossi", position: "Goalkeeper", dateOfBirth: "1995-08-21", nationality: "Argentina" }] },
      { ...vas, founded: 1898, venue: "São Januário", coach: { name: "Possato" }, runningCompetitions: [{ code: "BSA", type: "LEAGUE" }], squad: [] },
    ],
  },
};
const footballDataFetch = (async (path: string) => {
  const teamId = path.match(/^\/teams\/(\d+)$/)?.[1];
  if (teamId) {
    const teams = (footballData["/competitions/BSA/teams"] as { teams: Array<{ id: number }> }).teams;
    return structuredClone(teams.find((t) => String(t.id) === teamId));
  }
  return structuredClone(footballData[path]);
}) as FetchJson;

describe("página do time: football-data.org + API-Football", () => {
  it("usa o elenco com fotos e a foto do técnico quando o nome bate", async () => {
    const enrichment = createApiFootballEnrichment({ fetchJson: apiFootballFetch(), now: () => NOW });
    const source = createFootballDataSource({ fetchJson: footballDataFetch, now: () => NOW, enrichment });
    const team = (await source.getTeam("1783"))!;
    expect(team.squad.map((p) => p.name)).toEqual(["A. Rossi", "Pedro"]);
    expect(team.coach).toEqual({ name: "Leonardo Jardim", photo: "https://media/c2.png", nationality: "Portugal", age: 52 });
    expect(source.info().providers.map((p) => p.name)).toEqual(["football-data.org", "API-Football"]);
  });

  it("correção manual de técnico tem prioridade (data/coach-overrides.ts)", async () => {
    const enrichment: TeamEnrichment = { squad: async () => [], coaches: async () => [] };
    const source = createFootballDataSource({ fetchJson: footballDataFetch, now: () => NOW, enrichment });
    const team = (await source.getTeam("1780"))!;
    expect(team.coach?.name).toBe("Pedro Emanuel");
    expect(team.coach?.photo).toBeNull();
  });

  it("se a API-Football falhar, a página sai com o elenco da football-data.org", async () => {
    const enrichment: TeamEnrichment = {
      squad: () => Promise.reject(new Error("fora do ar")),
      coaches: () => Promise.reject(new Error("fora do ar")),
    };
    const source = createFootballDataSource({ fetchJson: footballDataFetch, now: () => NOW, enrichment });
    const team = (await source.getTeam("1783"))!;
    expect(team.squad.map((p) => p.name)).toEqual(["Agustín Rossi"]);
    expect(team.coach).toMatchObject({ name: "Leonardo Jardim", photo: null });
  });
});
