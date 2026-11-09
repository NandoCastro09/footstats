import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { createApp, createOriginMatcher } from "./app.js";
import type { Match, MatchDetails, Prediction, Standing, Team } from "./types.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await createApp({
    env: {
      NODE_ENV: "test",
      PORT: 0,
      HOST: "127.0.0.1",
      CORS_ORIGIN: "http://localhost:5173",
      DATA_SOURCE: "mock",
      FOOTBALL_DATA_TOKEN: undefined,
    },
    logger: false,
  });
});
afterAll(() => app.close());
beforeEach(() => app.predictions.reset());

async function freeScheduledMatchId() {
  const seeds: Prediction[] = (await app.inject({ url: "/api/predictions" })).json().data;
  const taken = new Set(seeds.map((p) => p.matchId));
  const res = await app.inject({ url: "/api/matches?status=scheduled" });
  const matches: Match[] = res.json().data;
  return matches.find((m) => !taken.has(m.id))!.id;
}

const validBody = (matchId: string) => ({
  name: "Nando",
  email: "nando@example.com",
  matchId,
  homeGoals: 2,
  awayGoals: 1,
  comment: "Vai ser jogão",
});

describe("matches", () => {
  it("lista partidas das 3 rodadas visíveis", async () => {
    const res = await app.inject({ url: "/api/matches" });
    expect(res.statusCode).toBe(200);
    const data: Match[] = res.json().data;
    expect(data).toHaveLength(30);
    expect(data[0].status).toBe("live");
  });

  it("filtra por status", async () => {
    const res = await app.inject({ url: "/api/matches?status=live" });
    const data: Match[] = res.json().data;
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((m) => m.status === "live")).toBe(true);
  });

  it("busca sem acento e sem diferenciar maiúsculas", async () => {
    const res = await app.inject({ url: "/api/matches?search=GREMIO" });
    const data: Match[] = res.json().data;
    expect(data.length).toBeGreaterThan(0);
    expect(
      data.every((m) => [m.homeTeam.id, m.awayTeam.id].includes("gremio"))
    ).toBe(true);
  });

  it("400 com detalhe do campo para status inválido", async () => {
    const res = await app.inject({ url: "/api/matches?status=foo" });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      details: { status: expect.any(String) },
    });
  });

  it("404 para partida inexistente", async () => {
    const res = await app.inject({ url: "/api/matches/nao-existe" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ error: "NOT_FOUND", message: expect.any(String) });
  });});

describe("detalhes da partida", () => {
  async function details(status: Match["status"]) {
    const matches: Match[] = (await app.inject({ url: `/api/matches?status=${status}` })).json().data;
    const res = await app.inject({ url: `/api/matches/${matches[0].id}/details` });
    expect(res.statusCode).toBe(200);
    return res.json().data as MatchDetails;
  }

  const goalTypes = new Set(["goal", "penalty", "own-goal"]);

  it("encerrada: gols da lista somam o placar, com escalações e estatísticas", async () => {
    const data = await details("finished");
    const { match, events, lineups, statistics } = data;
    const count = (side: string) => events.filter((e) => e.side === side && goalTypes.has(e.type)).length;
    expect(count("home")).toBe(match.homeScore);
    expect(count("away")).toBe(match.awayScore);
    expect(lineups?.home.startXI).toHaveLength(11);
    expect(lineups?.away.startXI).toHaveLength(11);
    expect(lineups?.home.startXI.every((p) => p.grid)).toBe(true);
    const possession = statistics.find((s) => s.key === "possession")!;
    expect(possession.home! + possession.away!).toBe(100);
    expect(data.detailed).toBe(true);
  });

  it("ao vivo: nenhum evento depois do minuto atual", async () => {
    const data = await details("live");
    expect(data.events.every((e) => e.minute <= (data.match.minute ?? 0))).toBe(true);
    expect(data.phase).toMatch(/tempo/);
  });

  it("mock coerente em todas as partidas: sem 2 amarelos sem vermelho, expulso não volta a aparecer", async () => {
    const matches: Match[] = (await app.inject({ url: "/api/matches" })).json().data;
    for (const m of matches.filter((x) => x.status !== "scheduled")) {
      const { events }: MatchDetails = (await app.inject({ url: `/api/matches/${m.id}/details` })).json().data;
      const yellows = events.filter((e) => e.type === "yellow-card").map((e) => `${e.side}:${e.player}`);
      expect(new Set(yellows).size).toBe(yellows.length);
      for (const red of events.filter((e) => e.type === "red-card")) {
        const later = events.filter(
          (e) => e.minute > red.minute && e.side === red.side && (e.player === red.player || e.related === red.player)
        );
        expect(later).toEqual([]);
      }
    }
  });

  it("agendada: sem escalação, eventos nem estatísticas", async () => {
    const data = await details("scheduled");
    expect(data.lineups).toBeNull();
    expect(data.events).toEqual([]);
    expect(data.statistics).toEqual([]);
  });

  it("404 para partida inexistente", async () => {
    const res = await app.inject({ url: "/api/matches/nao-existe/details" });
    expect(res.statusCode).toBe(404);
  });
});

describe("standings e teams", () => {
  it("classificação consistente com 20 times", async () => {
    const res = await app.inject({ url: "/api/standings" });
    const data: Standing[] = res.json().data;
    expect(data).toHaveLength(20);
    for (const row of data) {
      expect(row.wins + row.draws + row.losses).toBe(row.played);
      expect(row.points).toBe(row.wins * 3 + row.draws);
      expect(row.goalDifference).toBe(row.goalsFor - row.goalsAgainst);
    }
    const totalWins = data.reduce((sum, r) => sum + r.wins, 0);
    const totalLosses = data.reduce((sum, r) => sum + r.losses, 0);
    expect(totalWins).toBe(totalLosses);
    expect(data.map((r) => r.position)).toEqual(data.map((_, i) => i + 1));
  });

  it("time com elenco e classificação", async () => {
    const res = await app.inject({ url: "/api/teams/gremio" });
    expect(res.statusCode).toBe(200);
    const team: Team = res.json().data;
    expect(team.name).toBe("Grêmio");
    expect(team.squad.length).toBe(18);
    expect(team.standing?.team.id).toBe("gremio");
  });

  it("404 para time inexistente", async () => {
    const res = await app.inject({ url: "/api/teams/xyz" });
    expect(res.statusCode).toBe(404);
  });
});

describe("competitions", () => {
  it("no modo mock só o Brasileirão está disponível", async () => {
    const res = await app.inject({ url: "/api/competitions" });
    expect(res.json().data).toEqual([expect.objectContaining({ code: "BSA", season: expect.any(String) })]);
  });

  it("aceita o código em minúsculas e recusa liga indisponível (404)", async () => {
    expect((await app.inject({ url: "/api/standings?competition=bsa" })).statusCode).toBe(200);
    const res = await app.inject({ url: "/api/matches?competition=PL" });
    expect(res.statusCode).toBe(404);
    expect(res.json().message).toContain("PL");
  });

  it("as partidas informam a liga", async () => {
    const [match] = (await app.inject({ url: "/api/matches" })).json().data;
    expect(match.competition).toBe("BSA");
  });
});

describe("scorers", () => {
  it("artilharia em ordem de gols, com filtro por time e limite", async () => {
    const all = (await app.inject({ url: "/api/scorers" })).json().data;
    expect(all.length).toBeGreaterThan(10);
    for (let i = 1; i < all.length; i++) expect(all[i - 1].goals).toBeGreaterThanOrEqual(all[i].goals);

    const team = all[0].team.id;
    const byTeam = (await app.inject({ url: `/api/scorers?team=${team}&limit=3` })).json().data;
    expect(byTeam.length).toBeLessThanOrEqual(3);
    expect(byTeam.every((s: { team: { id: string } }) => s.team.id === team)).toBe(true);
  });

  it("400 para limite inválido", async () => {
    const res = await app.inject({ url: "/api/scorers?limit=500" });
    expect(res.statusCode).toBe(400);
    expect(res.json().details.limit).toBeDefined();
  });

  it("time traz o técnico como objeto", async () => {
    const team = (await app.inject({ url: "/api/teams/gremio" })).json().data;
    expect(team.coach).toMatchObject({ name: expect.any(String), photo: null });
  });
});

describe("predictions CRUD", () => {
  it("GET lista os palpites iniciais com a partida embutida", async () => {
    const res = await app.inject({ url: "/api/predictions" });
    const data: Prediction[] = res.json().data;
    expect(data).toHaveLength(3);
    expect(data[0].match.id).toBe(data[0].matchId);
  });

  it("POST cria (201), PUT atualiza (200) e DELETE remove (204)", async () => {
    const matchId = await freeScheduledMatchId();

    const created = await app.inject({ method: "POST", url: "/api/predictions", payload: validBody(matchId) });
    expect(created.statusCode).toBe(201);
    const prediction: Prediction = created.json().data;
    expect(prediction.email).toBe("nando@example.com");

    const updated = await app.inject({
      method: "PUT",
      url: `/api/predictions/${prediction.id}`,
      payload: { ...validBody(matchId), homeGoals: 3 },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().data.homeGoals).toBe(3);

    const removed = await app.inject({ method: "DELETE", url: `/api/predictions/${prediction.id}` });
    expect(removed.statusCode).toBe(204);
    expect(removed.body).toBe("");

    const again = await app.inject({ method: "DELETE", url: `/api/predictions/${prediction.id}` });
    expect(again.statusCode).toBe(404);
  });

  it("400 com erros por campo", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/predictions",
      payload: { name: "", email: "invalido", matchId: "", homeGoals: -1, awayGoals: "dois" },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error).toBe("VALIDATION_ERROR");
    expect(Object.keys(body.details).sort()).toEqual(
      ["awayGoals", "email", "homeGoals", "matchId", "name"]
    );
    expect(body.details.name).toBe("Informe seu nome.");
  });

  it.each(["teste@gmail.comsadsadsad", "teste@gmail.co", "teste@.com", "a..b@example.com"])(
    "400 para e-mail inválido (%s)",
    async (email) => {
      const res = await app.inject({ url: "/api/matches?status=scheduled" });
      const [match] = res.json().data;
      const created = await app.inject({
        method: "POST",
        url: "/api/predictions",
        payload: { ...validBody(match?.id ?? "x"), email },
      });
      expect(created.statusCode).toBe(400);
      expect(created.json().details.email).toBe("Informe um e-mail válido.");
    }
  );

  it("400 ao palpitar em partida encerrada", async () => {
    const res = await app.inject({ url: "/api/matches?status=finished" });
    const finishedId = res.json().data[0].id;
    const created = await app.inject({ method: "POST", url: "/api/predictions", payload: validBody(finishedId) });
    expect(created.statusCode).toBe(400);
    expect(created.json().details.matchId).toBeDefined();
  });

  it("409 para palpite duplicado (mesmo e-mail e partida)", async () => {
    const [seed]: Prediction[] = (await app.inject({ url: "/api/predictions" })).json().data;
    const res = await app.inject({
      method: "POST",
      url: "/api/predictions",
      payload: { ...validBody(seed.matchId), email: seed.email.toUpperCase() },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("CONFLICT");
  });

  it("400 para JSON malformado", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/predictions",
      headers: { "content-type": "application/json" },
      payload: "{ invalido",
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("BAD_REQUEST");
  });

  it("404 ao atualizar palpite inexistente", async () => {
    const res = await app.inject({ method: "PUT", url: "/api/predictions/nao-existe", payload: validBody(await freeScheduledMatchId()) });
    expect(res.statusCode).toBe(404);
  });
});

describe("simulação e infraestrutura", () => {
  it("simula erro 500 via query", async () => {
    const res = await app.inject({ url: "/api/standings?simulateError=true" });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toMatchObject({ error: "INTERNAL_ERROR" });
  });

  it("simula status específico via header", async () => {
    const res = await app.inject({ url: "/api/matches", headers: { "x-simulate-error": "503" } });
    expect(res.statusCode).toBe(503);
  });

  it("simula latência", async () => {
    const start = Date.now();
    const res = await app.inject({ url: "/api/standings?delay=300" });
    expect(res.statusCode).toBe(200);
    expect(Date.now() - start).toBeGreaterThanOrEqual(290);
  });

  it("/health informa a fonte de dados", async () => {
    const res = await app.inject({ url: "/health" });
    expect(res.json().dataSource).toMatchObject({ name: "mock", fallback: false });
  });

  it("rota inexistente no formato padrão", async () => {
    const res = await app.inject({ url: "/api/nada" });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe("NOT_FOUND");
  });

  it("CORS libera só as origens configuradas", async () => {
    const ok = await app.inject({ url: "/api/standings", headers: { origin: "http://localhost:5173" } });
    expect(ok.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    const blocked = await app.inject({ url: "/api/standings", headers: { origin: "https://malicioso.com" } });
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("curinga de origem para previews da Vercel", () => {
    const matches = createOriginMatcher("http://localhost:5173, https://footstats-*.vercel.app");
    expect(matches("https://footstats-git-feat-api-nando.vercel.app")).toBe(true);
    expect(matches("https://footstats.evil.com")).toBe(false);
    expect(matches("https://footstats-x.vercel.app.evil.com")).toBe(false);
  });
});
