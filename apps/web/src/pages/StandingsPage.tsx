import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Crown, Goal, Shield, Swords } from "lucide-react";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LeagueTable from "../components/LeagueTable";
import ScorersTable from "../components/ScorersTable";
import Skeleton, { SkeletonGrid } from "../components/Skeleton";
import TeamCrest from "../components/TeamCrest";
import { useScorers, useStandings } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import LeagueTag from "../components/LeagueTag";
import { useLeague } from "../league/leagueContext";
import type { Standing } from "../types";

function Highlight({
  icon,
  label,
  standing,
  value,
}: {
  icon: ReactNode;
  label: string;
  standing: Standing;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <TeamCrest team={standing.team} />
      <div className="min-w-0">
        <p className="eyebrow flex items-center gap-1 text-white/80">
          {icon}
          {label}
        </p>
        <Link
          to={`/times/${standing.team.id}`}
          className="block truncate rounded-control font-display text-lg font-bold text-white hover:underline"
        >
          {standing.team.name}
        </Link>
        <p className="text-sm text-white/90">{value}</p>
      </div>
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

/** Artilharia do campeonato: 10 primeiros, com botão para ver todos. */
function LeagueScorers() {
  const { code, competition } = useLeague();
  const { data: scorers, isPending, isError, error, refetch, isFetching } = useScorers({ competition: code, limit: 100 });
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? scorers : scorers?.slice(0, PREVIEW);

  return (
    <section aria-labelledby="artilharia" className="space-y-4">
      <h2 id="artilharia" className="eyebrow flex items-center gap-2">
        <Goal className="h-4 w-4 text-success" aria-hidden="true" />
        Artilharia
      </h2>
      {isPending ? (
        <Skeleton className="h-72 rounded-card" />
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Classificação</h1>
        <p className="mt-1 text-ink-muted">
          Tabela e artilharia. Clique no cabeçalho de uma coluna para ordenar.
        </p>
        <div className="mt-2">
          <LeagueTag />
        </div>
      </header>

      {isPending ? (
        <div className="space-y-6">
          <SkeletonGrid count={3} itemClassName="h-24" label="Carregando classificação…" />
          <Skeleton className="h-96 rounded-card" />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : standings.length === 0 ? (
        <EmptyState title="Classificação indisponível" description="Nenhum time cadastrado." />
      ) : (
        <>
          {/* Faixa em degradê, como o cabeçalho de campeonato do protótipo. */}
          <section
            aria-labelledby="destaques"
            className="on-dark rounded-card bg-gradient-hero p-5 shadow-hero sm:p-6"
          >
            <h2 id="destaques" className="sr-only">
              Destaques
            </h2>
            {(() => {
              const { leader, bestAttack, bestDefense } = highlights(standings);
              const iconClass = "h-3.5 w-3.5";
              return (
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <Highlight
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
                </ul>
              );
            })()}
          </section>

          <section aria-labelledby="tabela">
            <h2 id="tabela" className="sr-only">
              Tabela completa
            </h2>
            <LeagueTable standings={standings} caption={`${competition?.name ?? code} ${competition?.season ?? ""}`} />
          </section>

          <LeagueScorers />
        </>
      )}
    </div>
  );
}
