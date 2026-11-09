import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronDown, ChevronUp, Crown, Shield, Swords } from "lucide-react";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LeagueTable from "../components/LeagueTable";
import PageHero, { SectionTitle } from "../components/PageHero";
import ScorersTable from "../components/ScorersTable";
import { SkeletonRegion } from "../components/Skeleton";
import { StandingsContentSkeleton, TableSkeleton } from "../components/skeletons/PageSkeletons";
import TeamCrest from "../components/TeamCrest";
import { useScorers, useStandings } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import LeagueTag from "../components/LeagueTag";
import { useLeague } from "../league/leagueContext";
import { cn } from "../lib/cn";
import { zonesFor } from "../lib/zones";
import type { Standing } from "../types";

function Highlight({
  icon,
  label,
  standing,
  value,
  featured = false,
  children,
}: {
  icon: ReactNode;
  label: string;
  standing: Standing;
  value: string;
  featured?: boolean;
  children?: ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-4 rounded-2xl border p-5",
        featured ? "border-lime bg-lime text-ink-inverse" : "border-line bg-surface text-ink"
      )}
    >
      <p
        className={cn(
          "flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em]",
          featured ? "text-ink-inverse" : "text-muted"
        )}
      >
        {icon}
        {label}
      </p>
      <div className="flex items-center gap-3">
        <TeamCrest team={standing.team} size="md" />
        <div className="min-w-0">
          <Link
            to={`/times/${standing.team.id}`}
            className={cn(
              "block truncate rounded-control font-display text-2xl font-bold uppercase leading-tight hover:underline",
              featured ? "text-ink-inverse" : "text-ink hover:text-lime"
            )}
          >
            {standing.team.name}
          </Link>
          <p className={cn("text-sm", featured ? "text-ink-inverse" : "text-ink-2")}>{value}</p>
        </div>
      </div>
      {children}
    </li>
  );
}

function highlights(standings: Standing[]) {
  const leader = standings.find((row) => row.position === 1) ?? standings[0];
  const bestAttack = standings.reduce((best, row) => (row.goalsFor > best.goalsFor ? row : best));
  const bestDefense = standings.reduce((best, row) =>
    row.goalsAgainst < best.goalsAgainst ? row : best
  );
  return { leader, bestAttack, bestDefense };
}

const PREVIEW = 10;

function LeagueScorers() {
  const { code, competition } = useLeague();
  const { data: scorers, isPending, isError, error, refetch, isFetching } = useScorers({ competition: code, limit: 100 });
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? scorers : scorers?.slice(0, PREVIEW);

  return (
    <section aria-labelledby="artilharia" className="space-y-5">
      <SectionTitle id="artilharia">Artilharia</SectionTitle>
      {isPending ? (
        <SkeletonRegion label="Carregando artilharia…">
          <TableSkeleton rows={8} form={false} />
        </SkeletonRegion>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} title="Não foi possível carregar a artilharia" />
      ) : scorers.length === 0 ? (
        <EmptyState title="Artilharia indisponível" description="Nenhum gol registrado ainda." />
      ) : (
        <>
          <div id="lista-artilharia">
            <ScorersTable scorers={visible ?? []} caption={`Artilharia: ${competition?.name ?? code} ${competition?.season ?? ""}`} />
          </div>
          {scorers.length > PREVIEW && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                aria-expanded={expanded}
                aria-controls="lista-artilharia"
                onClick={() => setExpanded((value) => !value)}
                icon={
                  expanded ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )
                }
              >
                {expanded ? "Mostrar só os 10 primeiros" : `Ver todos os ${scorers.length} artilheiros`}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function StandingsPage() {
  usePageTitle("Classificação");
  const { code, competition } = useLeague();
  const { data: standings, isPending, isError, error, refetch, isFetching } = useStandings(code);
  const iconClass = "h-4 w-4";

  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={`Tabela · ${competition ? `${competition.name} ${competition.season}` : "carregando liga"}`}
        title="Classificação"
        description="Pontos, saldo e a sequência dos últimos jogos de cada time. Clique no cabeçalho de uma coluna para ordenar."
      >
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="rounded-[14px] border border-line bg-surface p-1">
            <span className="inline-flex min-h-touch items-center rounded-[10px] bg-lime px-5 text-sm font-bold text-ink-inverse">
              Tabela geral
            </span>
          </p>
          <LeagueTag />
        </div>
      </PageHero>

      {isPending ? (
        <StandingsContentSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : standings.length === 0 ? (
        <EmptyState title="Classificação indisponível" description="Nenhum time cadastrado." />
      ) : (
        <>
          <section aria-labelledby="destaques">
            <h2 id="destaques" className="sr-only">
              Destaques
            </h2>
            {(() => {
              const { leader, bestAttack, bestDefense } = highlights(standings);
              const { danger } = zonesFor(code, standings.length);
              const byPosition = (position: number) => standings.find((row) => row.position === position);
              const lastSafe = danger && byPosition(danger.from - 1);
              const firstInDanger = danger && byPosition(danger.from);
              const gap = lastSafe && firstInDanger ? lastSafe.points - firstInDanger.points : null;
              return (
                <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                  <Highlight
                    featured
                    icon={<Crown className={iconClass} aria-hidden="true" />}
                    label="Líder"
                    standing={leader}
                    value={`${leader.points} pontos`}
                  />
                  <Highlight
                    icon={<Swords className={iconClass} aria-hidden="true" />}
                    label="Melhor ataque"
                    standing={bestAttack}
                    value={`${bestAttack.goalsFor} gols marcados`}
                  />
                  <Highlight
                    icon={<Shield className={iconClass} aria-hidden="true" />}
                    label="Melhor defesa"
                    standing={bestDefense}
                    value={`${bestDefense.goalsAgainst} gols sofridos`}
                  />
                  {danger && lastSafe && firstInDanger && gap !== null && (
                    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                        <AlertTriangle className={iconClass} aria-hidden="true" />
                        {danger.label}
                      </p>
                      <p className="font-display text-5xl font-bold leading-none tabular-nums text-alert-text">
                        {gap}
                        <span className="ml-2 font-sans text-base font-medium text-ink-2">
                          {gap === 1 ? "ponto" : "pontos"}
                        </span>
                      </p>
                      <p className="text-sm text-ink-2">
                        separam o {lastSafe.position}º ({lastSafe.team.name}) do {firstInDanger.position}º (
                        {firstInDanger.team.name}).
                      </p>
                    </li>
                  )}
                </ul>
              );
            })()}
          </section>

          <section aria-labelledby="tabela" className="space-y-5">
            <SectionTitle id="tabela">Tabela completa</SectionTitle>
            <LeagueTable
              standings={standings}
              competition={code}
              caption={`${competition?.name ?? code} ${competition?.season ?? ""}`}
            />
          </section>

          <LeagueScorers />
        </>
      )}
    </div>
  );
}
