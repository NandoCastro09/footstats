import { useState } from "react";
import { List, MessageSquarePlus } from "lucide-react";
import Button from "../components/Button";
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

// Quantos palpites aparecem direto na página; o resto fica no modal "Ver todos".
const VISIBLE_PREDICTIONS = 3;

export default function PredictionsPage() {
  usePageTitle("Palpites");
  const toast = useToast();
  const predictionsQuery = usePredictions();
  const deleteMutation = useDeletePrediction();
  const { code: league, competition } = useLeague();

  const [editing, setEditing] = useState<Prediction | null>(null);
  const [toDelete, setToDelete] = useState<Prediction | null>(null);
  const [showAll, setShowAll] = useState(false);

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
  const visible = predictions.slice(0, VISIBLE_PREDICTIONS);
  const hidden = predictions.length - visible.length;

  // Editar a partir do modal: fecha a lista e leva o foco para o formulário.
  function editFromModal(prediction: Prediction) {
    setShowAll(false);
    setEditing(prediction);
  }

  const renderCard = (prediction: Prediction, onEdit: (prediction: Prediction) => void) => (
    <li key={prediction.id}>
      <PredictionCard
        prediction={prediction}
        isEditing={editing?.id === prediction.id}
        onEdit={onEdit}
        onDelete={setToDelete}
      />
    </li>
  );

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
            <>
              <ul className="space-y-3">{visible.map((prediction) => renderCard(prediction, setEditing))}</ul>
              {hidden > 0 && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowAll(true)}
                  icon={<List className="h-4 w-4" aria-hidden="true" />}
                >
                  Ver todos os {predictions.length} palpites
                </Button>
              )}
            </>
          )}
        </section>
      </div>

      <Modal
        isOpen={showAll}
        title={`Palpites enviados (${predictions.length})`}
        onClose={() => setShowAll(false)}
        cancelText="Fechar"
        size="xl"
      >
        {predictions.length === 0 ? (
          <p className="text-ink-muted">Nenhum palpite ainda.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {predictions.map((prediction) => renderCard(prediction, editFromModal))}
          </ul>
        )}
      </Modal>

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
