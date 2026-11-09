// Mantenha sincronizado com apps/api/src/lib/email.ts.

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
