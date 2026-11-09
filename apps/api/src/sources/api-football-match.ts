import type {
  LineupPlayer,
  LineupPosition,
  MatchEvent,
  MatchEventType,
  MatchStat,
  MatchStatus,
  TeamLineup,
} from "../types.js";
import { normalize } from "../lib/text.js";

// Detalhes de partida da API-Football (/fixtures?id=X traz tudo numa requisição:
// eventos, escalações, estatísticas e notas). Funções puras: testadas sem rede.

interface AfTeamRef {
  id: number;
  name: string;
}

export interface AfFixtureSummary {
  fixture: { id: number; date: string; status: { short: string } };
  teams: { home: AfTeamRef; away: AfTeamRef };
}

interface AfLineupEntry {
  player: {
    id: number;
    name: string;
    number: number | null;
    pos: string | null;
    grid: string | null;
  };
}

interface AfPlayerStats {
  player: { id: number; name: string; photo: string | null };
  statistics: Array<{
    games?: { rating?: string | null };
    goals?: { total?: number | null; assists?: number | null };
    cards?: { yellow?: number | null; red?: number | null };
  }>;
}

export interface AfFixture {
  fixture: {
    id: number;
    referee: string | null;
    status: { short: string; elapsed: number | null; extra?: number | null };
  };
  teams: { home: AfTeamRef; away: AfTeamRef };
  goals: { home: number | null; away: number | null };
  score: { halftime: { home: number | null; away: number | null } };
  events?: Array<{
    time: { elapsed: number | null; extra: number | null };
    team: { id: number };
    player: { name: string | null };
    assist: { name: string | null };
    type: string;
    detail: string | null;
  }> | null;
  lineups?: Array<{
    team: { id: number };
    formation: string | null;
    coach: { name: string | null } | null;
    startXI: AfLineupEntry[];
    substitutes: AfLineupEntry[];
  }> | null;
  statistics?: Array<{
    team: { id: number };
    statistics: Array<{ type: string; value: number | string | null }>;
  }> | null;
  players?: Array<{ team: { id: number }; players: AfPlayerStats[] }> | null;
}

// ---- Encontrar a partida ----

/** "Atlético-MG" e "Atletico Mineiro" → comparação sem acento/pontuação. */
function sameTeamName(a: string, b: string) {
  const x = normalize(a).replace(/[^a-z0-9]/g, "");
  const y = normalize(b).replace(/[^a-z0-9]/g, "");
  return x.length > 2 && y.length > 2 && (x.includes(y) || y.includes(x));
}

/**
 * Acha, entre as partidas do dia na API-Football, a mesma partida da
 * football-data.org: pelo id ligado em data/team-links.ts e, sem ligação,
 * pelo nome dos dois times.
 */
export function findFixture(
  fixtures: AfFixtureSummary[],
  home: { afId?: number; name: string },
  away: { afId?: number; name: string }
): AfFixtureSummary | null {
  const byId = (side: AfTeamRef, team: { afId?: number }) =>
    team.afId !== undefined && side.id === team.afId;
  return (
    fixtures.find(
      (f) => byId(f.teams.home, home) && byId(f.teams.away, away)
    ) ??
    fixtures.find(
      (f) =>
        (byId(f.teams.home, home) ||
          sameTeamName(f.teams.home.name, home.name)) &&
        (byId(f.teams.away, away) || sameTeamName(f.teams.away.name, away.name))
    ) ??
    null
  );
}

// ---- Status ----

const LIVE = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"]);
const FINISHED = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

export function afStatus(short: string): MatchStatus | null {
  if (LIVE.has(short)) return "live";
  if (FINISHED.has(short)) return "finished";
  if (short === "NS" || short === "TBD") return "scheduled";
  return null; // adiado, suspenso, cancelado
}

const phases: Record<string, string> = {
  "1H": "1º tempo",
  HT: "Intervalo",
  "2H": "2º tempo",
  ET: "Prorrogação",
  BT: "Intervalo da prorrogação",
  P: "Pênaltis",
  INT: "Interrompido",
  FT: "Encerrado",
  AET: "Encerrado na prorrogação",
  PEN: "Encerrado nos pênaltis",
};

// ---- Estatísticas ----

/** Ordem e rótulos exibidos; o que a fonte não trouxer fica de fora. */
const statDefinitions: Array<{
  key: string;
  label: string;
  sources: string[];
  format: MatchStat["format"];
}> = [
  {
    key: "possession",
    label: "Posse de bola",
    sources: ["Ball Possession"],
    format: "percent",
  },
  {
    key: "xg",
    label: "Gols esperados (xG)",
    sources: ["expected_goals"],
    format: "decimal",
  },
  {
    key: "shots",
    label: "Finalizações",
    sources: ["Total Shots"],
    format: "number",
  },
  {
    key: "shotsOnTarget",
    label: "No alvo",
    sources: ["Shots on Goal"],
    format: "number",
  },
  {
    key: "passAccuracy",
    label: "Acerto no passe",
    sources: ["Passes %"],
    format: "percent",
  },
  {
    key: "passes",
    label: "Passes",
    sources: ["Total passes"],
    format: "number",
  },
  {
    key: "corners",
    label: "Escanteios",
    sources: ["Corner Kicks"],
    format: "number",
  },
  {
    key: "saves",
    label: "Defesas do goleiro",
    sources: ["Goalkeeper Saves"],
    format: "number",
  },
  { key: "fouls", label: "Faltas", sources: ["Fouls"], format: "number" },
  {
    key: "offsides",
    label: "Impedimentos",
    sources: ["Offsides"],
    format: "number",
  },
  {
    key: "yellowCards",
    label: "Cartões amarelos",
    sources: ["Yellow Cards"],
    format: "number",
  },
  {
    key: "redCards",
    label: "Cartões vermelhos",
    sources: ["Red Cards"],
    format: "number",
  },
];

/** "56%" → 56, "1.81" → 1.81, null → null. */
function parseStat(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const number =
    typeof value === "number"
      ? value
      : Number.parseFloat(value.replace("%", ""));
  return Number.isFinite(number) ? number : null;
}

function toStatistics(fixture: AfFixture): MatchStat[] {
  const byTeam = new Map(
    (fixture.statistics ?? []).map((entry) => [
      entry.team.id,
      new Map(entry.statistics.map((s) => [s.type, s.value])),
    ])
  );
  const home = byTeam.get(fixture.teams.home.id);
  const away = byTeam.get(fixture.teams.away.id);
  if (!home || !away) return [];

  // A API às vezes não traz "Passes %": calcula a partir de certos/total.
  for (const stats of [home, away]) {
    if (!stats.has("Passes %")) {
      const accurate = parseStat(stats.get("Passes accurate"));
      const total = parseStat(stats.get("Total passes"));
      if (accurate !== null && total)
        stats.set("Passes %", Math.round((accurate / total) * 100));
    }
  }

  return statDefinitions.flatMap((definition) => {
    const source = definition.sources.find(
      (name) => home.has(name) || away.has(name)
    );
    if (!source) return [];
    let homeValue = parseStat(home.get(source));
    let awayValue = parseStat(away.get(source));
    // Contagens: a API manda null para zero (ex.: nenhum cartão vermelho).
    if (definition.format === "number") {
      homeValue ??= 0;
      awayValue ??= 0;
    }
    if (homeValue === null && awayValue === null) return [];
    return [
      {
        key: definition.key,
        label: definition.label,
        home: homeValue,
        away: awayValue,
        format: definition.format,
      },
    ];
  });
}

// ---- Escalações ----

function toPosition(pos: string | null): LineupPosition | null {
  return pos === "G" || pos === "D" || pos === "M" || pos === "F" ? pos : null;
}

function toLineup(fixture: AfFixture, teamId: number): TeamLineup | null {
  const lineup = fixture.lineups?.find((l) => l.team.id === teamId);
  if (!lineup || lineup.startXI.length === 0) return null;
  const stats = new Map(
    (fixture.players?.find((p) => p.team.id === teamId)?.players ?? []).map(
      (p) => [p.player.id, p]
    )
  );

  const toPlayer = (
    { player }: AfLineupEntry,
    starter: boolean
  ): LineupPlayer => {
    const entry = stats.get(player.id);
    const s = entry?.statistics[0];
    const rating = parseStat(s?.games?.rating ?? null);
    return {
      id: `af-${player.id}`,
      name: player.name,
      number: player.number ?? null,
      position: toPosition(player.pos),
      grid: starter ? (player.grid ?? null) : null,
      rating: rating && rating > 0 ? Math.round(rating * 10) / 10 : null, // "0" = sem nota
      goals: s?.goals?.total ?? 0,
      assists: s?.goals?.assists ?? 0,
      yellowCards: s?.cards?.yellow ?? 0,
      redCards: s?.cards?.red ?? 0,
      photo: entry?.player.photo ?? null,
    };
  };

  return {
    formation: lineup.formation ?? null,
    coach: lineup.coach?.name ?? null,
    startXI: lineup.startXI.map((p) => toPlayer(p, true)),
    substitutes: lineup.substitutes.map((p) => toPlayer(p, false)),
  };
}

// ---- Eventos ----

function toEventType(
  type: string,
  detail: string | null
): MatchEventType | null {
  const d = (detail ?? "").toLowerCase();
  switch (type.toLowerCase()) {
    case "goal":
      if (d.includes("own")) return "own-goal";
      if (d.includes("missed")) return "missed-penalty";
      if (d.includes("penalty")) return "penalty";
      return "goal";
    case "card":
      return d.includes("yellow") && !d.includes("second")
        ? "yellow-card"
        : "red-card";
    case "subst":
      return "substitution";
    case "var":
      return "var";
    default:
      return null;
  }
}

const varDetails: Record<string, string> = {
  "Goal cancelled": "Gol anulado",
  "Goal Disallowed": "Gol anulado",
  "Penalty confirmed": "Pênalti confirmado",
  "Penalty cancelled": "Pênalti anulado",
  "Card upgrade": "Cartão alterado",
  "Goal confirmed": "Gol confirmado",
};

function toEvents(fixture: AfFixture): MatchEvent[] {
  return (fixture.events ?? [])
    .flatMap((event): MatchEvent[] => {
      const type = toEventType(event.type, event.detail);
      if (!type || event.time.elapsed === null) return [];
      const related =
        type === "var"
          ? (varDetails[event.detail ?? ""] ?? event.detail)
          : type === "goal" || type === "penalty" || type === "substitution"
            ? event.assist.name
            : null;
      return [
        {
          minute: event.time.elapsed,
          extra: event.time.extra ?? null,
          side: event.team.id === fixture.teams.home.id ? "home" : "away",
          type,
          player: event.player.name,
          related: related ?? null,
        },
      ];
    })
    .sort((a, b) => a.minute - b.minute || (a.extra ?? 0) - (b.extra ?? 0));
}

// ---- Tudo junto ----

export interface AfMatchDetails {
  status: MatchStatus | null;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  extraMinute: number | null;
  phase: string | null;
  halfTime: { home: number; away: number } | null;
  referee: string | null;
  statistics: MatchStat[];
  lineups: { home: TeamLineup; away: TeamLineup } | null;
  events: MatchEvent[];
}

/** "Wilton Pereira Sampaio, Brazil" → "Wilton Pereira Sampaio". */
function cleanReferee(name: string | null) {
  return name ? name.split(",")[0].trim() || null : null;
}

export function toAfMatchDetails(fixture: AfFixture): AfMatchDetails {
  const { short, elapsed, extra } = fixture.fixture.status;
  const status = afStatus(short);
  const ht = fixture.score.halftime;
  const home = toLineup(fixture, fixture.teams.home.id);
  const away = toLineup(fixture, fixture.teams.away.id);
  return {
    status,
    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,
    minute: status === "live" ? elapsed : null,
    extraMinute: status === "live" ? (extra ?? null) : null,
    phase: phases[short] ?? null,
    halfTime:
      ht.home !== null && ht.away !== null
        ? { home: ht.home, away: ht.away }
        : null,
    referee: cleanReferee(fixture.fixture.referee),
    statistics: toStatistics(fixture),
    lineups: home && away ? { home, away } : null,
    events: toEvents(fixture),
  };
}
