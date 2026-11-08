import { useState } from "react";
import { cn } from "../lib/cn";

interface PersonPhotoProps {
  name: string;
  photo: string | null;
  /** Texto do círculo quando não há foto (número da camisa ou iniciais). */
  fallback?: string;
  /** Como o leitor de tela anuncia o círculo (ex.: "Camisa 9"). */
  fallbackLabel?: string;
  size?: "md" | "lg";
  className?: string;
}

const sizes = { md: { box: "h-14 w-14 text-lg", px: 56 }, lg: { box: "h-20 w-20 text-2xl", px: 80 } };

function initials(name: string) {
  const parts = name.replace(/\./g, " ").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Foto de jogador/técnico; se não houver (ou falhar), um círculo com número ou iniciais. */
export default function PersonPhoto({
  name,
  photo,
  fallback,
  fallbackLabel,
  size = "md",
  className,
}: PersonPhotoProps) {
  const [failed, setFailed] = useState(false);
  const { box, px } = sizes[size];

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={`Foto de ${name}`}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full border-2 border-primary-light bg-surface-subtle object-cover", box, className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={fallbackLabel ?? `Iniciais de ${name}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-white",
        box,
        className
      )}
    >
      <span aria-hidden="true">{fallback ?? initials(name)}</span>
    </span>
  );
}
