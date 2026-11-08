import { useState } from "react";
import { cn } from "../lib/cn";
import type { TeamSummary } from "../types";

interface TeamCrestProps {
  team: Pick<TeamSummary, "name" | "shortName" | "crest">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8 text-[10px]", px: 32 },
  md: { box: "h-12 w-12 text-xs", px: 48 },
  lg: { box: "h-20 w-20 text-lg", px: 80 },
};

/** Escudo do time (imagem da API) ou, sem imagem, a sigla num círculo. */
export default function TeamCrest({ team, size = "md", className }: TeamCrestProps) {
  const [failed, setFailed] = useState(false);
  const { box, px } = sizes[size];
  const alt = `Escudo do ${team.name}`;

  if (team.crest && !failed) {
    return (
      <img
        src={team.crest}
        alt={alt}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)} // imagem fora do ar → cai na sigla
        className={cn("shrink-0 object-contain", box, className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary-light font-display font-bold text-primary",
        box,
        className
      )}
    >
      <span aria-hidden="true">{team.shortName}</span>
    </span>
  );
}
