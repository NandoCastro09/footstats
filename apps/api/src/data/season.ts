import type { MatchStatus } from "../types.js";
import { createRandom, poisson, type Random } from "../lib/random.js";
import { teams, teamsById, type TeamRecord } from "./teams.js";

export const CURRENT_ROUND = 33;
export const VISIBLE_ROUNDS = [32, 33, 34];

export interface MatchRecord {
  id: string;
  round: number;
  homeId: string;
  awayId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute: number | null;
  kickoff: Date;
}

function buildRounds(ids: string[]): Array<Array<[string, string]>> {
  const list = [...ids];
  const n = list.length;
  const firstLeg: Array<Array<[string, string]>> = [];

  for (let round = 0; round < n - 1; round++) {
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < n / 2; i++) {
      const a = list[i];
      const b = list[n - 1 - i];
      pairs.push((round + i) % 2 === 0 ? [a, b] : [b, a]);
    }
    firstLeg.push(pairs);
    list.splice(1, 0, list.pop()!);
  }

  const secondLeg = firstLeg.map((pairs) =>
    pairs.map(([home, away]) => [away, home] as [string, string])
  );
  return [...firstLeg, ...secondLeg];
}

function expectedGoals(attack: TeamRecord, defense: TeamRecord, home: boolean) {
  const base = home ? 1.45 : 1.1;
  return base * (attack.strength / defense.strength);
}

const SP_OFFSET_HOURS = 3;

function atSaoPaulo(now: Date, dayOffset: number, hour: number, minute = 0) {
  const sp = new Date(now.getTime() - SP_OFFSET_HOURS * 3_600_000);
  return new Date(
    Date.UTC(
      sp.getUTCFullYear(),
      sp.getUTCMonth(),
      sp.getUTCDate() + dayOffset,
      hour + SP_OFFSET_HOURS,
      minute
    )
  );
}

const slots: Array<[number, number, number]> = [
  [0, 16, 0], [0, 18, 30], [0, 21, 0],
  [1, 16, 0], [1, 16, 0], [1, 18, 30], [1, 18, 30], [1, 20, 30],
  [2, 20, 0], [2, 21, 30],
];

const LIVE_MINUTES = [23, 58, 81];

function simulateScore(random: Random, home: TeamRecord, away: TeamRecord, fraction = 1) {
  return {
    homeScore: poisson(random, expectedGoals(home, away, true) * fraction),
    awayScore: poisson(random, expectedGoals(away, home, false) * fraction),
  };
}

export function buildSeason(now = new Date()): MatchRecord[] {
  const random = createRandom(2026);
  const rounds = buildRounds(teams.map((team) => team.id));
  const matches: MatchRecord[] = [];

  rounds.forEach((pairs, roundIndex) => {
    const round = roundIndex + 1;
    const baseDay = (round - CURRENT_ROUND) * 7;

    pairs.forEach(([homeId, awayId], index) => {
      const home = teamsById.get(homeId)!;
      const away = teamsById.get(awayId)!;
      const [day, hour, minute] = slots[index];
      const match: MatchRecord = {
        id: `r${round}-${index + 1}`,
        round,
        homeId,
        awayId,
        homeScore: null,
        awayScore: null,
        status: "scheduled",
        minute: null,
        kickoff: atSaoPaulo(now, baseDay + day, hour, minute),
      };

      if (round < CURRENT_ROUND) {
        Object.assign(match, simulateScore(random, home, away), { status: "finished" });
      } else if (round === CURRENT_ROUND && index < LIVE_MINUTES.length) {
        const liveMinute = LIVE_MINUTES[index];
        Object.assign(match, simulateScore(random, home, away, liveMinute / 90), {
          status: "live",
          minute: liveMinute,
          kickoff: new Date(now.getTime() - liveMinute * 60_000),
        });
      }

      matches.push(match);
    });
  });

  return matches;
}

export const season = buildSeason();
export const seasonById = new Map(season.map((match) => [match.id, match]));
