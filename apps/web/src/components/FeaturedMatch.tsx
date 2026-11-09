import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import TeamCrest from "./TeamCrest";
import { LiveChip } from "./MatchCard";
import { formatShortDate, formatTime } from "../lib/format";
import type { Match, TeamSummary } from "../types";

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function countdown(kickoff: string, now: number) {
  const totalMinutes = Math.max(0, Math.floor((new Date(kickoff).getTime() - now) / 60_000));
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}

function Side({ team }: { team: TeamSummary }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
      <TeamCrest team={team} size="lg" className="h-[60px] w-[60px] sm:h-[76px] sm:w-[76px]" />
      <Link
        to={`/times/${team.id}`}
        className="line-clamp-2 max-w-full break-words rounded-control font-display text-xl font-bold uppercase leading-tight text-ink hover:text-lime hover:underline sm:text-[28px]"
      >
        {team.name}
      </Link>
    </div>
  );
}

export default function FeaturedMatch({ match }: { match: Match }) {
  const now = useNow();
  const live = match.status === "live";
  const { days, hours, minutes } = countdown(match.kickoff, now);
  const units = [
    { value: days, label: days === 1 ? "dia" : "dias" },
    { value: hours, label: "h" },
    { value: minutes, label: "min" },
  ];

  return (
    <section
      aria-labelledby="destaque-titulo"
      className="relative overflow-hidden rounded-panel border border-[#243027] bg-surface p-5 sm:p-7"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 text-lime opacity-[0.09]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <circle cx="100" cy="100" r="60" />
        <circle cx="100" cy="100" r="4" fill="currentColor" />
        <line x1="100" y1="0" x2="100" y2="200" />
      </svg>

      <div className="relative flex items-center justify-between gap-3">
        <h2
          id="destaque-titulo"
          className="rounded-full bg-lime/[0.12] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-lime"
        >
          Jogo em destaque
        </h2>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Rodada {match.round}</span>
      </div>

      <div className="relative flex items-center gap-3 py-6 sm:gap-5">
        <Side team={match.homeTeam} />
        <div className="flex shrink-0 flex-col items-center gap-1 text-center">
          {live ? (
            <>
              <LiveChip minute={match.minute} />
              <p className="font-display text-[44px] font-bold leading-none tabular-nums text-lime">
                {match.homeScore} <span className="text-muted">–</span> {match.awayScore}
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-[44px] font-bold leading-none tabular-nums text-ink">
                {formatTime(match.kickoff)}
              </p>
              <p className="text-sm capitalize text-ink-2">{formatShortDate(match.kickoff)}</p>
            </>
          )}
        </div>
        <Side team={match.awayTeam} />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        {!live && (
          <div>
            <p className="sr-only">
              Começa em {days} {units[0].label}, {hours} horas e {minutes} minutos.
            </p>
            <ul aria-hidden="true" className="flex gap-2">
              {units.map((unit) => (
                <li
                  key={unit.label}
                  className="flex min-w-[58px] flex-col items-center rounded-[10px] border border-line bg-bg px-2 py-1.5"
                >
                  <span className="font-display text-2xl font-bold leading-none tabular-nums text-ink">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.1em] text-muted">{unit.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {match.venue && (
          <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {match.venue}
          </p>
        )}
      </div>

      <div className="relative mt-5 flex flex-wrap gap-3">
        {!live && (
          <Link
            to={`/palpites?partida=${match.id}`}
            className="inline-flex min-h-touch flex-1 items-center justify-center gap-2 rounded-full bg-lime px-5 font-semibold text-ink-inverse hover:bg-primary-solid-hover"
          >
            Fazer palpite
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
        <Link
          to={`/partidas/${match.id}`}
          className="inline-flex min-h-touch flex-1 items-center justify-center gap-2 rounded-full border border-line-strong px-5 font-semibold text-ink hover:border-lime"
        >
          Ver detalhes
          <span className="sr-only">
            {" "}
            de {match.homeTeam.name} contra {match.awayTeam.name}
          </span>
        </Link>
      </div>
    </section>
  );
}
