import { Link } from "react-router-dom";
import Logo from "../Logo";
import DataSourceNote from "./DataSourceNote";
import DemoPanel from "./DemoPanel";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
        <DemoPanel />
        <DataSourceNote />
        <div className="flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Logo size={24} className="[&>span:last-child]:text-lg" />
            <span>· partidas, classificação e palpites</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <p>Projeto acadêmico · UNIJUÍ 2026</p>
            <Link
              to="/componentes"
              className="inline-flex min-h-touch items-center font-medium text-lime underline-offset-2 hover:underline"
            >
              Galeria de componentes
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
