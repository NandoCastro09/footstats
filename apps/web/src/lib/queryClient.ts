import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { ApiError } from "../services/api";
import { getDemoSettings } from "../services/demoSettings";

const ONE_DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Precisa ser >= maxAge do persister, senão o dado salvo é descartado antes de ser restaurado.
      gcTime: ONE_DAY,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        error instanceof ApiError && error.status >= 400 && error.status < 500
          ? false
          : failureCount < 1,
    },
  },
});

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

// Guarda as respostas da API no navegador: quem volta ao site vê os dados na hora,
// enquanto a versão nova é buscada em segundo plano (útil quando a API está acordando).
export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: createSyncStoragePersister({ storage: safeStorage(), key: "footstats:cache" }),
  maxAge: ONE_DAY,
  // Muda a cada build e com o modo de simulação, para não restaurar dado antigo ou mascarar o erro simulado.
  buster: `${import.meta.env.VITE_BUILD_ID ?? "dev"}:${JSON.stringify(getDemoSettings())}`,
};
