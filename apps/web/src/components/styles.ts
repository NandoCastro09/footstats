// Classes compartilhadas entre componentes (ex.: um <Link> com cara de botão).

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "cta"
  | "danger"
  | "dangerGhost"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonBase =
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-raised disabled:text-ink-muted";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary-solid text-white hover:bg-primary-solid-hover",
  secondary:
    "border border-primary/60 bg-transparent text-primary hover:border-primary hover:bg-primary-light",
  // Coral para CTAs: usa o tom escuro (5.7:1 com branco), não o #E8734A.
  cta: "bg-live-strong text-white hover:bg-live-dark",
  danger: "bg-danger-solid text-white hover:bg-danger-solid-hover",
  dangerGhost: "text-danger hover:bg-danger-light",
  ghost: "text-primary hover:bg-primary-light",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 text-sm",
  md: "px-4 text-base",
  lg: "px-6 text-lg",
};

export const fieldBase =
  "min-h-touch w-full rounded-control border bg-surface-raised px-3 text-base text-ink placeholder:text-ink-muted disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-muted";

export function fieldState(hasError: boolean) {
  return hasError
    ? "border-2 border-danger"
    : "border-line-strong hover:border-primary";
}
