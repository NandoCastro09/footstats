import type {
  LineupPlayer,
  LineupPosition,
  Match,
  MatchDetails,
  MatchEvent,
  MatchStat,
  Player,
  TeamLineup,
} from "../types.js";
import { createRandom, pick, randomInt, type Random } from "../lib/random.js";
import { squadsByTeam } from "./players.js";
import { teamsById } from "./teams.js";
import type { MatchRecord } from "./season.js";

type Side = "home" | "away";

const formations = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2"];
const referees = [
  "Anderson Daronco",
  "Raphael Claus",
  "Wilton Pereira Sampaio",
  "Ramon Abatti Abel",
  "Bráulio da Silva Machado",
  "Flávio Rodrigues de Souza",
];

const positionCode: Record<NonNullable<Player["position"]>, LineupPosition> = {
  Goleiro: "G",
  Defensor: "D",
  "Meio-campo": "M",
  Atacante: "F",
};

function seedOf(id: string) {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function toLineupPlayer(player: Player, grid: string | null): LineupPlayer {
  return {
    id: player.id,
    name: player.name,
    number: player.number,
    position: player.position ? positionCode[player.position] : null,
    grid,
    rating: null,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    photo: player.photo,
  };
}

function buildLineup(teamId: string, random: Random): TeamLineup {
  const squad = squadsByTeam.get(teamId) ?? [];
  const formation = pick(random, formations);
  const rows = formation.split("-").map(Number);
  const pool = {
    G: squad.filter((p) => p.position === "Goleiro"),
    D: squad.filter((p) => p.position === "Defensor"),
    M: squad.filter((p) => p.position === "Meio-campo"),
    F: squad.filter((p) => p.position === "Atacante"),
  };

  const startXI: LineupPlayer[] = [toLineupPlayer(pool.G[0], "1:1")];
  rows.forEach((count, index) => {
    const role = index === 0 ? "D" : index === rows.length - 1 ? "F" : "M";
    for (let col = 1; col <= count; col++) {
      const player = pool[role].shift();
      if (player) startXI.push(toLineupPlayer(player, `${index + 2}:${col}`));
    }
  });
  pool.G.shift();

  const starters = new Set(startXI.map((p) => p.id));
  return {
    formation,
    coach: teamsById.get(teamId)?.coach ?? null,
    startXI,
    substitutes: squad
      .filter((p) => !starters.has(p.id))
      .map((p) => toLineupPlayer(p, null)),
  };
}

const round1 = (value: number) => Math.round(value * 10) / 10;

export function buildMockDetails(
  record: MatchRecord,
  match: Match
): MatchDetails {
  const random = createRandom(seedOf(record.id));
  const referee = pick(random, referees);
  const base: MatchDetails = {
    match,
    phase: null,
    extraMinute: null,
    halfTime: null,
    referee,
    statistics: [],
    lineups: null,
    events: [],
    detailed: true,
  };
  if (record.status === "scheduled") return base; // escalação só sai perto do jogo

  const lineups = {
    home: buildLineup(record.homeId, random),
    away: buildLineup(record.awayId, random),
  };
  const end =
    record.status === "finished" ? 90 : Math.max(1, record.minute ?? 1);
  const events: MatchEvent[] = [];

  const entered = new Map<string, number>(); // id → minuto em que entrou
  const left = new Map<string, number>(); // id → minuto em que saiu
  if (end > 55) {
    for (const side of ["home", "away"] as Side[]) {
      const lineup = lineups[side];
      const bench = lineup.substitutes.filter((p) => p.position !== "G");
      const outfield = lineup.startXI.filter((p) => p.position !== "G");
      const count = randomInt(random, 2, 4);
      for (let i = 0; i < count && bench.length; i++) {
        const minute = randomInt(random, 55, Math.min(end, 85));
        const out = outfield.splice(
          randomInt(random, 0, outfield.length - 1),
          1
        )[0];
        const inn = bench.splice(randomInt(random, 0, bench.length - 1), 1)[0];
        left.set(out.id, minute);
        entered.set(inn.id, minute);
        events.push({
          minute,
          extra: null,
          side,
          type: "substitution",
          player: out.name,
          related: inn.name,
        });
      }
    }
  }

  const sentOff = new Map<string, number>(); // id → minuto da expulsão
  const onPitch = (side: Side, minute: number) =>
    [...lineups[side].startXI, ...lineups[side].substitutes].filter((p) => {
      const inAt = lineups[side].startXI.includes(p) ? 0 : entered.get(p.id);
      const outAt = Math.min(
        left.get(p.id) ?? Infinity,
        sentOff.get(p.id) ?? Infinity
      );
      return inAt !== undefined && inAt <= minute && minute < outAt;
    });

  const weight: Record<LineupPosition, number> = { G: 0, D: 0.6, M: 2, F: 4 };
  function weighted(players: LineupPlayer[]) {
    const total = players.reduce(
      (sum, p) => sum + weight[p.position ?? "M"],
      0
    );
    let roll = random() * total;
    for (const player of players) {
      roll -= weight[player.position ?? "M"];
      if (roll <= 0) return player;
    }
    return players[players.length - 1];
  }

  const cardMinutes = Array.from(
    { length: Math.round(randomInt(random, 2, 6) * (end / 90)) },
    () => randomInt(random, 5, end)
  ).sort((x, y) => x - y);
  for (const minute of cardMinutes) {
    const side: Side = random() < 0.5 ? "home" : "away";
    const player = pick(
      random,
      onPitch(side, minute).filter((p) => p.position !== "G")
    );
    if (!player) continue;
    const red =
      !left.has(player.id) && (player.yellowCards > 0 || random() < 0.06);
    if (!red && player.yellowCards > 0) continue;
    if (red) {
      player.redCards++;
      sentOff.set(player.id, minute);
    } else {
      player.yellowCards++;
    }
    events.push({
      minute,
      extra: null,
      side,
      type: red ? "red-card" : "yellow-card",
      player: player.name,
      related: null,
    });
  }

  const scores: Record<Side, number> = {
    home: record.homeScore ?? 0,
    away: record.awayScore ?? 0,
  };
  for (const side of ["home", "away"] as Side[]) {
    for (let i = 0; i < scores[side]; i++) {
      const minute = randomInt(random, 1, end);
      const players = onPitch(side, minute);
      const scorer = weighted(players);
      scorer.goals++;
      if (random() < 0.15) {
        events.push({
          minute,
          extra: null,
          side,
          type: "penalty",
          player: scorer.name,
          related: null,
        });
        continue;
      }
      const helpers = players.filter((p) => p !== scorer && p.position !== "G");
      const assist =
        random() < 0.7 && helpers.length ? pick(random, helpers) : null;
      if (assist) assist.assists++;
      events.push({
        minute,
        extra: null,
        side,
        type: "goal",
        player: scorer.name,
        related: assist?.name ?? null,
      });
    }
  }

  const winner: Side | null =
    scores.home > scores.away
      ? "home"
      : scores.away > scores.home
        ? "away"
        : null;
  for (const side of ["home", "away"] as Side[]) {
    const lineup = lineups[side];
    for (const player of [...lineup.startXI, ...lineup.substitutes]) {
      const played = lineup.startXI.includes(player) || entered.has(player.id);
      if (!played) continue;
      const value =
        6 +
        random() * 1.3 +
        player.goals +
        player.assists * 0.5 -
        player.yellowCards * 0.3 -
        player.redCards * 1.5 +
        (winner === side ? 0.3 : winner ? -0.2 : 0);
      player.rating = round1(Math.min(9.8, Math.max(5.2, value)));
    }
  }

  events.sort((a, b) => a.minute - b.minute);
  const goalsUntil = (side: Side, minute: number) =>
    events.filter(
      (e) =>
        e.side === side &&
        e.minute <= minute &&
        (e.type === "goal" || e.type === "penalty")
    ).length;

  const fraction = end / 90;
  const possession = randomInt(random, 38, 62);
  const sideStats = (side: Side, share: number) => {
    const goals = scores[side];
    const shots = goals * 2 + Math.round(randomInt(random, 4, 11) * fraction);
    const onTarget = Math.min(
      shots,
      goals + randomInt(random, 0, Math.max(1, Math.floor(shots / 3)))
    );
    const passes = Math.round(
      (share * 9 + randomInt(random, -30, 30)) * fraction
    );
    return {
      shots,
      onTarget,
      xg: round1(goals * 0.55 + shots * 0.07 + random() * 0.4),
      passes,
      passAccuracy: randomInt(random, 74, 90),
      corners: Math.round(randomInt(random, 1, 8) * fraction),
      fouls: Math.round(randomInt(random, 8, 17) * fraction),
      offsides: randomInt(random, 0, Math.ceil(3 * fraction)),
      yellow: events.filter((e) => e.side === side && e.type === "yellow-card")
        .length,
      red: events.filter((e) => e.side === side && e.type === "red-card")
        .length,
    };
  };
  const h = sideStats("home", possession);
  const a = sideStats("away", 100 - possession);
  const stat = (
    key: string,
    label: string,
    home: number,
    away: number,
    format: MatchStat["format"] = "number"
  ): MatchStat => ({
    key,
    label,
    home,
    away,
    format,
  });

  const live = record.status === "live";
  return {
    ...base,
    phase: live ? (end <= 45 ? "1º tempo" : "2º tempo") : "Encerrado",
    halfTime:
      end > 45
        ? { home: goalsUntil("home", 45), away: goalsUntil("away", 45) }
        : null,
    lineups,
    events,
    statistics: [
      stat(
        "possession",
        "Posse de bola",
        possession,
        100 - possession,
        "percent"
      ),
      stat("xg", "Gols esperados (xG)", h.xg, a.xg, "decimal"),
      stat("shots", "Finalizações", h.shots, a.shots),
      stat("shotsOnTarget", "No alvo", h.onTarget, a.onTarget),
      stat(
        "passAccuracy",
        "Acerto no passe",
        h.passAccuracy,
        a.passAccuracy,
        "percent"
      ),
      stat("passes", "Passes", h.passes, a.passes),
      stat("corners", "Escanteios", h.corners, a.corners),
      stat(
        "saves",
        "Defesas do goleiro",
        Math.max(0, a.onTarget - scores.away),
        Math.max(0, h.onTarget - scores.home)
      ),
      stat("fouls", "Faltas", h.fouls, a.fouls),
      stat("offsides", "Impedimentos", h.offsides, a.offsides),
      stat("yellowCards", "Cartões amarelos", h.yellow, a.yellow),
      stat("redCards", "Cartões vermelhos", h.red, a.red),
    ],
  };
}
