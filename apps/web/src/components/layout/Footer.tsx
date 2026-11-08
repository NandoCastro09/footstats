import { Link } from "react-router-dom";
import DataSourceNote from "./DataSourceNote";
import DemoPanel from "./DemoPanel";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <DemoPanel />
        <DataSourceNote />
        <div className="flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>FootStats · Programação para Interface de Usuário · UNIJUÍ 2026.</p>
          <Link
            to="/componentes"
            className="inline-flex min-h-touch items-center font-medium text-primary underline-offset-2 hover:underline"
          >
            Galeria de componentes
          </Link>
        </div>
      </div>
    </footer>
  );
}
