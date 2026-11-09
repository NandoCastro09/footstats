export type ZoneColor = "liberta" | "pre" | "sula" | "z4";

export interface Zone {
  color: ZoneColor;
  label: string;
  from: number;
  to: number;
}

export interface LeagueZones {
  zones: Zone[];
  dividers: number[];
  danger?: { label: string; from: number };
}

export const zoneSquare: Record<ZoneColor | "none", string> = {
  liberta: "bg-zone-liberta text-ink-inverse",
  pre: "bg-zone-pre text-ink-inverse",
  sula: "bg-zone-sula text-ink-inverse",
  z4: "bg-zone-z4 text-ink-inverse",
  none: "bg-[#1A221C] text-ink",
};

function european(teams: number, champions: number): LeagueZones {
  const relegation = teams - 2;
  return {
    zones: [
      { color: "liberta", label: "Champions League", from: 1, to: champions },
      { color: "pre", label: "Europa League", from: champions + 1, to: champions + 1 },
      { color: "sula", label: "Conference League", from: champions + 2, to: champions + 2 },
      { color: "z4", label: "Rebaixamento", from: relegation, to: teams },
    ],
    dividers: [champions, champions + 1, champions + 2, relegation - 1],
    danger: { label: "Briga contra o rebaixamento", from: relegation },
  };
}

export function zonesFor(competition: string, teams: number): LeagueZones {
  switch (competition) {
    case "BSA":
      return {
        zones: [
          { color: "liberta", label: "Libertadores", from: 1, to: 4 },
          { color: "pre", label: "Pré-Libertadores", from: 5, to: 6 },
          { color: "sula", label: "Sul-Americana", from: 7, to: 12 },
          { color: "z4", label: "Rebaixamento (Z4)", from: teams - 3, to: teams },
        ],
        dividers: [4, 6, 12, teams - 4],
        danger: { label: "Briga contra o Z4", from: teams - 3 },
      };
    case "CL":
      return {
        zones: [
          { color: "liberta", label: "Oitavas de final", from: 1, to: 8 },
          { color: "pre", label: "Playoff", from: 9, to: 24 },
          { color: "z4", label: "Eliminados", from: 25, to: teams },
        ],
        dividers: [8, 24],
        danger: { label: "Briga contra a eliminação", from: 25 },
      };
    case "ELC":
      return {
        zones: [
          { color: "liberta", label: "Acesso direto", from: 1, to: 2 },
          { color: "pre", label: "Playoff de acesso", from: 3, to: 6 },
          { color: "z4", label: "Rebaixamento", from: teams - 2, to: teams },
        ],
        dividers: [2, 6, teams - 3],
        danger: { label: "Briga contra o rebaixamento", from: teams - 2 },
      };
    case "FL1":
      return european(teams, 3);
    case "DED":
    case "PPL":
      return european(teams, 2);
    default:
      return european(teams, 4);
  }
}

export function zoneOf(position: number, zones: Zone[]) {
  return zones.find((zone) => position >= zone.from && position <= zone.to);
}
