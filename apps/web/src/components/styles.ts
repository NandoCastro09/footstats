export type ButtonVariant =
  | "primary"
  | "secondary"
  | "cta"
  | "danger"
  | "dangerGhost"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonBase =
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-2 disabled:text-muted";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-lime text-ink-inverse hover:bg-primary-solid-hover",
  secondary: "border border-line-strong bg-transparent text-ink hover:border-lime",
  cta: "bg-live-strong text-white hover:bg-live-dark",
  danger: "bg-danger-solid text-white hover:bg-danger-solid-hover",
  dangerGhost: "text-alert-text hover:bg-danger-light",
  ghost: "text-lime hover:bg-primary-light",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 text-sm",
  md: "px-4 text-base",
  lg: "px-6 text-lg",
};

export const fieldBase =
  "min-h-12 w-full rounded-[10px] border bg-bg px-3.5 text-base text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";

export function fieldState(hasError: boolean) {
  return hasError
    ? "border-2 border-alert"
    : "border-line-field hover:border-lime";
}
