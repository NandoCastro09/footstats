import { describe, expect, it, vi } from "vitest";
import { createCache } from "../lib/cache.js";
import { withFallback } from "./fallback.js";
import {
  ageOn,
  createFootballDataSource,
  mapPosition,
  mapStatus,
  toSummary,
  type FdMatch,
  type FetchJson,
} from "./football-data.js";
import { createMockSource } from "./mock.js";
import type { DataSource } from "./types.js";

// Respostas falsas no formato da football-data.org v4 (nada vai para a rede).
const NOW = Date.parse("2026-11-05T12:00:00Z");
const fla = { id: 1783, name: "CR Flamengo", shortName: "Flamengo", tla: "FLA", crest: "https://crests.football-data.org/1783.png" };
const pal = { id: 1769, name: "SE Palmeiras", shortName: "Palmeiras", tla: "PAL", crest: "https://crests.football-data.org/1769.png" };

function match(id: number, status: string, matchday: number, utcDate: string, home = fla, away = pal, score: [number | null, number | null] = [null, null]): FdMatch {
  return {
    id,
    utcDate,
    status,
    matchday,
    homeTeam: home,
    awayTeam: away,
    score: { fullTime: { home: score[0], away: score[1] } },
    season: { currentMatchday: 34 },
  };
}

const responses: Record<string, unknown> = {
  "/competitions/BSA/matches": {
    matches: [
      match(1, "FINISHED", 10, "2026-05-01T20:00:00Z", fla, pal, [2, 0]), // rodada antiga: fora da lista
      match(2, "FINISHED", 33, "2026-10-29T20:00:00Z", pal, fla, [1, 1]),
      match(3, "IN_PLAY", 34, "2026-11-05T11:00:00Z", fla, pal, [1, 0]),
      match(4, "TIMED", 35, "2026-11-08T19:00:00Z"),
      match(5, "POSTPONED", 34, "2026-11-04T19:00:00Z"), // adiado: ignorado
      match(6, "TIMED", 21, "2026-11-07T19:00:00Z"), // remarcado para esta semana: aparece
    ],
  },
  "/competitions/BSA/standings": {
    standings: [
      {
        type: "TOTAL",
        table: [
          { position: 1, team: fla, playedGames: 34, won: 23, draw: 7, lost: 4, points: 76, goalsFor: 71, goalsAgainst: 29, goalDifference: 42 },
          { position: 2, team: pal, playedGames: 33, won: 21, draw: 7, lost: 5, points: 70, goalsFor: 60, goalsAgainst: 30, goalDifference: 30 },
        ],
      },
    ],
  },
  "/competitions/BSA/scorers?limit=100": {
    scorers: [
      { player: { id: 10, name: "Pedro Guilherme", nationality: "Brazil" }, team: fla, playedMatches: 34, goals: 20, assists: 7, penalties: null },
      { player: { id: 20, name: "Vitor Roque", nationality: "Brazil" }, team: pal, playedMatches: 30, goals: 14, assists: 3, penalties: 2 },
    ],
  },
  "/competitions/BSA/teams": {
    teams: [
      {
        ...fla,
        founded: 1895,
        venue: "Estadio Jornalista Mário Filho",
        runningCompetitions: [{ code: "CLI", type: "CUP" }, { code: "BSA", type: "LEAGUE" }],
        coach: { name: "Filipe Luís" },
        squad: [
          { id: 10, name: "Pedro", position: "Centre-Forward", dateOfBirth: "1997-06-20", nationality: "Brazil" },
          { id: 11, name: "Rossi", position: "Goalkeeper", dateOfBirth: "1995-11-10", nationality: "Argentina" },
          { id: 12, name: "Sem Posição", position: "", dateOfBirth: null, nationality: null },
        ],
      },
      { ...pal, founded: 1914, venue: "Allianz Parque", coach: null, squad: [] },
    ],
  },
};

function fakeFetch() {
  return vi.fn(async (path: string) => {
    // Time avulso: /teams/:id (como a API real; 404 se não existir).
    const teamId = path.match(/^\/teams\/(\d+)$/)?.[1];
    if (teamId) {
      const teams = (responses["/competitions/BSA/teams"] as { teams: Array<{ id: number }> }).teams;
      const team = teams.find((t) => String(t.id) === teamId);
      if (!team) throw new Error("football-data.org respondeu 404: Team not found");
      return structuredClone(team);
    }
    if (!(path in responses)) throw new Error(`rota inesperada: ${path}`);
    return structuredClone(responses[path]);
  }) as unknown as FetchJson & ReturnType<typeof vi.fn>;
}

describe("football-data.org: conversão", () => {
  it("mapeia status (adiados/cancelados ficam de fora)", () => {
    expect(mapStatus("TIMED")).toBe("scheduled");
    expect(mapStatus("IN_PLAY")).toBe("live");
    expect(mapStatus("PAUSED")).toBe("live");
    expect(mapStatus("FINISHED")).toBe("finished");
    expect(mapStatus("POSTPONED")).toBeNull();
  });

  it("mapeia posições detalhadas", () => {
    expect(mapPosition("Goalkeeper")).toBe("Goleiro");
    expect(mapPosition("Centre-Back")).toBe("Defensor");
    expect(mapPosition("Attacking Midfield")).toBe("Meio-campo");
    expect(mapPosition("Left Winger")).toBe("Atacante");
    expect(mapPosition("Offence")).toBe("Atacante");
    expect(mapPosition("")).toBeNull();
  });

  it("corrige nomes e siglas estranhos da fonte", () => {
    expect(toSummary({ id: 1766, name: "CA Mineiro", shortName: "Mineiro", tla: "CAM", crest: null }))
      .toMatchObject({ name: "Atlético-MG", shortName: "CAM" });
    expect(toSummary({ id: 4241, name: "Coritiba FBC", shortName: "Coritiba", tla: "COR", crest: null }))
      .toMatchObject({ name: "Coritiba", shortName: "CFC" });
  });

  it("usa o escudo atual da API-Football, salvo as exceções", () => {
    const fd = (id: number) => `https://crests.football-data.org/${id}.png`;
    // Athletico-PR: o da football-data.org é o escudo antigo (antes de 2018).
    expect(toSummary({ id: 1768, name: "CA Paranaense", shortName: "Athletico", tla: "CAP", crest: fd(1768) }).crest)
      .toBe("https://media.api-sports.io/football/teams/134.png");
    // Juventus está na lista de exceções: mantém o da football-data.org.
    expect(toSummary({ id: 109, name: "Juventus FC", shortName: "Juventus", tla: "JUV", crest: fd(109) }).crest)
      .toBe(fd(109));
    // Time sem ligação com a API-Football: mantém o da football-data.org.
    expect(toSummary({ id: 999999, name: "Time X", shortName: "X", tla: "XXX", crest: fd(999999) }).crest)
      .toBe(fd(999999));
  });

  it("calcula idade considerando o aniversário", () => {
    expect(ageOn("1997-06-20", NOW)).toBe(29);
    expect(ageOn("1995-11-10", NOW)).toBe(30);
    expect(ageOn(null, NOW)).toBeNull();
  });

  it("lista só as partidas em destaque, já no nosso formato", async () => {
    const source = createFootballDataSource({ fetchJson: fakeFetch(), now: () => NOW });
    const matches = await source.listMatches("BSA");
    expect(matches.map((m) => m.id).sort()).toEqual(["2", "3", "4", "6"]);

    const live = matches.find((m) => m.id === "3")!;
    expect(live).toMatchObject({
      status: "live",
      homeScore: 1,
      awayScore: 0,
      // Flamengo está ligado à API-Football (id 127): o escudo vem de lá.
      homeTeam: { id: "1783", name: "Flamengo", shortName: "FLA", crest: "https://media.api-sports.io/football/teams/127.png" },
      venue: "Estadio Jornalista Mário Filho", // vem do cadastro do time mandante
    });
    expect(matches.find((m) => m.id === "4")).toMatchObject({ homeScore: null, awayScore: null });
  });

  it("encontra qualquer partida da liga já carregada, sem nova requisição", async () => {
    const fetchJson = fakeFetch();
    const source = createFootballDataSource({ fetchJson, now: () => NOW });
    await source.listMatches("BSA");
    const calls = fetchJson.mock.calls.length;
    expect((await source.findMatch("1"))?.status).toBe("finished"); // rodada antiga, fora da lista
    expect(fetchJson.mock.calls.length).toBe(calls);
  });

  it("partida de liga não carregada: busca /matches/:id avulsa", async () => {
    const fetchJson = vi.fn(async (path: string) => {
      if (path === "/matches/777") return { ...match(777, "TIMED", 12, "2026-11-08T15:00:00Z"), competition: { code: "PL" } };
      throw new Error("football-data.org respondeu 404: Not found");
    }) as unknown as FetchJson;
    const source = createFootballDataSource({ fetchJson, now: () => NOW });
    expect(await source.findMatch("777")).toMatchObject({ id: "777", competition: "PL", status: "scheduled" });
    expect(await source.findMatch("999")).toBeNull();
  });

  it("classificação com a forma calculada a partir dos jogos", async () => {
    const source = createFootballDataSource({ fetchJson: fakeFetch(), now: () => NOW });
    const [first] = await source.listStandings("BSA");
    expect(first).toMatchObject({ position: 1, points: 76, team: { id: "1783" } });
    expect(first.form).toEqual(["W", "D"]); // 2x0 e 1x1 (o jogo ao vivo não conta)
  });

  it("time com elenco ordenado por posição e campos sem dado como null", async () => {
    const source = createFootballDataSource({ fetchJson: fakeFetch(), now: () => NOW });
    const team = (await source.getTeam("1783"))!;
    expect(team).toMatchObject({
      fullName: "CR Flamengo",
      stadium: "Estadio Jornalista Mário Filho",
      founded: 1895,
      city: "Rio de Janeiro (RJ)", // vem de data/team-links.ts
      coach: { name: "Filipe Luís", photo: null },
      standing: { position: 1 },
    });
    expect(team.squad.map((p) => p.name)).toEqual(["Rossi", "Pedro", "Sem Posição"]);
    expect(team.squad[0]).toMatchObject({ position: "Goleiro", nationality: "Argentina", goals: null, number: null, photo: null });
    expect(await source.getTeam("999")).toBeNull();
  });

  it("artilharia no nosso formato", async () => {
    const source = createFootballDataSource({ fetchJson: fakeFetch(), now: () => NOW });
    const [first] = await source.listScorers("BSA");
    expect(first).toMatchObject({
      player: { id: "10", name: "Pedro Guilherme", nationality: "Brasil" },
      team: { id: "1783", shortName: "FLA" },
      goals: 20,
      assists: 7,
      playedMatches: 34,
    });
  });

  it("usa o cache: várias chamadas, 1 requisição por recurso", async () => {
    const fetchJson = fakeFetch();
    const source = createFootballDataSource({ fetchJson, now: () => NOW });
    await source.listMatches("BSA");
    // Com a liga já carregada, o time sai do cache (não chama /teams/:id).
    await Promise.all([source.listMatches("BSA"), source.listStandings("BSA"), source.getTeam("1783")]);
    await source.listMatches("BSA");
    const paths = fetchJson.mock.calls.map((call) => call[0]);
    expect(paths.sort()).toEqual([
      "/competitions/BSA/matches",
      "/competitions/BSA/standings",
      "/competitions/BSA/teams",
    ]);
  });
});

describe("cache", () => {
  it("devolve o último valor bom quando a atualização falha", async () => {
    let time = 0;
    const cache = createCache(() => time);
    expect(await cache.get("k", 1000, async () => "v1")).toBe("v1");
    time = 5000; // venceu
    expect(await cache.get("k", 1000, async () => Promise.reject(new Error("fora do ar")))).toBe("v1");
  });

  it("sem valor anterior, repassa o erro", async () => {
    const cache = createCache();
    await expect(cache.get("k", 1000, async () => Promise.reject(new Error("x")))).rejects.toThrow("x");
  });
});

describe("reserva (fallback)", () => {
  const log = { warn: vi.fn(), info: vi.fn() };

  it("time avulso (link direto): busca /teams/:id e descobre a liga", async () => {
    const fetchJson = fakeFetch();
    const source = createFootballDataSource({ fetchJson, now: () => NOW });
    const team = (await source.getTeam("1783"))!;
    expect(team.competition).toBe("BSA"); // a liga, não a copa
    expect(fetchJson.mock.calls.map((c) => c[0])).toContain("/teams/1783");
  });

  it("id inválido não consulta a API nem liga o modo reserva", async () => {
    const fetchJson = fakeFetch();
    const source = createFootballDataSource({ fetchJson, now: () => NOW });
    expect(await source.getTeam("xyz")).toBeNull();
    expect(await source.findMatch("abc")).toBeNull();
    expect(fetchJson).not.toHaveBeenCalled();
  });

  it("lista as ligas oferecidas, com o rótulo da temporada", () => {
    const source = createFootballDataSource({ fetchJson: fakeFetch(), now: () => NOW });
    const list = source.listCompetitions();
    expect(list.find((c) => c.code === "BSA")?.season).toBe("2026");
    expect(list.find((c) => c.code === "PL")?.season).toBe("2026/27");
  });

  it("usa o mock quando a fonte principal falha e avisa no info()", async () => {
    const broken: DataSource = {
      ...createMockSource(),
      info: () => ({ name: "football-data", attribution: "x", providers: [], fallback: false }),
      listMatches: () => Promise.reject(new Error("429 Too Many Requests")),
    };
    const source = withFallback(broken, createMockSource(), log);
    const matches = await source.listMatches("BSA");
    expect(matches.length).toBeGreaterThan(0);
    expect(source.info()).toMatchObject({ name: "mock", fallback: true });
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it("em outras ligas não usa o mock: devolve 503 amigável", async () => {
    const broken: DataSource = {
      ...createMockSource(),
      listCompetitions: () => [{ code: "PL", name: "Premier League", country: "Inglaterra", emblem: "", season: "2026/27" }],
      listStandings: () => Promise.reject(new Error("football-data.org respondeu 429: Too many requests")),
    };
    const source = withFallback(broken, createMockSource(), log);
    await expect(source.listStandings("PL")).rejects.toMatchObject({
      statusCode: 503,
      code: "UPSTREAM_UNAVAILABLE",
      message: expect.stringContaining("Limite"),
    });
    expect(source.info().fallback).toBe(false);
  });

  it("volta para a fonte principal quando ela se recupera", async () => {
    let fail = true;
    const primary: DataSource = {
      ...createMockSource(),
      info: () => ({ name: "football-data", attribution: "x", providers: [], fallback: false }),
      listStandings: () => (fail ? Promise.reject(new Error("fora do ar")) : Promise.resolve([])),
    };
    const source = withFallback(primary, createMockSource(), log);
    await source.listStandings("BSA");
    expect(source.info().fallback).toBe(true);
    fail = false;
    expect(await source.listStandings("BSA")).toEqual([]);
    expect(source.info()).toMatchObject({ name: "football-data", fallback: false });
  });
});
