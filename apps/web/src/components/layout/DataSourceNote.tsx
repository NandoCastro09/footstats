import { AlertTriangle, Database } from "lucide-react";
import { useDataSource } from "../../hooks/useApi";

export default function DataSourceNote() {
  const { data: source } = useDataSource();
  if (!source) return null;

  if (source.fallback) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-warning-text">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        A football-data.org está indisponível agora: exibindo dados de demonstração.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2 text-sm text-ink-muted">
      <Database className="h-4 w-4 shrink-0" aria-hidden="true" />
      {source.providers.length > 0 ? (
        <span>
          Dados fornecidos por{" "}
          {source.providers.map((provider, index) => (
            <span key={provider.name}>
              {index > 0 && (index === source.providers.length - 1 ? " e " : ", ")}
              <a
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2"
              >
                {provider.name}
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </span>
          ))}
          .
        </span>
      ) : (
        "Dados fictícios gerados pela própria API (modo demonstração)."
      )}
    </p>
  );
}
