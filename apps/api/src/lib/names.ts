function tokens(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

/**
 * Compara nomes de pessoas escritos de jeitos diferentes por fontes diferentes:
 * "E. Domínguez" = "Eduardo Dominguez", "Ceni Rogerio" = "Rogério Ceni",
 * "Marcao" = "Marcão". Cada parte do nome mais curto precisa aparecer no mais
 * longo (iniciais valem pela primeira letra), e pelo menos uma parte inteira.
 */
export function samePerson(a: string, b: string) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.length === 0 || tb.length === 0) return false;
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];

  let fullMatches = 0;
  for (const part of short) {
    if (part.length === 1) {
      if (!long.some((other) => other.startsWith(part))) return false;
    } else if (long.includes(part)) {
      fullMatches++;
    } else {
      return false;
    }
  }
  return fullMatches > 0;
}
