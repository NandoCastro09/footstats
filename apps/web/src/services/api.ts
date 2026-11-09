import type {
  ApiErrorBody,
  Competition,
  DataSourceInfo,
  Match,
  MatchDetails,
  MatchStatus,
  Prediction,
  PredictionInput,
  Scorer,
  Standing,
  Team,
} from "../types";
import { demoHeaders } from "./demoSettings";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const fallbackMessages: Record<number, string> = {
  400: "Os dados enviados são inválidos.",
  404: "O recurso solicitado não foi encontrado.",
  409: "Conflito com dados já existentes.",
  500: "O servidor encontrou um erro. Tente novamente em instantes.",
  503: "O servidor está indisponível no momento. Tente novamente em instantes.",
};

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    "message" in value
  );
}

// Função única usada por todas as chamadas: monta a URL, coloca timeout de 15 s
// e transforma qualquer falha (rede, timeout, 4xx, 5xx) em ApiError com mensagem em português.
async function request<T>(path: string, init: RequestInit = {}, unwrap = true): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...demoHeaders(),
  };
  if (init.body) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    throw new ApiError(
      0,
      timedOut ? "TIMEOUT" : "NETWORK_ERROR",
      timedOut
        ? "O servidor demorou para responder. Se ele estava em repouso, pode levar até 1 minuto para iniciar. Tente novamente."
        : "Não foi possível conectar ao servidor. Verifique sua conexão."
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) return undefined as T;

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // A nossa API sempre responde erro como { error, message, details }.
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error, body.message, body.details);
    }
    throw new ApiError(
      response.status,
      "HTTP_ERROR",
      fallbackMessages[response.status] ?? `Erro inesperado (${response.status}).`
    );
  }

  return unwrap ? (body as { data: T }).data : (body as T);
}

function toQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export interface MatchFilters {
  competition?: string;
  status?: MatchStatus;
  search?: string;
}

export interface ScorerFilters {
  competition: string;
  team?: string;
  limit?: number;
}

export const api = {
  health: () => request<{ status: string; dataSource: DataSourceInfo }>("/health", {}, false),
  matches: {
    list: (filters: MatchFilters = {}) =>
      request<Match[]>(`/api/matches${toQuery({ ...filters })}`),
    get: (id: string) => request<Match>(`/api/matches/${encodeURIComponent(id)}`),
    details: (id: string) =>
      request<MatchDetails>(`/api/matches/${encodeURIComponent(id)}/details`),
  },
  competitions: {
    list: () => request<Competition[]>("/api/competitions"),
  },
  standings: {
    list: (competition: string) => request<Standing[]>(`/api/standings${toQuery({ competition })}`),
  },
  scorers: {
    list: (filters: ScorerFilters) =>
      request<Scorer[]>(
        `/api/scorers${toQuery({
          competition: filters.competition,
          team: filters.team,
          limit: filters.limit ? String(filters.limit) : undefined,
        })}`
      ),
  },
  teams: {
    get: (id: string) => request<Team>(`/api/teams/${encodeURIComponent(id)}`),
  },
  predictions: {
    list: () => request<Prediction[]>("/api/predictions"),
    create: (input: PredictionInput) =>
      request<Prediction>("/api/predictions", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, input: PredictionInput) =>
      request<Prediction>(`/api/predictions/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    remove: (id: string) =>
      request<void>(`/api/predictions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },
};
