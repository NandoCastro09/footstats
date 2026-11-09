import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import { navLinks } from "./navLinks";

/** Barra de abas inferior do mobile (some a partir de `lg`, onde o Header mostra os links). */
export default function BottomNav() {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-subtle/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg px-1 pb-2 pt-1">
        {navLinks.map(({ to, label, end, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-touch flex-col items-center justify-center gap-1 rounded-control text-xs",
                  isActive ? "font-semibold text-primary" : "font-medium text-ink-muted hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Ativo: pílula atrás do ícone, além da cor. */}
                  <span
                    className={cn(
                      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-primary-light"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
