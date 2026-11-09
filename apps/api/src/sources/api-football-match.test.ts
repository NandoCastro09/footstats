import { describe, expect, it, vi } from "vitest";
import {
  afStatus,
  findFixture,
  toAfMatchDetails,
  type AfFixture,
} from "./api-football-match.js";
import {
  createApiFootballEnrichment,
  inFreeDateWindow,
} from "./api-football.js";
import { createFootballDataSource, type FetchJson } from "./football-data.js";

// Resposta no formato real de /fixtures?id= (campos reduzidos).
const HOME = 127; // Flamengo na API-Football
const AWAY = 121; // Palmeiras

function lineupEntry(
  id: number,
  name: string,
  number: number,
  pos: string,
  grid: string | null
) {
  return { player: { id, name, number, pos, grid } };
}

const fixture: AfFixture = {
  fixture: {
    id: 999,
    referee: "Anderson Daronco, Brazil",
    status: { short: "2H", elapsed: 67, extra: null },
  },
  teams: {
    home: { id: HOME, name: "Flamengo" },
    away: { id: AWAY, name: "Palmeiras" },
  },
  goals: { home: 2, away: 1 },
  score: { halftime: { home: 1, away: 1 } },
  events: [
    {
      time: { elapsed: 67, extra: null },
      team: { id: HOME },
      player: { name: "Pedro" },
      assist: { name: "Arrascaeta" },
      type: "Goal",
      detail: "Normal Goal",
    },
    {
      time: { elapsed: 12, extra: null },
      team: { id: HOME },
      player: { name: "Pedro" },
      assist: { name: null },
      type: "Goal",
      detail: "Penalty",
    },
    {
      time: { elapsed: 41, extra: null },
      team: { id: AWAY },
      player: { name: "Vitor Roque" },
      assist: { name: null },
      type: "Goal",
      detail: "Normal Goal",
    },
    {
      time: { elapsed: 58, extra: null },
      team: { id: AWAY },
      player: { name: "Gómez" },
      assist: { name: null },
      type: "Card",
      detail: "Yellow Card",
    },
    {
      time: { elapsed: 62, extra: null },
      team: { id: HOME },
      player: { name: "Gerson" },
      assist: { name: "Allan" },
      type: "subst",
      detail: "Substitution 1",
    },
    {
      time: { elapsed: 45, extra: 2 },
      team: { id: AWAY },
      player: { name: "Raphael Veiga" },
      assist: { name: null },
      type: "Var",
      detail: "Goal cancelled",
    },
  ],
  lineups: [
    {
      team: { id: HOME },
      formation: "4-3-3",
      coach: { name: "Filipe Luís" },
      startXI: [
        lineupEntry(1, "Rossi", 1, "G", "1:1"),
        lineupEntry(9, "Pedro", 9, "F", "4:2"),
      ],
      substitutes: [lineupEntry(29, "Allan", 29, "M", null)],
    },
    {
      team: { id: AWAY },
      formation: "4-2-3-1",
      coach: { name: "Abel Ferreira" },
      startXI: [lineupEntry(21, "Weverton", 21, "G", "1:1")],
      substitutes: [],
    },
  ],
  statistics: [
    {
      team: { id: HOME },
      statistics: [
        { type: "Ball Possession", value: "56%" },
        { type: "expected_goals", value: "1.81" },
        { type: "Total Shots", value: 14 },
        { type: "Red Cards", value: null },
        { type: "Passes accurate", value: 400 },
        { type: "Total passes", value: 500 },
      ],
    },
    {
      team: { id: AWAY },
      statistics: [
        { type: "Ball Possession", value: "44%" },
        { type: "expected_goals", value: "0.92" },
        { type: "Total Shots", value: 9 },
        { type: "Red Cards", value: 1 },
        { type: "Passes accurate", value: 300 },
        { type: "Total passes", value: 400 },
      ],
    },
  ],
  players: [
    {
      team: { id: HOME },
      players: [
        {
          player: { id: 9, name: "Pedro", photo: "p9.png" },
          statistics: [
            {
              games: { rating: "8.9" },
              goals: { total: 2, assists: 0 },
              cards: { yellow: 0, red: 0 },
            },
          ],
        },
        {
          player: { id: 1, name: "Rossi", photo: null },
          statistics: [{ games: { rating: "0" } }],
        },
      ],
    },
  ],
};

describe("API-Football: detalhes da partida", () => {
  const details = toAfMatchDetails(fixture);

  it("status, minuto, fase, intervalo e árbitro", () => {
    expect(afStatus("HT")).toBe("live");
    expect(afStatus("PEN")).toBe("finished");
    expect(afStatus("PST")).toBeNull();
    expect(details).toMatchObject({
      status: "live",
      homeScore: 2,
      awayScore: 1,
      minute: 67,
      phase: "2º tempo",
      halfTime: { home: 1, away: 1 },
      referee: "Anderson Daronco",
    });
  });

  it("eventos em ordem, com tipo, lado e relacionado (assistência, quem entra, VAR)", () => {
    expect(details.events.map((e) => [e.minute, e.type, e.side])).toEqual([
      [12, "penalty", "home"],
      [41, "goal", "away"],
      [45, "var", "away"],
      [58, "yellow-card", "away"],
      [62, "substitution", "home"],
      [67, "goal", "home"],
    ]);
    expect(details.events.find((e) => e.type === "substitution")).toMatchObject(
      { player: "Gerson", related: "Allan" }
    );
    expect(details.events.find((e) => e.type === "var")).toMatchObject({
      extra: 2,
      related: "Gol anulado",
    });
    expect(details.events.at(-1)?.related).toBe("Arrascaeta");
  });

  it("estatísticas: porcentagem, xG decimal, null vira 0 em contagem, acerto de passe calculado", () => {
    const byKey = Object.fromEntries(details.statistics.map((s) => [s.key, s]));
    expect(byKey.possession).toMatchObject({
      home: 56,
      away: 44,
      format: "percent",
    });
    expect(byKey.xg).toMatchObject({
      home: 1.81,
      away: 0.92,
      format: "decimal",
    });
    expect(byKey.redCards).toMatchObject({ home: 0, away: 1 });
    expect(byKey.passAccuracy).toMatchObject({ home: 80, away: 75 });
    expect(byKey.corners).toBeUndefined(); // a fonte não mandou: fica de fora
  });

  it('escalações com esquema, técnico, grade e nota ("0" = sem nota)', () => {
    const home = details.lineups!.home;
    expect(home).toMatchObject({ formation: "4-3-3", coach: "Filipe Luís" });
    expect(home.startXI.find((p) => p.name === "Pedro")).toMatchObject({
      grid: "4:2",
      rating: 8.9,
      goals: 2,
      photo: "p9.png",
    });
    expect(home.startXI.find((p) => p.name === "Rossi")?.rating).toBeNull();
    expect(home.substitutes[0]).toMatchObject({ name: "Allan", grid: null });
  });

  it("acha a partida pelo id ligado e, sem ligação, pelo nome", () => {
    const list = [
      {
        fixture: { id: 1, date: "", status: { short: "NS" } },
        teams: {
          home: { id: 5, name: "Atletico Mineiro" },
          away: { id: 6, name: "Gremio" },
        },
      },
      {
        fixture: { id: 2, date: "", status: { short: "NS" } },
        teams: {
          home: { id: HOME, name: "Flamengo" },
          away: { id: AWAY, name: "Palmeiras" },
        },
      },
    ];
    expect(
      findFixture(list, { afId: HOME, name: "x" }, { afId: AWAY, name: "y" })
        ?.fixture.id
    ).toBe(2);
    expect(
      findFixture(list, { name: "Atlético Mineiro" }, { name: "Grêmio" })
        ?.fixture.id
    ).toBe(1);
    expect(findFixture(list, { name: "Santos" }, { name: "Bahia" })).toBeNull();
  });
});

describe("football-data.org + API-Football: getMatchDetails", () => {
  const NOW = Date.parse("2026-11-05T12:00:00Z");
  const fla = {
    id: 1783,
    name: "CR Flamengo",
    shortName: "Flamengo",
    tla: "FLA",
    crest: null,
  };
  const pal = {
    id: 1769,
    name: "SE Palmeiras",
    shortName: "Palmeiras",
    tla: "PAL",
    crest: null,
  };
  const fdMatch = (id: number, status: string, utcDate: string) => ({
    id,
    utcDate,
    status,
    matchday: 34,
    homeTeam: fla,
    awayTeam: pal,
    score: {
      fullTime: {
        home: status === "TIMED" ? null : 1,
        away: status === "TIMED" ? null : 1,
      },
    },
  });
  const fdFetch = (async (path: string) => {
    const id = Number(path.split("/").pop());
    if (id === 3) return fdMatch(3, "TIMED", "2026-11-09T19:00:00Z");
    if (id === 4) return fdMatch(4, "FINISHED", "2026-10-20T22:00:00Z"); // fora da janela de datas
    return fdMatch(id, "IN_PLAY", "2026-11-05T11:00:00Z");
  }) as FetchJson;

  function afFetch(fail = false) {
    return vi.fn(async (path: string) => {
      if (fail) throw new Error("API-Football: limite diário");
      if (path.startsWith("/fixtures?date=2026-11-05")) {
        return {
          response: [
            {
              fixture: {
                id: 999,
                date: "2026-11-05T11:00:00+00:00",
                status: { short: "2H" },
              },
              teams: fixture.teams,
            },
          ],
        };
      }
      if (path === "/fixtures/headtohead?h2h=127-121") {
        // Confrontos anteriores: só o da data da partida serve.
        return {
          response: [
            {
              fixture: {
                id: 500,
                date: "2026-05-02T19:00:00+00:00",
                status: { short: "FT" },
              },
              teams: fixture.teams,
            },
            {
              fixture: {
                id: 999,
                date: "2026-10-20T22:00:00+00:00",
                status: { short: "FT" },
              },
              teams: fixture.teams,
            },
          ],
        };
      }
      if (path === "/fixtures?id=999") return { response: [fixture] };
      throw new Error(`rota inesperada: ${path}`);
    }) as unknown as FetchJson & ReturnType<typeof vi.fn>;
  }

  function source(af: FetchJson) {
    return createFootballDataSource({
      fetchJson: fdFetch,
      now: () => NOW,
      competitions: ["BSA"],
      enrichment: createApiFootballEnrichment({
        fetchJson: af,
        now: () => NOW,
      }),
    });
  }

  it("usa placar e minuto da API-Football (mesma fonte dos eventos), com cache", async () => {
    const af = afFetch();
    const src = source(af);
    const details = await src.getMatchDetails("1");
    expect(details?.detailed).toBe(true);
    expect(details?.match).toMatchObject({
      homeScore: 2,
      awayScore: 1,
      minute: 67,
      status: "live",
    });
    expect(details?.lineups?.home.formation).toBe("4-3-3");
    await src.getMatchDetails("1");
    expect(af).toHaveBeenCalledTimes(2); // data + partida, só na primeira vez
  });

  it("partida antiga (fora de ontem–amanhã): acha pelo confronto direto e a data", async () => {
    const af = afFetch();
    const details = await source(af).getMatchDetails("4");
    expect(details?.detailed).toBe(true);
    expect(details?.lineups?.away.formation).toBe("4-2-3-1");
    expect(af.mock.calls.map(([path]) => path)).toEqual([
      "/fixtures/headtohead?h2h=127-121",
      "/fixtures?id=999",
    ]);
  });

  it("janela de datas do plano gratuito: ontem, hoje e amanhã (UTC)", () => {
    expect(
      ["2026-11-04", "2026-11-05", "2026-11-06"].every((d) =>
        inFreeDateWindow(d, NOW)
      )
    ).toBe(true);
    expect(inFreeDateWindow("2026-11-03", NOW)).toBe(false);
    expect(inFreeDateWindow("2026-11-07", NOW)).toBe(false);
  });

  it("API-Football falhou: devolve o básico com detailed=false, avisa e não dá erro", async () => {
    const onDetailsError = vi.fn();
    const details = await createFootballDataSource({
      fetchJson: fdFetch,
      now: () => NOW,
      competitions: ["BSA"],
      enrichment: createApiFootballEnrichment({
        fetchJson: afFetch(true),
        now: () => NOW,
      }),
      onDetailsError,
    }).getMatchDetails("1");
    expect(onDetailsError).toHaveBeenCalledOnce();
    expect(details).toMatchObject({
      detailed: false,
      lineups: null,
      events: [],
    });
    expect(details?.match.homeScore).toBe(1);
  });

  it("jogo daqui a dias: não gasta requisição da API-Football", async () => {
    const af = afFetch();
    const details = await source(af).getMatchDetails("3");
    expect(details).toMatchObject({ detailed: true, lineups: null });
    expect(af).not.toHaveBeenCalled();
  });
});
