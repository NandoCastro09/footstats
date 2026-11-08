import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";
import { ApiError } from "../services/api";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  title?: string;
}

function describe(error: unknown) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      detail: error.status > 0 ? `Código ${error.status} · ${error.code}` : error.code,
    };
  }
  return { message: "Algo deu errado ao carregar os dados.", detail: undefined };
}

export default function ErrorState({
  error,
  onRetry,
  retrying = false,
  title = "Não foi possível carregar",
}: ErrorStateProps) {
  const { message, detail } = describe(error);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-card border border-danger bg-danger-light px-6 py-10 text-center"
    >
      <AlertTriangle className="h-10 w-10 text-danger" aria-hidden="true" />
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-1 text-ink">{message}</p>
        {detail && <p className="mt-1 text-sm text-ink-muted">{detail}</p>}
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          loading={retrying}
          icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
