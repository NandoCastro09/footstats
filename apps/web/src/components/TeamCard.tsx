import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Card from "./Card";
import TeamCrest from "./TeamCrest";
import { buttonBase, buttonSizes, buttonVariants } from "./styles";
import { cn } from "../lib/cn";
import type { Standing } from "../types";

interface TeamCardProps {
  standing: Standing;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-control bg-surface-subtle p-2">
      <dt className="text-xs uppercase text-ink-muted">{label}</dt>
      <dd className="font-display text-lg font-bold tabular-nums text-ink">
        {value}
      </dd>
    </div>
  );
}

export default function TeamCard({ standing }: TeamCardProps) {
  const { team, position, points, wins, draws, losses, goalsFor, goalsAgainst } =
    standing;

  return (
    <Card as="article" interactive className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <TeamCrest team={team} />
        <div>
          <h3 className="text-lg font-bold text-ink">{team.name}</h3>
          <p className="text-sm text-ink-muted">{position}º colocado</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <Stat label="Pontos" value={points} />
        <Stat label="V-E-D" value={`${wins}-${draws}-${losses}`} />
        <Stat label="Gols pró" value={goalsFor} />
        <Stat label="Gols contra" value={goalsAgainst} />
      </dl>

      <Link
        to={`/times/${team.id}`}
        className={cn(buttonBase, buttonVariants.secondary, buttonSizes.md)}
      >
        Ver detalhes<span className="sr-only"> do {team.name}</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
