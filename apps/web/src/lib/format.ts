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

/** Minuto de jogo: 67 → "67'", 45 + 2 → "45+2'". */
export function formatMinute(minute: number, extra?: number | null) {
  return extra ? `${minute}+${extra}'` : `${minute}'`;
}

const decimalFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

/** Valor de estatística: 56 → "56%", 1.81 → "1,81", 14 → "14". */
export function formatStat(value: number | null, format: "number" | "percent" | "decimal") {
  if (value === null) return "—";
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "decimal") return decimalFormatter.format(value);
  return String(value);
}

/** Nota do jogador: 7.85 → "7,9". */
export function formatRating(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** Ex.: "sábado, 14 de novembro, 18:30" */
export function formatLongKickoff(iso: string) {
  return longDateFormatter.format(new Date(iso));
}
