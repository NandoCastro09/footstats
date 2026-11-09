import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Modal from "../components/Modal";
import PageHero, { SectionTitle } from "../components/PageHero";
import { PredictionListSkeleton } from "../components/skeletons/PageSkeletons";
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
  const { code: league, competition } = useLeague();

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
    <div className="space-y-10">
      <PageHero
        eyebrow={`Palpites · ${competition ? `${competition.name} ${competition.season}` : "carregando liga"}`}
        title={
          <>
            Crave o <span className="text-lime">placar</span>
          </>
        }
        description="Escolha uma partida que ainda não começou e diga quanto vai ficar. Você pode editar ou excluir o palpite depois."
      />

      <div className="flex flex-wrap items-start gap-8">
        <section
          aria-labelledby="form-title"
          className="min-w-0 flex-[999_1_560px] rounded-panel border border-line bg-surface p-5 sm:p-7"
        >
          <h2 id="form-title" className="mb-3 font-display text-3xl font-extrabold uppercase text-ink">
            {editing ? "Editar palpite" : "Novo palpite"}
          </h2>
          {/* key: ao trocar entre criar/editar, o formulário reinicia com os valores certos. */}
          <PredictionForm
            key={editing?.id ?? `novo-${league}`}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        </section>

        <section aria-labelledby="lista-title" className="min-w-0 flex-[1_1_320px] space-y-4">
          <SectionTitle id="lista-title" size="md">
            Palpites enviados
            {predictionsQuery.isSuccess && (
              <span className="ml-2 font-sans text-base font-medium normal-case text-muted">
                · {predictions.length}
              </span>
            )}
          </SectionTitle>

          {predictionsQuery.isPending ? (
            <PredictionListSkeleton />
          ) : predictionsQuery.isError ? (
            <ErrorState
              error={predictionsQuery.error}
              onRetry={() => predictionsQuery.refetch()}
              retrying={predictionsQuery.isFetching}
            />
          ) : predictions.length === 0 ? (
            <EmptyState
              icon={<MessageSquarePlus className="h-10 w-10 text-lime" aria-hidden="true" />}
              title="Nenhum palpite ainda"
              description="Use o formulário para enviar o primeiro palpite."
            />
          ) : (
            <ul className="space-y-3">
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
