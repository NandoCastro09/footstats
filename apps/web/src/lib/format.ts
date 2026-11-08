const TIME_ZONE = "America/Sao_Paulo";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** Ex.: "qua., 05/11, 19:00" */
export function formatKickoff(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}

/** Ex.: "19:00" */
export function formatTime(iso: string) {
  return timeFormatter.format(new Date(iso));
}

const dateTimeShortFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** Ex.: "03/11, 09:15" */
export function formatDateTime(iso: string) {
  return dateTimeShortFormatter.format(new Date(iso));
}

/** "ana.souza@example.com" → "an•••@example.com" (não expõe o e-mail na lista pública). */
export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}•••@${domain}`;
}

/** Saldo de gols com sinal: +5, 0, -3 */
export function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : String(value);
}
