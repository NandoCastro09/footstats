import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCompetitions } from "../hooks/useApi";
import { DEFAULT_LEAGUE, LeagueContext, type LeagueContextValue } from "./leagueContext";

const STORAGE_KEY = "footstats:liga";

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // navegador sem localStorage (aba anônima): a liga fica só na URL
  }
}

export default function LeagueProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: competitions = [] } = useCompetitions();

  // Liga escolhida: ?liga= na URL (link compartilhado) > última escolha salva > Brasileirão.
  const fromUrl = params.get("liga")?.toUpperCase() ?? null;
  const requested = fromUrl ?? readStored() ?? DEFAULT_LEAGUE;
  const valid = competitions.length === 0 || competitions.some((c) => c.code === requested);
  const code = valid ? requested : DEFAULT_LEAGUE;

  useEffect(() => {
    if (fromUrl && valid) store(fromUrl);
  }, [fromUrl, valid]);

  const setLeague = useCallback(
    (next: string) => {
      store(next);
      if (pathname.startsWith("/times/")) {
        navigate(`/?liga=${next}`);
        return;
      }
      setParams(
        (current) => {
          const updated = new URLSearchParams(current);
          updated.set("liga", next);
          return updated;
        },
        { replace: true }
      );
    },
    [navigate, pathname, setParams]
  );

  const value = useMemo<LeagueContextValue>(
    () => ({
      code,
      competition: competitions.find((c) => c.code === code),
      competitions,
      setLeague,
    }),
    [code, competitions, setLeague]
  );

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
}
