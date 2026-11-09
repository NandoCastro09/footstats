import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, AlertTriangle, ArrowRight, Eraser, Minus, Plus, RefreshCw, Save, X } from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";
import TeamCrest from "../TeamCrest";
import Textarea from "../Textarea";
import { cn } from "../../lib/cn";
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
  editing: Prediction | null;
  onDone: () => void;
}

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

const MAX_GOALS = 20;

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
  const [searchParams] = useSearchParams();
  const presetMatchId = searchParams.get("partida");
  const scoreId = useId();

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    getValues,
    reset,
    control,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: editing ? toFormValues(editing) : emptyValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (editing) setFocus("name");
  }, [editing, setFocus]);

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending;
  const selectedMatchId = useWatch({ control, name: "matchId" });
  const commentLength = useWatch({ control, name: "comment" })?.length ?? 0;

  const options = matchesQuery.data ?? [];
  const matchOptions =
    editing && !options.some((match) => match.id === editing.matchId)
      ? [editing.match, ...options]
      : options;
  const selectedMatch = matchOptions.find((match) => match.id === selectedMatchId);
  const homeGoals = useWatch({ control, name: "homeGoals" });
  const awayGoals = useWatch({ control, name: "awayGoals" });

  const presetAvailable = Boolean(presetMatchId && options.some((match) => match.id === presetMatchId));
  useEffect(() => {
    if (!editing && presetMatchId && presetAvailable && !getValues("matchId")) {
      setValue("matchId", presetMatchId, { shouldDirty: true });
    }
  }, [editing, presetMatchId, presetAvailable, getValues, setValue]);

  // Botões − e + do placar (o campo continua aceitando digitação). Limite: 0 a 20.
  function stepGoals(name: "homeGoals" | "awayGoals", delta: number) {
    const current = getValues(name);
    const base = Number.isFinite(current) ? current : delta > 0 ? 0 : 1;
    const next = Math.min(MAX_GOALS, Math.max(0, base + delta));
    setValue(name, next, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  }

  const homeName = selectedMatch?.homeTeam.name ?? "mandante";
  const awayName = selectedMatch?.awayTeam.name ?? "visitante";
  const bothSet = Number.isFinite(homeGoals) && Number.isFinite(awayGoals);
  const verdict = !bothSet
    ? null
    : homeGoals > awayGoals
      ? `vitória do ${homeName}`
      : awayGoals > homeGoals
        ? `vitória do ${awayName}`
        : "empate";

  // Quando a API recusa o palpite (400 ou 409), o erro de cada campo vem em "details"
  // e é mostrado embaixo do campo certo, como os erros de validação do próprio formulário.
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
      noValidate
      aria-labelledby="form-title"
      aria-busy={pending}
      className="space-y-3"
    >
      <p className="text-sm text-muted">
        <span className="font-bold text-lime" aria-hidden="true">*</span> campo obrigatório
        <span className="sr-only"> (marcado com asterisco)</span>
      </p>

      {(formError || (isSubmitted && errorCount > 0)) && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] border-2 border-alert bg-danger-light p-3 text-sm text-ink"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alert-text" aria-hidden="true" />
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
            <span className="flex flex-wrap items-center gap-2 text-alert-text">
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

      <fieldset className="rounded-2xl border border-line bg-bg p-4 sm:p-5">
        <legend className="px-1 text-sm font-semibold text-ink">
          Placar do palpite
          <span className="text-lime" aria-hidden="true"> *</span>
        </legend>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 pt-2">
          {(
            [
              { name: "homeGoals", side: "mandante", team: selectedMatch?.homeTeam, value: homeGoals },
              null,
              { name: "awayGoals", side: "visitante", team: selectedMatch?.awayTeam, value: awayGoals },
            ] as const
          ).map((item) => {
            if (!item) {
              return (
                <span key="x" aria-hidden="true" className="pt-24 font-display text-3xl font-bold text-muted">
                  ×
                </span>
              );
            }
            const inputId = `${scoreId}-${item.name}`;
            const errorId = `${inputId}-error`;
            const error = errors[item.name]?.message;
            const teamLabel = item.team ? `${item.team.name} (${item.side})` : item.side;
            return (
              <div key={item.name} className="flex min-w-0 flex-col items-center gap-2 text-center">
                {item.team ? (
                  <TeamCrest team={item.team} size="md" />
                ) : (
                  <span className="h-12 w-12 rounded-full border border-dashed border-line-strong" aria-hidden="true" />
                )}
                <label htmlFor={inputId} className="line-clamp-2 min-h-10 text-sm font-semibold text-ink-2">
                  <span className="sr-only">Gols do </span>
                  {item.team?.name ?? (item.side === "mandante" ? "Mandante" : "Visitante")}
                </label>
                <input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_GOALS}
                  step={1}
                  required
                  placeholder="–"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={cn(
                    "h-[76px] w-full max-w-[110px] rounded-[10px] border bg-surface text-center font-display text-[64px] font-bold leading-none tabular-nums text-ink placeholder:text-muted",
                    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    error ? "border-2 border-alert" : "border-line-field hover:border-lime"
                  )}
                  {...register(item.name, { valueAsNumber: true })}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => stepGoals(item.name, -1)}
                    disabled={!Number.isFinite(item.value) || item.value <= 0}
                    aria-label={`Diminuir gols do ${teamLabel}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink hover:border-lime disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepGoals(item.name, 1)}
                    disabled={Number.isFinite(item.value) && item.value >= MAX_GOALS}
                    aria-label={`Aumentar gols do ${teamLabel}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-lime hover:border-lime disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <p id={errorId} className="flex min-h-5 items-start gap-1 text-left text-sm font-medium text-alert-text">
                  {error && (
                    <>
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {error}
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </div>
        <p aria-live="polite" className="mt-1 min-h-6 text-center font-semibold text-lime">
          {bothSet && (
            <>
              <span className="sr-only">
                Placar: {homeName} {homeGoals}, {awayName} {awayGoals}.{" "}
              </span>
              Seu palpite: {verdict}
            </>
          )}
        </p>
      </fieldset>

      <Textarea
        label="Comentário"
        hint={
          <span className="flex justify-between gap-2">
            <span>Opcional</span>
            <span className="tabular-nums">
              {commentLength}/{COMMENT_MAX}
              <span className="sr-only"> caracteres</span>
            </span>
          </span>
        }
        maxLength={COMMENT_MAX}
        error={errors.comment?.message}
        {...register("comment")}
      />

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          type="submit"
          loading={pending}
          className="h-[52px] flex-1 text-base"
          icon={editing ? <Save className="h-5 w-5" aria-hidden="true" /> : undefined}
        >
          {pending ? "Enviando…" : editing ? "Salvar alterações" : "Enviar palpite"}
          {!pending && !editing && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
        </Button>
        {editing ? (
          <Button
            variant="secondary"
            className="h-[52px]"
            onClick={() => {
              reset(emptyValues);
              onDone();
            }}
            disabled={pending}
            icon={<X className="h-4 w-4" aria-hidden="true" />}
          >
            Cancelar edição
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="h-[52px]"
            onClick={() => {
              reset(emptyValues);
              setFormError(null);
            }}
            disabled={pending}
            icon={<Eraser className="h-4 w-4" aria-hidden="true" />}
          >
            Limpar
          </Button>
        )}
      </div>
    </form>
  );
}
