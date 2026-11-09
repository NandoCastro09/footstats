import { cn } from "../lib/cn";

interface LogoProps {
  /** Lado do ícone em px (padrão 34). */
  size?: number;
  /** "inverted": fundo escuro e desenho em lime (para fundos claros). */
  variant?: "default" | "inverted";
  /** Mostra o texto "FOOTSTATS" ao lado (é ele que dá o nome acessível). */
  withWordmark?: boolean;
  className?: string;
}

/**
 * Marca FootStats: 3 barras subindo + a bola no topo. SVG inline (sem request
 * extra) e decorativo: o nome acessível vem do texto ao lado ou do link que o envolve.
 */
export default function Logo({ size = 34, variant = "default", withWordmark = true, className }: LogoProps) {
  const bg = variant === "default" ? "#C8F135" : "#0A0D0B";
  const fg = variant === "default" ? "#0A0D0B" : "#C8F135";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 512 512" width={size} height={size} className="shrink-0" aria-hidden="true">
        <rect width="512" height="512" rx="120" fill={bg} />
        <rect x="104" y="296" width="76" height="112" rx="14" fill={fg} />
        <rect x="218" y="228" width="76" height="180" rx="14" fill={fg} />
        <rect x="332" y="196" width="76" height="212" rx="14" fill={fg} />
        <circle cx="370" cy="116" r="54" fill={fg} />
        <polygon points="370,94 391,109 383,134 357,134 349,109" fill={bg} />
      </svg>
      {withWordmark && (
        <span className="font-display text-[26px] font-extrabold uppercase leading-none tracking-wide text-ink">
          Foot<span className="text-lime">Stats</span>
        </span>
      )}
    </span>
  );
}
