import { useState } from "react";
import EmptyState from "../EmptyState";
import { SectionTitle } from "../PageHero";
import PlayerCard from "../PlayerCard";
import SegmentedControl from "../SegmentedControl";
import type { Player, PlayerPosition } from "../../types";

type PositionFilter = PlayerPosition | "all";

const positions: Array<{ value: PlayerPosition; label: string; group: string }> = [
  { value: "Goleiro", label: "Goleiros", group: "Goleiros" },
  { value: "Defensor", label: "Defensores", group: "Defensores" },
  { value: "Meio-campo", label: "Meio-campistas", group: "Meio-campistas" },
  { value: "Atacante", label: "Atacantes", group: "Atacantes" },
];

function PlayerGrid({ players }: { players: Player[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3">
      {players.map((player) => (
        <li key={player.id}>
          <PlayerCard player={player} />
        </li>
      ))}
    </ul>
  );
}

export default function Squad({ squad }: { squad: Player[] }) {
  const [position, setPosition] = useState<PositionFilter>("all");
  const injured = squad.filter((player) => player.injured).length;
  const count = (value: PlayerPosition) => squad.filter((player) => player.position === value).length;
  const shown = position === "all" ? squad : squad.filter((player) => player.position === position);
  const groups = [
    ...positions.map((p) => ({ key: p.value, title: p.group, players: squad.filter((player) => player.position === p.value) })),
    { key: "none", title: "Sem posição informada", players: squad.filter((player) => player.position === null) },
  ].filter((group) => group.players.length > 0);

  return (
    <section id="elenco" aria-labelledby="elenco-titulo" className="scroll-mt-24 space-y-5">
      <div>
        <SectionTitle id="elenco-titulo">Elenco</SectionTitle>
        <p className="mt-2 text-sm text-muted">
          {squad.length} jogadores
          {injured > 0 && ` · ${injured} ${injured === 1 ? "lesionado" : "lesionados"}`}
        </p>
      </div>

      <SegmentedControl<PositionFilter>
        label="Filtrar por posição"
        value={position}
        onChange={setPosition}
        options={[
          { value: "all", label: "Todos", count: squad.length },
          ...positions.map((p) => ({ value: p.value, label: p.label, count: count(p.value) })),
        ]}
      />

      <p aria-live="polite" className="sr-only">
        {shown.length} jogadores exibidos
      </p>

      {shown.length === 0 ? (
        <EmptyState title="Nenhum jogador nessa posição" />
      ) : position !== "all" ? (
        <PlayerGrid players={shown} />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.key} className="space-y-3">
              <h3 className="flex items-center gap-4 text-[13px] font-bold uppercase tracking-[0.14em] text-lime">
                <span className="shrink-0">{group.title}</span>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
                <span className="shrink-0 font-sans font-medium normal-case tracking-normal text-muted">
                  {group.players.length} {group.players.length === 1 ? "jogador" : "jogadores"}
                </span>
              </h3>
              <PlayerGrid players={group.players} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
