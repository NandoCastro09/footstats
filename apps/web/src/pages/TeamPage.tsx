import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, Goal, MapPin, ShieldQuestion } from "lucide-react";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import FilterPills from "../components/FilterPills";
import FormGuide from "../components/FormGuide";
import PersonPhoto from "../components/PersonPhoto";
import PlayerCard from "../components/PlayerCard";
import ScorersTable from "../components/ScorersTable";
import Skeleton, { SkeletonGrid } from "../components/Skeleton";
import TeamCrest from "../components/TeamCrest";
import { buttonBase, buttonSizes, buttonVariants } from "../components/styles";
import { useScorers, useTeam } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { cn } from "../lib/cn";
import { formatGoalDifference } from "../lib/format";
import { ApiError } from "../services/api";
import type { Coach, PlayerPosition, Standing } from "../types";

type PositionFilter = PlayerPosition | "all";

const positionOptions: Array<{ value: PositionFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "Goleiro", label: "Goleiros" },
  { value: "Defensor", label: "Defensores" },
  { value: "Meio-campo", label: "Meio-campistas" },
  { value: "Atacante", label: "Atacantes" },
];

/** Técnico em "vidro" sobre o degradê do cabeçalho (texto branco: o cinza não teria contraste). */
function CoachCard({ coach }: { coach: Coach }) {
  const details = [coach.nationality, coach.age !== null && `${coach.age} anos`].filter(Boolean);
  return (
    <div className="flex items-center gap-3 self-start rounded-card border border-white/20 bg-white/10 p-4 sm:ml-auto">
      <PersonPhoto name={coach.name} photo={coach.photo} />
      <div>
        <p className="eyebrow text-white/80">Técnico</p>
        <p className="font-display text-lg font-bold text-white">{coach.name}</p>
        {details.length > 0 && <p className="text-sm text-white/80">{details.join(" · ")}</p>}
      </div>
    </div>
  );
}

/** Artilheiros do time na temporada (requisição própria: tem seus próprios estados). */
function TeamScorers({ teamId, competition }: { teamId: string; competition: string }) {
  const { data: scorers, isPending, isError, error, refetch, isFetching } = useScorers({ competition, team: teamId });

  return (
    <section aria-labelledby="artilheiros" className="space-y-4">
      <div>
        <h2 id="artilheiros" className="eyebrow flex items-center gap-2">
          <Goal className="h-4 w-4 text-success" aria-hidden="true" />
          Artilheiros do time
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Jogadores do time entre os 100 maiores artilheiros do campeonato.</p>
      </div>
      {isPending ? (
        <Skeleton className="h-48 rounded-card" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} title="Não foi possível carregar a artilharia" />
      ) : scorers.length === 0 ? (
        <EmptyState title="Nenhum artilheiro do time" description="Nenhum jogador do time está entre os 100 maiores artilheiros." />
      ) : (
        <ScorersTable scorers={scorers} caption="Artilheiros do time na temporada" showTeam={false} />
      )}
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/classificacao"
      className="inline-flex min-h-touch items-center gap-1 rounded-control font-medium text-primary hover:underline"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Voltar para a classificação
    </Link>
  );
}

function StatsGrid({ standing }: { standing: Standing }) {
  const efficiency = standing.played
    ? Math.round((standing.points / (standing.played * 3)) * 100)
    : 0;
  const diff = standing.goalDifference;
  // Cores de destaque do protótipo: azul para ataque/pontos, verde para aproveitamento.
  const stats: Array<{ label: string; value: string | number; tone?: string }> = [
    { label: "Posição", value: `${standing.position}º` },
    { label: "Pontos", value: standing.points, tone: "text-primary" },
    { label: "Jogos", value: standing.played },
    { label: "V-E-D", value: `${standing.wins}-${standing.draws}-${standing.losses}` },
    { label: "Gols pró", value: standing.goalsFor, tone: "text-primary" },
    { label: "Gols contra", value: standing.goalsAgainst },
    {
      label: "Saldo",
      value: formatGoalDifference(diff),
      tone: diff > 0 ? "text-success" : diff < 0 ? "text-danger" : undefined,
    },
    { label: "Aproveitamento", value: `${efficiency}%`, tone: "text-success" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} variant="stat" className="flex flex-col gap-2 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
            {stat.label}
          </dt>
          <dd className={cn("font-display text-3xl font-bold leading-none tabular-nums", stat.tone ?? "text-ink")}>
            {stat.value}
          </dd>
        </Card>
      ))}
    </dl>
  );
}

export default function TeamPage() {
  const { id = "" } = useParams();
  const { data: team, isPending, isError, error, refetch, isFetching } = useTeam(id);
  const [position, setPosition] = useState<PositionFilter>("all");
  usePageTitle(team?.fullName ?? (isError ? "Time não encontrado" : "Time"));

  if (isPending) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div role="status" aria-busy="true" className="flex items-center gap-4">
          <span className="sr-only">Carregando time…</span>
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <SkeletonGrid count={8} itemClassName="h-20" className="grid grid-cols-2 gap-3 sm:grid-cols-4" />
        <SkeletonGrid count={6} itemClassName="h-40" />
      </div>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="space-y-6">
        <BackLink />
        <h1 className="text-3xl font-bold text-ink">
          {notFound ? "Time não encontrado" : "Time"}
        </h1>
        {notFound ? (
          <EmptyState
            icon={<ShieldQuestion className="h-10 w-10 text-ink-muted" aria-hidden="true" />}
            title="Esse time não existe na liga"
            description={`Não encontramos nenhum time com o identificador "${id}".`}
            action={
              <Link
                to="/classificacao"
                className={cn(buttonBase, buttonVariants.primary, buttonSizes.md)}
              >
                Ver todos os times
              </Link>
            }
          />
        ) : (
          <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
        )}
      </div>
    );
  }

  const squad =
    position === "all" ? team.squad : team.squad.filter((player) => player.position === position);
  const injured = team.squad.filter((player) => player.injured).length;
  // Só mostra o que a fonte de dados informou.
  const iconClass = "h-4 w-4";
  const facts: Array<{ icon: ReactNode; text: string }> = [];
  if (team.city) facts.push({ icon: <MapPin className={iconClass} aria-hidden="true" />, text: team.city });
  if (team.stadium) facts.push({ icon: <Building2 className={iconClass} aria-hidden="true" />, text: team.stadium });
  if (team.founded) facts.push({ icon: <CalendarDays className={iconClass} aria-hidden="true" />, text: `Fundado em ${team.founded}` });

  return (
    <div className="space-y-8">
      <BackLink />

      {/* Hero em degradê azul, como a tela de time do protótipo. */}
      <header className="on-dark flex flex-col gap-4 rounded-card bg-gradient-hero p-5 shadow-hero sm:flex-row sm:flex-wrap sm:items-center sm:p-6">
        <TeamCrest team={team} size="lg" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">{team.fullName}</h1>
          {team.standing && (
            <p>
              <span className="inline-block rounded-md bg-white/15 px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                {team.standing.position}º · {team.standing.points} pts
              </span>
            </p>
          )}
          {facts.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
              {facts.map((fact) => (
                <li key={fact.text} className="flex items-center gap-1">
                  {fact.icon}
                  {fact.text}
                </li>
              ))}
            </ul>
          )}
        </div>
        {team.coach && <CoachCard coach={team.coach} />}
      </header>

      {team.standing && (
        <section aria-labelledby="desempenho" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="desempenho" className="eyebrow">
              Desempenho na temporada
            </h2>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              Últimos 5:
              <FormGuide form={team.standing.form} size="md" />
            </div>
          </div>
          <StatsGrid standing={team.standing} />
        </section>
      )}

      {team.competition && <TeamScorers teamId={team.id} competition={team.competition} />}

      <section aria-labelledby="elenco" className="space-y-4">
        <div>
          <h2 id="elenco" className="eyebrow">
            Elenco
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {team.squad.length} jogadores
            {injured > 0 && ` · ${injured} ${injured === 1 ? "lesionado" : "lesionados"}`}
          </p>
        </div>

        <FilterPills<PositionFilter>
          legend="Filtrar por posição"
          name="posicao"
          options={positionOptions}
          value={position}
          onChange={setPosition}
        />

        <p aria-live="polite" className="sr-only">
          {squad.length} jogadores exibidos
        </p>

        {squad.length === 0 ? (
          <EmptyState title="Nenhum jogador nessa posição" />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {squad.map((player) => (
              <li key={player.id}>
                <PlayerCard player={player} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
