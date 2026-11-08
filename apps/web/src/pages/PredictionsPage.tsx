import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Modal from "../components/Modal";
import { SkeletonGrid } from "../components/Skeleton";
import PredictionCard from "../components/predictions/PredictionCard";
import PredictionForm from "../components/predictions/PredictionForm";
import { useToast } from "../components/toast/toastContext";
import { useDeletePrediction, usePredictions } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { useLeague } from "../league/leagueContext";
import { ApiError } from "../services/api";
import type { Prediction } from "../types";

export default function PredictionsPage() {
  usePageTitle("Palpites");
  const toast = useToast();
  const predictionsQuery = usePredictions();
  const deleteMutation = useDeletePrediction();
  const { code: league } = useLeague();

  const [editing, setEditing] = useState<Prediction | null>(null);
  const [toDelete, setToDelete] = useState<Prediction | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        toast.success("Palpite excluído", `O palpite de ${target.name} foi removido.`);
        if (editing?.id === target.id) setEditing(null);
      },
      onError: (error) => {
        toast.error(
          "Não foi possível excluir",
          error instanceof ApiError ? error.message : "Tente novamente."
        );
      },
      onSettled: () => setToDelete(null),
    });
  }

  const predictions = predictionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Palpites</h1>
        <p className="mt-1 text-ink-muted">
          Dê seu palpite para os próximos jogos. Você pode editar ou excluir depois.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section
          aria-labelledby="form-title"
          className="rounded-card border border-line bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-4"
        >
          <h2 id="form-title" className="mb-2 text-xl font-bold text-ink">
            {editing ? "Editar palpite" : "Novo palpite"}
          </h2>
          {/* key: ao trocar entre criar/editar, o formulário reinicia com os valores certos. */}
          <PredictionForm
            key={editing?.id ?? `novo-${league}`}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        </section>

        <section aria-labelledby="lista-title" className="space-y-4">
          <h2 id="lista-title" className="text-xl font-bold text-ink">
            Palpites enviados
            {predictionsQuery.isSuccess && (
              <span className="ml-2 text-base font-normal text-ink-muted">
                ({predictions.length})
              </span>
            )}
          </h2>

          {predictionsQuery.isPending ? (
            <SkeletonGrid
              count={4}
              itemClassName="h-56"
              className="grid gap-4 sm:grid-cols-2"
              label="Carregando palpites…"
            />
          ) : predictionsQuery.isError ? (
            <ErrorState
              error={predictionsQuery.error}
              onRetry={() => predictionsQuery.refetch()}
              retrying={predictionsQuery.isFetching}
            />
          ) : predictions.length === 0 ? (
            <EmptyState
              icon={<MessageSquarePlus className="h-10 w-10 text-primary" aria-hidden="true" />}
              title="Nenhum palpite ainda"
              description="Use o formulário para enviar o primeiro palpite."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {predictions.map((prediction) => (
                <li key={prediction.id}>
                  <PredictionCard
                    prediction={prediction}
                    isEditing={editing?.id === prediction.id}
                    onEdit={setEditing}
                    onDelete={setToDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal
        isOpen={toDelete !== null}
        title="Excluir palpite"
        onClose={() => !deleteMutation.isPending && setToDelete(null)}
        onConfirm={confirmDelete}
        confirmText="Excluir"
        confirmVariant="danger"
        confirmLoading={deleteMutation.isPending}
      >
        {toDelete && (
          <p>
            Tem certeza que deseja excluir o palpite de <strong>{toDelete.name}</strong> para{" "}
            <strong>
              {toDelete.match.homeTeam.name} {toDelete.homeGoals} x {toDelete.awayGoals}{" "}
              {toDelete.match.awayTeam.name}
            </strong>
            ? Essa ação não pode ser desfeita.
          </p>
        )}
      </Modal>
    </div>
  );
}
