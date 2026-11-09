import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type MatchFilters, type ScorerFilters } from "../services/api";
import type { PredictionInput, PredictionUpdateInput } from "../types";

// Chaves do cache do React Query: mesma chave = mesmo dado em cache.
export const queryKeys = {
  matches: (filters: MatchFilters = {}) => ["matches", filters] as const,
  match: (id: string) => ["matches", "detail", id] as const,
  matchDetails: (id: string) => ["matches", "details", id] as const,
  competitions: ["competitions"] as const,
  standings: (competition: string) => ["standings", competition] as const,
  team: (id: string) => ["teams", id] as const,
  scorers: (filters: ScorerFilters) => ["scorers", filters] as const,
  predictions: ["predictions"] as const,
};

export function useMatches(filters: MatchFilters = {}) {
  return useQuery({
    queryKey: queryKeys.matches(filters),
    queryFn: () => api.matches.list(filters),
    placeholderData: (previous) => previous,
  });
}

export function useMatchDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.matchDetails(id),
    queryFn: () => api.matches.details(id),
    refetchInterval: (query) => (query.state.data?.match.status === "live" ? 60_000 : false),
  });
}

export function useCompetitions() {
  return useQuery({
    queryKey: queryKeys.competitions,
    queryFn: api.competitions.list,
    staleTime: 60 * 60_000,
  });
}

export function useStandings(competition: string) {
  return useQuery({
    queryKey: queryKeys.standings(competition),
    queryFn: () => api.standings.list(competition),
  });
}

export function useTeam(id: string) {
  return useQuery({ queryKey: queryKeys.team(id), queryFn: () => api.teams.get(id) });
}

export function useScorers(filters: ScorerFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scorers(filters),
    queryFn: () => api.scorers.list(filters),
    enabled,
  });
}

export function useDataSource() {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    select: (health) => health.dataSource,
    staleTime: 60_000,
    retry: false,
  });
}

export function usePredictions() {
  return useQuery({ queryKey: queryKeys.predictions, queryFn: api.predictions.list });
}

// Depois de criar/editar/excluir, invalida a lista de palpites para ela ser buscada de novo.
export function useCreatePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PredictionInput) => api.predictions.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.predictions }),
  });
}

export function useUpdatePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PredictionUpdateInput }) =>
      api.predictions.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.predictions }),
  });
}

export function useDeletePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.predictions.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.predictions }),
  });
}
