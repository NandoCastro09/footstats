import { generatedTeamLinks } from "./team-links.generated.js";

/**
 * Ligação entre os ids da football-data.org (chave) e da API-Football, mais a
 * cidade (a football-data.org não informa). É o que permite mostrar fotos,
 * número da camisa e técnico com foto.
 *
 * - Brasileirão (abaixo): conferido à mão em 05/11/2026.
 * - Demais ligas: team-links.generated.ts, gerado por scripts/link-teams.mjs
 *   (rode "pnpm link-teams" na próxima temporada, quando os times mudarem).
 * As entradas deste arquivo têm prioridade sobre as geradas.
 */
const brasileiraoLinks: Record<string, { apiFootballId: number; city: string }> = {
  "1765": { apiFootballId: 124, city: "Rio de Janeiro (RJ)" }, // Fluminense
  "1766": { apiFootballId: 1062, city: "Belo Horizonte (MG)" }, // Atlético-MG
  "1767": { apiFootballId: 130, city: "Porto Alegre (RS)" }, // Grêmio
  "1768": { apiFootballId: 134, city: "Curitiba (PR)" }, // Athletico-PR
  "1769": { apiFootballId: 121, city: "São Paulo (SP)" }, // Palmeiras
  "1770": { apiFootballId: 120, city: "Rio de Janeiro (RJ)" }, // Botafogo
  "1771": { apiFootballId: 135, city: "Belo Horizonte (MG)" }, // Cruzeiro
  "1772": { apiFootballId: 132, city: "Chapecó (SC)" }, // Chapecoense
  "1776": { apiFootballId: 126, city: "São Paulo (SP)" }, // São Paulo
  "1777": { apiFootballId: 118, city: "Salvador (BA)" }, // Bahia
  "1779": { apiFootballId: 131, city: "São Paulo (SP)" }, // Corinthians
  "1780": { apiFootballId: 133, city: "Rio de Janeiro (RJ)" }, // Vasco
  "1782": { apiFootballId: 136, city: "Salvador (BA)" }, // Vitória
  "1783": { apiFootballId: 127, city: "Rio de Janeiro (RJ)" }, // Flamengo
  "4241": { apiFootballId: 147, city: "Curitiba (PR)" }, // Coritiba
  "4286": { apiFootballId: 794, city: "Bragança Paulista (SP)" }, // Bragantino
  "4287": { apiFootballId: 1198, city: "Belém (PA)" }, // Remo
  "4364": { apiFootballId: 7848, city: "Mirassol (SP)" }, // Mirassol
  "6684": { apiFootballId: 119, city: "Porto Alegre (RS)" }, // Internacional
  "6685": { apiFootballId: 128, city: "Santos (SP)" }, // Santos
};

export const teamLinks: Record<string, { apiFootballId: number; city: string }> = {
  ...generatedTeamLinks,
  ...brasileiraoLinks,
};
