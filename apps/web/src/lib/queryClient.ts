import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../services/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Erro do cliente (4xx) não melhora tentando de novo; falha de rede/5xx tenta 1x.
      retry: (failureCount, error) =>
        error instanceof ApiError && error.status >= 400 && error.status < 500
          ? false
          : failureCount < 1,
    },
  },
});
