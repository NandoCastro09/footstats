import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ShieldQuestion } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { TeamPageSkeleton } from "../components/skeletons/PageSkeletons";
import { buttonBase, buttonSizes, buttonVariants } from "../components/styles";
import SeasonStats from "../components/team/SeasonStats";
import Squad from "../components/team/Squad";
import TeamHeader from "../components/team/TeamHeader";
import TeamScorers from "../components/team/TeamScorers";
import { useTeam } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { useLeague } from "../league/leagueContext";
import { cn } from "../lib/cn";
import { ApiError } from "../services/api";

function Breadcrumb({ current }: { current?: string }) {
  return (
    <nav aria-label="Trilha">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        <li>
          <Link
            to="/classificacao"
            className="inline-flex min-h-touch items-center gap-1 rounded-control font-medium text-lime hover:underline"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Classificação
          </Link>
        </li>
        {current && (
          <li className="flex min-w-0 items-center gap-2 text-ink-2">
            <span aria-hidden="true" className="text-muted">
              /
            </span>
            <span aria-current="page" className="truncate">
              {current}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

function SectionTabs({ sections }: { sections: Array<{ id: string; label: string }> }) {
  const [active, setActive] = useState(sections[0]?.id);
  const ids = sections.map((section) => section.id).join(",");

  useEffect(() => {
    const elements = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -60% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav aria-label="Seções do time" className="border-b border-line">
      <ul className="flex gap-7 overflow-x-auto">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={() => setActive(section.id)}
              aria-current={active === section.id ? "location" : undefined}
              className={cn(
                "relative flex min-h-touch items-center whitespace-nowrap text-[15px] transition-colors",
                "after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-t-sm after:content-['']",
                active === section.id
                  ? "font-semibold text-ink after:bg-lime"
                  : "font-medium text-muted hover:text-ink"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function TeamPage() {
  const { id = "" } = useParams();
  const { data: team, isPending, isError, error, refetch, isFetching } = useTeam(id);
  const { competitions } = useLeague();
  usePageTitle(team?.fullName ?? (isError ? "Time não encontrado" : "Time"));

  if (isPending) {
    return <TeamPageSkeleton />;
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <h1 className="font-display text-5xl font-extrabold uppercase text-ink">
          {notFound ? "Time não encontrado" : "Time"}
        </h1>
        {notFound ? (
          <EmptyState
            icon={<ShieldQuestion className="h-10 w-10 text-muted" aria-hidden="true" />}
            title="Esse time não existe na liga"
            description={`Não encontramos nenhum time com o identificador "${id}".`}
            action={
              <Link to="/classificacao" className={cn(buttonBase, buttonVariants.primary, buttonSizes.md)}>
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

  const league = competitions.find((competition) => competition.code === team.competition);
  const sections = [
    team.standing && { id: "temporada", label: "Temporada" },
    team.competition && { id: "artilheiros", label: "Artilheiros" },
    { id: "elenco", label: "Elenco" },
  ].filter((section): section is { id: string; label: string } => Boolean(section));

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Breadcrumb current={team.name} />
        <TeamHeader team={team} competitionLabel={league ? `${league.name} ${league.season}` : undefined} />
      </div>

      <SectionTabs sections={sections} />

      {team.standing && <SeasonStats standing={team.standing} competition={team.competition} />}
      {team.competition && <TeamScorers teamId={team.id} competition={team.competition} squad={team.squad} />}
      <Squad squad={team.squad} />
    </div>
  );
}
