import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import PersonPhoto from "../PersonPhoto";
import Skeleton from "../Skeleton";
import TeamCrest from "../TeamCrest";
import { useMatches } from "../../hooks/useApi";
import { cn } from "../../lib/cn";
import { formatShortDate, formatTime } from "../../lib/format";
import { teamTheme } from "../../lib/teamColors";
import type { Coach, Team } from "../../types";

function tone(dark: boolean, hasColor: boolean) {
  if (!hasColor) {
    return { text: "text-ink", soft: "text-ink-2", box: "border-line bg-bg", decor: "text-lime" };
  }
  return dark
    ? { text: "text-ink-inverse", soft: "text-ink-inverse", box: "border-black/15 bg-white/40", decor: "text-black" }
    : { text: "text-white", soft: "text-white", box: "border-white/[0.18] bg-black/[0.32]", decor: "text-white" };
}

function CoachBox({ coach, className, labelClass, softClass }: { coach: Coach; className: string; labelClass: string; softClass: string }) {
  const details = [coach.nationality, coach.age !== null && `${coach.age} anos`].filter(Boolean);
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border p-4", className)}>
      <PersonPhoto name={coach.name} photo={coach.photo} size="md" />
      <div className="min-w-0">
        <p className={cn("text-xs font-bold uppercase tracking-[0.14em]", labelClass)}>Técnico</p>
        <p className="truncate font-display text-2xl font-bold uppercase leading-tight">{coach.name}</p>
        {details.length > 0 && <p className={cn("text-sm", softClass)}>{details.join(" · ")}</p>}
      </div>
    </div>
  );
}

function NextMatchBox({ teamId, competition }: { teamId: string; competition: string }) {
  const { data: matches, isPending } = useMatches({ competition });
  if (isPending) return <Skeleton className="h-[88px] w-full rounded-2xl" />;
  const next = matches
    ?.filter(
      (match) =>
        match.status !== "finished" && (match.homeTeam.id === teamId || match.awayTeam.id === teamId)
    )
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0];
  if (!next) return null;

  const home = next.homeTeam.id === teamId;
  const opponent = home ? next.awayTeam : next.homeTeam;
  return (
    <Link
      to={`/partidas/${next.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-bg p-4 text-ink hover:border-lime"
    >
      <TeamCrest team={opponent} size="md" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime">
          {next.status === "live" ? "Jogando agora" : "Próximo jogo"}
        </p>
        <p className="truncate font-display text-2xl font-bold uppercase leading-tight group-hover:underline">
          <span aria-hidden="true">× </span>
          <span className="sr-only">Contra </span>
          {opponent.name}
        </p>
        <p className="text-sm text-ink-2 first-letter:uppercase">
          {formatShortDate(next.kickoff)}, {formatTime(next.kickoff)} · {home ? "em casa" : "fora"}
        </p>
      </div>
    </Link>
  );
}

interface TeamHeaderProps {
  team: Team;
  competitionLabel?: string;
}

export default function TeamHeader({ team, competitionLabel }: TeamHeaderProps) {
  const theme = teamTheme(team.id);
  const t = tone(theme.dark, theme.background !== null);
  const iconClass = "h-4 w-4 shrink-0";
  const facts: Array<{ icon: ReactNode; text: string }> = [];
  if (team.city) facts.push({ icon: <MapPin className={iconClass} aria-hidden="true" />, text: team.city });
  if (team.stadium) facts.push({ icon: <Building2 className={iconClass} aria-hidden="true" />, text: team.stadium });
  if (team.founded) facts.push({ icon: <CalendarDays className={iconClass} aria-hidden="true" />, text: `Fundado em ${team.founded}` });

  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 sm:p-9",
        theme.background === null && "border border-[#243027] bg-surface",
        t.text
      )}
      style={theme.background ? { backgroundColor: theme.background } : undefined}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className={cn("pointer-events-none absolute -right-24 -top-24 h-80 w-80 opacity-10", t.decor)}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <circle cx="100" cy="100" r="60" />
        <circle cx="100" cy="100" r="4" fill="currentColor" />
        <line x1="100" y1="0" x2="100" y2="200" />
      </svg>

      <div className="relative flex flex-wrap items-center gap-8">
        <div className="flex min-w-0 flex-[999_1_440px] flex-wrap items-center gap-6">
          <span className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <TeamCrest team={team} size="lg" />
          </span>
          <div className="min-w-0 flex-1 basis-64">
            {competitionLabel && (
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em]">{competitionLabel}</p>
            )}
            <h1 className="mt-2 break-words font-display text-[clamp(44px,8vw,104px)] font-extrabold uppercase leading-[0.85]">
              {team.fullName}
            </h1>
            {facts.length > 0 && (
              <ul className={cn("mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm", t.soft)}>
                {facts.map((fact) => (
                  <li key={fact.text} className="flex items-center gap-1.5">
                    {fact.icon}
                    {fact.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
          {team.coach && <CoachBox coach={team.coach} className={t.box} labelClass={t.text} softClass={t.soft} />}
          {team.competition && <NextMatchBox teamId={team.id} competition={team.competition} />}
        </div>
      </div>
    </header>
  );
}
