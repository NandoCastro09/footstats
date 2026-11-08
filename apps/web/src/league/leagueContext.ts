import { createContext, useContext } from "react";
import type { Competition } from "../types";

export const DEFAULT_LEAGUE = "BSA";

export interface LeagueContextValue {
  /** Código da liga selecionada (BSA, PL, PD...). */
  code: string;
  /** Dados da liga selecionada (undefined enquanto a lista carrega). */
  competition: Competition | undefined;
  competitions: Competition[];
  setLeague: (code: string) => void;
}

export const LeagueContext = createContext<LeagueContextValue | null>(null);

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) throw new Error("useLeague precisa estar dentro de <LeagueProvider>.");
  return context;
}
