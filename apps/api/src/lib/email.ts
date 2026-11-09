// Mantenha sincronizado com apps/web/src/lib/email.ts.

const EMAIL_RE =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i;

// Provedores conhecidos: o que vem depois do nome precisa ser um sufixo real
// (com, com.br, co.uk, fr...). Barra erros como "gmail.comsadsad" ou "gmail.co".
const KNOWN_PROVIDERS = new Set([
  "gmail",
  "googlemail",
  "hotmail",
  "outlook",
  "live",
  "msn",
  "yahoo",
  "icloud",
  "me",
  "aol",
  "bol",
  "uol",
  "terra",
  "ig",
  "proton",
  "protonmail",
]);
const PROVIDER_SUFFIX_RE = /^(?:(?:com|net)(?:\.[a-z]{2})?|co\.[a-z]{2}|(?!co$)[a-z]{2})$/;

// Provedores que só existem em um domínio.
const EXACT_DOMAINS: Record<string, string[]> = {
  gmail: ["gmail.com"],
  googlemail: ["googlemail.com"],
  icloud: ["icloud.com"],
};

// Erros de digitação comuns ("gmial", "hotmai", "outlok"): até 1 letra trocada, faltando,
// sobrando ou invertida em relação a um provedor grande.
const TYPO_TARGETS = ["gmail", "hotmail", "outlook", "yahoo", "icloud"];
// Domínios reais parecidos com os de cima, que não podem virar sugestão.
const REAL_LOOKALIKES = new Set(["mail", "email", "ymail", "cloud"]);

function isOneEditAway(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const diff = [...a].flatMap((ch, i) => (ch === b[i] ? [] : [i]));
    if (diff.length === 1) return true;
    // Letras vizinhas invertidas: "gmial" → "gmail".
    const [i, j] = diff;
    return diff.length === 2 && j === i + 1 && a[i] === b[j] && a[j] === b[i];
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  for (let i = 0; i < long.length; i++) {
    if (long.slice(0, i) + long.slice(i + 1) === short) return true;
  }
  return false;
}

// "teste@gmial.com" → "teste@gmail.com"; null quando não parece erro de digitação.
export function suggestEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;
  const [provider, ...rest] = domain.split(".");
  if (KNOWN_PROVIDERS.has(provider) || REAL_LOOKALIKES.has(provider)) return null;
  const target = TYPO_TARGETS.find((name) => isOneEditAway(provider, name));
  if (!target) return null;
  const fixed = EXACT_DOMAINS[target]?.[0] ?? [target, ...rest].join(".");
  return `${local}@${fixed}`;
}

// "ana.souza@example.com" → "an•••@example.com"
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  return `${user.slice(0, 2)}•••@${domain}`;
}

export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return false;

  const [local, domain] = email.split("@");
  if (local.length > 64) return false;

  const [provider, ...rest] = domain.split(".");
  const exact = EXACT_DOMAINS[provider];
  if (exact) return exact.includes(domain);
  if (KNOWN_PROVIDERS.has(provider) && !PROVIDER_SUFFIX_RE.test(rest.join("."))) {
    return false;
  }
  return true;
}
