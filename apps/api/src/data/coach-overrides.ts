/**
 * Correções manuais de técnico (chave: id do time na football-data.org).
 *
 * Nenhuma fonte gratuita acerta todos os técnicos: a football-data.org e a
 * API-Football erram times diferentes. Em 05/11/2026 e de novo em 08/11/2026
 * os 20 técnicos do Brasileirão foram comparados com a imprensa; os casos em
 * que as fontes estavam erradas ou desatualizadas ficam aqui. Para corrigir
 * outro time, acrescente uma linha com a fonte.
 */
export const coachOverrides: Record<string, { name: string; source: string }> = {
  // Vasco: Pedro Emanuel anunciado em 10/07/2026 (netvasco.com.br).
  "1780": { name: "Pedro Emanuel", source: "netvasco.com.br, 10/07/2026" },
  // Remo: Thiago Carpini anunciado em 16/09/2026 (clubedoremo.com.br).
  "4287": { name: "Thiago Carpini", source: "clubedoremo.com.br, 16/09/2026" },
  // Grêmio: Luís Castro demitido em 13/09/2026; Renato Gaúcho anunciado no dia
  // seguinte, com contrato até dezembro (tnh1.com.br, tribunadosertao.com.br).
  "1767": { name: "Renato Gaúcho", source: "tnh1.com.br, 14/09/2026" },
  // Corinthians: Fernando Diniz demitido em 07/10/2026; Clarence Seedorf
  // anunciado em 11/10/2026, contrato até dez/2027 (agenciabrasil.ebc.com.br).
  "1779": { name: "Clarence Seedorf", source: "agenciabrasil.ebc.com.br, 11/10/2026" },
  // Coritiba: Fernando Seabra demitido em 27/10/2026; o auxiliar Guilherme
  // "Guila" Bossle comanda como interino (umdoisesportes.com.br, 04/11/2026).
  "4241": { name: "Guilherme Bossle", source: "umdoisesportes.com.br, 04/11/2026 (interino)" },
};
