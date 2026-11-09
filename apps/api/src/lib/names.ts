function tokens(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

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
