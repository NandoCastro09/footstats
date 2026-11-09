import { Link, NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import LeagueSelect from "./LeagueSelect";
import { navLinks } from "./navLinks";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex min-h-touch items-center rounded-full px-4 text-sm font-semibold transition-colors",
    // Ativo: pílula preenchida (forma + cor), como os filtros do protótipo.
    isActive
      ? "bg-primary-solid text-white"
      : "text-ink-soft hover:bg-surface-raised hover:text-ink"
  );
}

/** Topo fixo. No mobile a navegação fica na barra inferior (BottomNav). */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-subtle/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
        <Link
          to="/"
          className="flex min-h-touch shrink-0 items-center gap-2 rounded-control font-display text-xl font-bold text-ink"
        >
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
            <circle cx="16" cy="16" r="13" fill="none" stroke="#5AA2E8" strokeWidth="2.5" />
            <path d="M16 9l5.5 4-2.1 6.5h-6.8L10.5 13z" fill="#9BD05C" />
          </svg>
          FootStats
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={navLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <LeagueSelect className="ml-auto min-w-0 max-w-xs flex-1 lg:flex-none" />
      </div>
    </header>
  );
}
