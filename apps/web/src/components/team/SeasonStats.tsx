import FormGuide from "../FormGuide";
import { SectionTitle } from "../PageHero";
import { useStandings } from "../../hooks/useApi";
import { cn } from "../../lib/cn";
import { formatGoalDifference } from "../../lib/format";
import { zoneOf, zonesFor } from "../../lib/zones";
import type { Standing } from "../../types";

const cardLabel = "text-xs font-bold uppercase tracking-[0.14em]";

function PositionCard({ standing, zone }: { standing: Standing; zone?: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl bg-lime p-6 text-ink-inverse">
      <p className={cardLabel}>Posição</p>
      <p className="font-display text-[96px] font-extrabold leading-[0.8] tabular-nums sm:text-[120px]">
        {standing.position}º
      </p>
      <p className="text-sm font-semibold">
        {standing.points} pontos · {zone ?? "Meio da tabela"}
      </p>
    </div>
  );
}

function CampaignCard({ standing }: { standing: Standing }) {
  const { wins, draws, losses, played } = standing;
  const parts = [
    { label: "V", name: "vitórias", value: wins, text: "text-lime", bar: "bg-lime" },
    { label: "E", name: "empates", value: draws, text: "text-ink", bar: "bg-surface-strong" },
    { label: "D", name: "derrotas", value: losses, text: "text-alert-text", bar: "bg-alert" },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
      <p className={cn(cardLabel, "text-muted")}>Campanha · {played} jogos</p>
      <dl className="grid grid-cols-3 gap-2">
        {parts.map((part) => (
          <div key={part.label} className="flex flex-col-reverse">
            <dt className="text-xs uppercase tracking-[0.1em] text-muted">{part.name}</dt>
            <dd className={cn("font-display text-5xl font-bold leading-none tabular-nums", part.text)}>{part.value}</dd>
          </div>
        ))}
      </dl>
      <div
        role="img"
        aria-label={`${wins} vitórias, ${draws} empates e ${losses} derrotas em ${played} jogos`}
        className="mt-auto flex h-3 gap-1 overflow-hidden rounded-full"
      >
        {parts.map((part) =>
          part.value > 0 ? <span key={part.label} className={part.bar} style={{ flex: part.value }} /> : null
        )}
      </div>
    </div>
  );
}

function EfficiencyCard({ standing }: { standing: Standing }) {
  const possible = standing.played * 3;
  const pct = possible ? Math.round((standing.points / possible) * 100) : 0;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
      <p className={cn(cardLabel, "text-muted")}>Aproveitamento</p>
      <div className="flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#1E2721" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#C8F135"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            />
          </svg>
          <p className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold tabular-nums text-ink">
            {pct}%
          </p>
        </div>
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-ink">{standing.points}</span> de{" "}
          <span className="font-semibold text-ink">{possible}</span> pontos disputados
        </p>
      </div>
    </div>
  );
}

function GoalsCard({ standing }: { standing: Standing }) {
  const { goalsFor, goalsAgainst, goalDifference } = standing;
  const max = Math.max(goalsFor, goalsAgainst, 1);
  const bars = [
    { label: "Marcados", value: goalsFor, color: "bg-lime" },
    { label: "Sofridos", value: goalsAgainst, color: "bg-alert" },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
      <p className={cn(cardLabel, "text-muted")}>Gols · saldo</p>
      <p
        className={cn(
          "font-display text-6xl font-bold leading-none tabular-nums",
          goalDifference > 0 ? "text-lime" : goalDifference < 0 ? "text-alert-text" : "text-ink"
        )}
      >
        {formatGoalDifference(goalDifference)}
      </p>
      <ul className="space-y-3">
        {bars.map((bar) => (
          <li key={bar.label}>
            <p className="flex justify-between text-sm">
              <span className="text-ink-2">Gols {bar.label.toLowerCase()}</span>
              <span className="font-semibold tabular-nums text-ink">{bar.value}</span>
            </p>
            <div className="mt-1 h-2.5 rounded-full bg-bg" aria-hidden="true">
              <div className={cn("h-full rounded-full", bar.color)} style={{ width: `${(bar.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useZoneLabel(standing: Standing, competition: string | null) {
  const { data: standings } = useStandings(competition ?? "");
  if (!competition) return undefined;
  const { zones } = zonesFor(competition, standings?.length ?? 20);
  return zoneOf(standing.position, zones)?.label;
}

function SeasonCards({ standing, competition }: { standing: Standing; competition: string }) {
  const zone = useZoneLabel(standing, competition);
  return <Cards standing={standing} zone={zone} />;
}

function Cards({ standing, zone }: { standing: Standing; zone?: string }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
      <PositionCard standing={standing} zone={zone} />
      <CampaignCard standing={standing} />
      <EfficiencyCard standing={standing} />
      <GoalsCard standing={standing} />
    </div>
  );
}

export default function SeasonStats({ standing, competition }: { standing: Standing; competition: string | null }) {
  return (
    <section id="temporada" aria-labelledby="temporada-titulo" className="scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle id="temporada-titulo">Desempenho na temporada</SectionTitle>
        <div className="flex items-center gap-3 text-sm text-muted">
          Últimos 5
          <FormGuide form={standing.form} size="lg" markLatest />
        </div>
      </div>
      {competition ? <SeasonCards standing={standing} competition={competition} /> : <Cards standing={standing} />}
    </section>
  );
}
