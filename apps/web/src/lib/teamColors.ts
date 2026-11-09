/**
 * Cor principal dos clubes (a API não informa). Chave: id da football-data.org.
 * Times fora da lista usam a superfície padrão. Revisado em 09/11/2026.
 */
export const teamColors: Record<string, string> = {
  // Brasileirão
  "1765": "#7A0F2E", // Fluminense (grená)
  "1766": "#161616", // Atlético-MG
  "1767": "#0A6FA8", // Grêmio
  "1768": "#C8102E", // Athletico-PR
  "1769": "#006437", // Palmeiras
  "1770": "#161616", // Botafogo
  "1771": "#003DA5", // Cruzeiro
  "1772": "#00843D", // Chapecoense
  "1776": "#C8102E", // São Paulo
  "1777": "#005CA9", // Bahia
  "1779": "#161616", // Corinthians
  "1780": "#161616", // Vasco
  "1782": "#C8001A", // Vitória
  "1783": "#C4161C", // Flamengo
  "4241": "#00544D", // Coritiba
  "4286": "#D7002E", // Bragantino
  "4287": "#0A2463", // Remo
  "4364": "#F6D500", // Mirassol
  "6684": "#D9030E", // Internacional
  "6685": "#161616", // Santos
  // Europa
  "57": "#EF0107", // Arsenal
  "61": "#034694", // Chelsea
  "64": "#C8102E", // Liverpool
  "65": "#6CABDD", // Manchester City
  "66": "#DA291C", // Manchester United
  "73": "#132257", // Tottenham
  "78": "#CB3524", // Atlético de Madrid
  "81": "#A50044", // Barcelona
  "86": "#F4F6F1", // Real Madrid (branco)
  "5": "#DC052D", // Bayern
  "4": "#FDE100", // Borussia Dortmund
  "3": "#E32221", // Leverkusen
  "98": "#FB090B", // Milan
  "108": "#0068A8", // Inter
  "109": "#161616", // Juventus
  "113": "#12A0D7", // Napoli
  "524": "#004170", // PSG
  "503": "#00428C", // Porto
  "1903": "#E83030", // Benfica
  "498": "#008057", // Sporting
  "674": "#ED1C24", // PSV
  "678": "#D2122E", // Ajax
  "675": "#E30613", // Feyenoord
};

function luminance(hex: string) {
  const [r, g, b] = (hex.replace("#", "").match(/\w\w/g) ?? ["0", "0", "0"]).map((part) => {
    const v = parseInt(part, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export interface TeamTheme {
  /** Cor de fundo da faixa (null = usar a superfície padrão). */
  background: string | null;
  /** Texto escuro sobre cores claras (amarelo, azul-celeste, branco). */
  dark: boolean;
}

/** Cor da faixa do time e se o texto deve ser escuro (contraste ≥ 4.5:1). */
export function teamTheme(teamId: string): TeamTheme {
  const background = teamColors[teamId] ?? null;
  if (!background) return { background: null, dark: false };
  return { background, dark: contrast(background, "#FFFFFF") < 4.5 };
}
