import { Link } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";
import { useLeague } from "../league/leagueContext";

/** "Premier League · 2026/27 · Trocar liga" no topo das telas que dependem da liga. */
export default function LeagueTag() {
  const { competition } = useLeague();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      {competition ? (
        <p className="flex items-center gap-2 font-medium text-ink">
          <img
            src={competition.emblem}
            alt=""
            width={24}
            height={24}
            className="logo-outline h-6 w-6 object-contain"
          />
          {competition.name}
          <span className="text-ink-muted">· {competition.season}</span>
        </p>
      ) : (
        <p className="text-ink-muted">Carregando liga…</p>
      )}
      <Link
        to="/ligas"
        className="inline-flex min-h-touch items-center gap-1 rounded-control font-medium text-primary underline-offset-2 hover:underline"
      >
        <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        Trocar liga
      </Link>
    </div>
  );
}
