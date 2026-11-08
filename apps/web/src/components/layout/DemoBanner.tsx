import { FlaskConical } from "lucide-react";
import { useDemoSettings, useUpdateDemoSettings } from "../../services/demoSettings";

/** Aviso no topo enquanto a simulação estiver ligada (para não esquecer ligada). */
export default function DemoBanner() {
  const { error, delay } = useDemoSettings();
  const setDemoSettings = useUpdateDemoSettings();
  if (error === "off" && delay === 0) return null;

  const parts = [
    error !== "off" && `erro ${error}`,
    delay > 0 && `atraso de ${(delay / 1000).toLocaleString("pt-BR")} s`,
  ].filter(Boolean);

  return (
    <div role="status" className="border-b border-warning bg-warning-light">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1 text-sm text-warning-text">
        <p className="flex items-center gap-2 font-medium">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Modo demonstração ativo: {parts.join(" e ")} em todas as requisições.
        </p>
        <button
          type="button"
          onClick={() => setDemoSettings({ error: "off", delay: 0 })}
          className="min-h-touch rounded-control px-2 font-semibold underline hover:bg-white/60"
        >
          Desativar
        </button>
      </div>
    </div>
  );
}
