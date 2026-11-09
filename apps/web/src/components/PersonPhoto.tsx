import { useState } from "react";
import { cn } from "../lib/cn";

interface PersonPhotoProps {
  name: string;
  photo: string | null;
  fallback?: string;
  fallbackLabel?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: { box: "h-11 w-11 text-base", px: 44 },
  sm: { box: "h-[52px] w-[52px] text-lg", px: 52 },
  md: { box: "h-14 w-14 text-lg", px: 56 },
  lg: { box: "h-20 w-20 text-2xl", px: 80 },
  xl: { box: "h-[88px] w-[88px] text-3xl", px: 88 },
};

function initials(name: string) {
  const parts = name.replace(/\./g, " ").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

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
        className={cn("shrink-0 rounded-full border border-line-strong bg-surface-raised object-cover", box, className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={fallbackLabel ?? `Iniciais de ${name}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-solid font-display font-bold text-ink-inverse",
        box,
        className
      )}
    >
      <span aria-hidden="true">{fallback ?? initials(name)}</span>
    </span>
  );
}
