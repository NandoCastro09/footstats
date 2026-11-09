/**
 * Correções manuais de técnico (chave: id do time na football-data.org).
 *
 * Nenhuma fonte gratuita acerta todos os técnicos: a football-data.org e a
 * API-Football erram times diferentes. Em 05/11/2026 as duas foram comparadas
 * com a imprensa; os casos em que ambas estavam erradas ou desatualizadas
 * ficam aqui. Para corrigir outro time, acrescente uma linha com a fonte.
 */
export const coachOverrides: Record<string, { name: string; source: string }> = {
  // Vasco: Pedro Emanuel anunciado em 10/07/2026 (netvasco.com.br).
  "1780": { name: "Pedro Emanuel", source: "netvasco.com.br, 10/07/2026" },
  // Remo: Thiago Carpini anunciado em 16/09/2026 (clubedoremo.com.br).
  "4287": { name: "Thiago Carpini", source: "clubedoremo.com.br, 16/09/2026" },
  // Grêmio: Luís Castro demitido em 13/09/2026; Felipão assumiu como interino
  // (metropoles.com). Não achamos anúncio de técnico efetivo depois — CONFIRMAR.
  "1767": { name: "Luiz Felipe Scolari", source: "metropoles.com, 13/09/2026 (interino)" },
};
