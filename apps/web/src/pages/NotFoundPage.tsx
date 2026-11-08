import { Link } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import { buttonBase, buttonSizes, buttonVariants } from "../components/styles";
import { usePageTitle } from "../hooks/usePageTitle";
import { cn } from "../lib/cn";

export default function NotFoundPage() {
  usePageTitle("Página não encontrada");

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <MapPinOff className="h-14 w-14 text-primary" aria-hidden="true" />
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold text-ink">Página não encontrada</h1>
      <p className="max-w-md text-ink-muted">
        O endereço que você acessou não existe ou foi removido. Que tal voltar
        para as partidas?
      </p>
      <Link to="/" className={cn(buttonBase, buttonVariants.primary, buttonSizes.md)}>
        Ir para Partidas
      </Link>
    </div>
  );
}
