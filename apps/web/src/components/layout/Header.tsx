import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/cn";
import LeagueSelect from "./LeagueSelect";

const links = [
  { to: "/", label: "Partidas", end: true },
  { to: "/classificacao", label: "Classificação", end: false },
  { to: "/palpites", label: "Palpites", end: false },
  { to: "/ligas", label: "Ligas", end: false },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex min-h-touch items-center rounded-control px-3 font-medium text-white hover:bg-primary-dark",
    // Ativo: fundo + sublinhado (não depende só de cor).
    isActive && "bg-primary-dark underline decoration-2 underline-offset-8"
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="on-dark bg-primary text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex min-h-touch items-center gap-2 rounded-control font-display text-xl font-bold"
        >
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="#fff" />
            <path d="M16 9l5.5 4-2.1 6.5h-6.8L10.5 13z" fill="#2C2C2A" />
          </svg>
          FootStats
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          <LeagueSelect />
          <nav aria-label="Principal">
          <ul className="flex gap-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={navLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          </nav>
        </div>

        <button
          type="button"
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-control hover:bg-primary-dark lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
          <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        </button>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Principal (mobile)"
        className={cn("border-t border-white/20 lg:hidden", !open && "hidden")}
      >
        <LeagueSelect className="mx-auto max-w-6xl px-4 pt-3" />
        <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
