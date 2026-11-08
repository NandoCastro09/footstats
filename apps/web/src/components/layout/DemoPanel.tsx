import { useId } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  useDemoSettings,
  useUpdateDemoSettings,
  type DemoSettings,
} from "../../services/demoSettings";
import { fieldBase, fieldState } from "../styles";

const errorOptions: Array<{ value: DemoSettings["error"]; label: string }> = [
  { value: "off", label: "Nenhum (normal)" },
  { value: "500", label: "500 · Erro interno" },
  { value: "503", label: "503 · Serviço indisponível" },
  { value: "404", label: "404 · Não encontrado" },
];

const delayOptions: Array<{ value: DemoSettings["delay"]; label: string }> = [
  { value: 0, label: "Sem atraso" },
  { value: 1500, label: "1,5 segundo" },
  { value: 3000, label: "3 segundos" },
];

/** Liga erros/latência simulados na API para demonstrar o tratamento de erros. */
export default function DemoPanel() {
  const settings = useDemoSettings();
  const setDemoSettings = useUpdateDemoSettings();
  const errorId = useId();
  const delayId = useId();
  const active = settings.error !== "off" || settings.delay > 0;

  return (
    <details className="rounded-card border border-line bg-surface-subtle" open={active}>
      <summary className="flex min-h-touch cursor-pointer items-center gap-2 px-4 font-medium text-ink">
        <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
        Modo demonstração
        {active && <span className="text-sm font-semibold text-warning-text">(ativo)</span>}
      </summary>
      <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
        <p className="text-sm text-ink-muted sm:col-span-2">
          Faz a API responder com erro ou atraso de propósito, para ver as telas de
          carregando e de erro.
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor={errorId} className="text-sm font-medium text-ink">
            Simular erro
          </label>
          <select
            id={errorId}
            value={settings.error}
            onChange={(event) =>
              setDemoSettings({ error: event.target.value as DemoSettings["error"] })
            }
            className={cn(fieldBase, fieldState(false))}
          >
            {errorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={delayId} className="text-sm font-medium text-ink">
            Simular latência
          </label>
          <select
            id={delayId}
            value={settings.delay}
            onChange={(event) =>
              setDemoSettings({ delay: Number(event.target.value) as DemoSettings["delay"] })
            }
            className={cn(fieldBase, fieldState(false))}
          >
            {delayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </details>
  );
}
