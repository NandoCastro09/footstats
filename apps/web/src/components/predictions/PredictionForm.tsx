import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, RefreshCw, Save, Send, X } from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";
import Textarea from "../Textarea";
import { useToast } from "../toast/toastContext";
import { useCreatePrediction, useMatches, useUpdatePrediction } from "../../hooks/useApi";
import { formatKickoff } from "../../lib/format";
import { useLeague } from "../../league/leagueContext";
import {
  COMMENT_MAX,
  predictionFields,
  predictionSchema,
  type PredictionFormValues,
} from "../../schemas/prediction";
import { ApiError } from "../../services/api";
import type { Match, Prediction } from "../../types";

interface PredictionFormProps {
  /** Palpite em edição (PUT) ou null para criar um novo (POST). */
  editing: Prediction | null;
  onDone: () => void;
}

// Campos numéricos começam vazios; o zod acusa "Informe os gols" no envio.
const emptyValues = {
  name: "",
  email: "",
  matchId: "",
  homeGoals: undefined,
  awayGoals: undefined,
  comment: "",
} as unknown as PredictionFormValues;

function toFormValues(prediction: Prediction): PredictionFormValues {
  const { name, email, matchId, homeGoals, awayGoals, comment } = prediction;
  return { name, email, matchId, homeGoals, awayGoals, comment };
}

function matchLabel(match: Match) {
  return `${match.homeTeam.name} x ${match.awayTeam.name} · Rodada ${match.round} · ${formatKickoff(match.kickoff)}`;
}

function isField(key: string): key is keyof PredictionFormValues {
  return (predictionFields as readonly string[]).includes(key);
}

export default function PredictionForm({ editing, onDone }: PredictionFormProps) {
  const toast = useToast();
  const createMutation = useCreatePrediction();
  const updateMutation = useUpdatePrediction();
  const { code: competition, competition: league } = useLeague();
  const matchesQuery = useMatches({ competition, status: "scheduled" });
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    control,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: editing ? toFormValues(editing) : emptyValues,
    mode: "onTouched", // valida ao sair do campo; depois, a cada tecla
  });

  // Ao abrir em modo edição, leva o foco para o primeiro campo.
  useEffect(() => {
    if (editing) setFocus("name");
  }, [editing, setFocus]);

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending;
  const selectedMatchId = useWatch({ control, name: "matchId" });
  const commentLength = useWatch({ control, name: "comment" })?.length ?? 0;

  // Partidas disponíveis: só as agendadas (+ a do palpite em edição, se não estiver na lista).
  const options = matchesQuery.data ?? [];
  const matchOptions =
    editing && !options.some((match) => match.id === editing.matchId)
      ? [editing.match, ...options]
      : options;
  const selectedMatch = matchOptions.find((match) => match.id === selectedMatchId);

  /** Liga os erros 400/409 do backend aos campos do formulário. */
  function handleServerError(error: unknown) {
    const message =
      error instanceof ApiError ? error.message : "Erro inesperado ao salvar o palpite.";

    if (error instanceof ApiError && error.details) {
      const fieldErrors = Object.entries(error.details).filter(([key]) => isField(key));
      fieldErrors.forEach(([key, fieldMessage], index) => {
        setError(
          key as keyof PredictionFormValues,
          { type: "server", message: fieldMessage },
          { shouldFocus: index === 0 }
        );
      });
    }

    setFormError(message);
    toast.error("Não foi possível salvar o palpite", message);
  }

  async function onSubmit(values: PredictionFormValues) {
    setFormError(null);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: values });
        toast.success("Palpite atualizado", `${values.name}, seu palpite foi salvo.`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Palpite enviado!", `Boa sorte, ${values.name}!`);
      }
      reset(emptyValues);
      onDone();
    } catch (error) {
      handleServerError(error);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate // usamos nossas próprias mensagens, não os balões do navegador
      aria-labelledby="form-title"
      aria-busy={pending}
      className="space-y-2"
    >
      <p className="text-sm text-ink-muted">
        Campos marcados com <span className="font-bold text-danger" aria-hidden="true">*</span>
        <span className="sr-only">asterisco</span> são obrigatórios.
      </p>

      {(formError || (isSubmitted && errorCount > 0)) && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-control border border-danger bg-danger-light p-3 text-sm text-ink"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <p>
            {formError ??
              `Revise ${errorCount === 1 ? "o campo destacado" : `os ${errorCount} campos destacados`} abaixo.`}
          </p>
        </div>
      )}

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Input
          label="Nome"
          required
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <Select
        label="Partida"
        required
        disabled={matchesQuery.isPending}
        error={errors.matchId?.message}
        hint={
          matchesQuery.isError ? (
            <span className="flex flex-wrap items-center gap-2 text-danger">
              Não foi possível carregar as partidas.
              <Button size="sm" variant="ghost" onClick={() => matchesQuery.refetch()}
                icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
                Tentar novamente
              </Button>
            </span>
          ) : (
            `Partidas que ainda não começaram · ${league?.name ?? competition} (troque a liga no topo da página).`
          )
        }
        {...register("matchId")}
      >
        <option value="">
          {matchesQuery.isPending ? "Carregando partidas…" : "Selecione uma partida"}
        </option>
        {matchOptions.map((match) => (
          <option key={match.id} value={match.id}>
            {matchLabel(match)}
          </option>
        ))}
      </Select>

      <fieldset className="grid grid-cols-2 gap-x-4">
        <legend className="mb-2 text-sm font-semibold text-ink">Placar do palpite</legend>
        <Input
          label={selectedMatch ? `Gols ${selectedMatch.homeTeam.shortName} (mandante)` : "Gols do mandante"}
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          step={1}
          required
          error={errors.homeGoals?.message}
          {...register("homeGoals", { valueAsNumber: true })}
        />
        <Input
          label={selectedMatch ? `Gols ${selectedMatch.awayTeam.shortName} (visitante)` : "Gols do visitante"}
          type="number"
          inputMode="numeric"
          min={0}
          max={20}
          step={1}
          required
          error={errors.awayGoals?.message}
          {...register("awayGoals", { valueAsNumber: true })}
        />
      </fieldset>

      <Textarea
        label="Comentário"
        hint={`Opcional · ${commentLength}/${COMMENT_MAX} caracteres`}
        maxLength={COMMENT_MAX}
        error={errors.comment?.message}
        {...register("comment")}
      />

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {editing && (
          <Button
            variant="secondary"
            onClick={() => {
              reset(emptyValues);
              onDone();
            }}
            disabled={pending}
            icon={<X className="h-4 w-4" aria-hidden="true" />}
          >
            Cancelar edição
          </Button>
        )}
        <Button
          type="submit"
          loading={pending}
          icon={
            editing ? (
              <Save className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )
          }
        >
          {pending ? "Enviando…" : editing ? "Salvar alterações" : "Enviar palpite"}
        </Button>
      </div>
    </form>
  );
}
