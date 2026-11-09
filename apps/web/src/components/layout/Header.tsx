import { Link, NavLink } from "react-router-dom";
import Logo from "../Logo";
import { cn } from "../../lib/cn";
import LeagueSelect from "./LeagueSelect";
import { navLinks } from "./navLinks";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    // h-full + after: o sublinhado de 3px fica colado na borda de baixo do header.
    "relative flex h-full min-h-touch items-center px-1 text-[15px] transition-colors",
    "after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-t-sm after:content-['']",
    isActive
      ? "font-semibold text-ink after:bg-lime"
      : "font-medium text-muted after:bg-transparent hover:text-ink"
  );
}

/** Topo fixo. No mobile a navegação fica na barra inferior (BottomNav). */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2 lg:py-0">
        <Link
          to="/"
          aria-label="FootStats, página inicial"
          className="flex min-h-touch shrink-0 items-center rounded-control"
        >
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden self-stretch lg:block">
          <ul className="flex h-full gap-7">
            {navLinks.map((link) => (
              <li key={link.to} className="h-full">
                {/* NavLink já coloca aria-current="page" no link ativo. */}
                <NavLink to={link.to} end={link.end} className={navLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <LeagueSelect className="ml-auto min-w-0 max-w-sm flex-1 lg:flex-none" />
      </div>
    </header>
  );
}
