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

export function formatKickoff(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}

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

export function formatDateTime(iso: string) {
  return dateTimeShortFormatter.format(new Date(iso));
}

export function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function formatMinute(minute: number, extra?: number | null) {
  return extra ? `${minute}+${extra}'` : `${minute}'`;
}

const decimalFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

export function formatStat(value: number | null, format: "number" | "percent" | "decimal") {
  if (value === null) return "—";
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "decimal") return decimalFormatter.format(value);
  return String(value);
}

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

export function formatLongKickoff(iso: string) {
  return longDateFormatter.format(new Date(iso));
}

const dayHeadingFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});

export function formatDayHeading(iso: string) {
  return dayHeadingFormatter.format(new Date(iso));
}

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

export function dayKey(iso: string) {
  return dayKeyFormatter.format(new Date(iso));
}

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatShortDate(iso: string) {
  return shortDateFormatter.format(new Date(iso));
}
