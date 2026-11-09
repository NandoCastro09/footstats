import EmptyState from "../EmptyState";
import ErrorState from "../ErrorState";
import PersonPhoto from "../PersonPhoto";
import { SectionTitle } from "../PageHero";
import { SkeletonRegion } from "../Skeleton";
import { TeamScorersSkeleton } from "../skeletons/PageSkeletons";
import { useScorers } from "../../hooks/useApi";
import type { Player, Scorer } from "../../types";

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function photoOf(scorer: Scorer, squad: Player[]) {
  const byId = squad.find((player) => player.id === scorer.player.id);
  if (byId) return byId.photo;
  const name = normalize(scorer.player.name);
  return squad.find((player) => normalize(player.name) === name)?.photo ?? null;
}

function TopScorer({ scorer, photo }: { scorer: Scorer; photo: string | null }) {
  const numbers = [
    { label: "gols", value: scorer.goals, accent: true },
    { label: "assist.", value: scorer.assists },
    { label: "jogos", value: scorer.playedMatches },
  ];
  return (
    <article className="flex min-w-0 flex-[1_1_320px] flex-col gap-5 rounded-2xl border border-line bg-surface p-6">
      <span className="self-start rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-inverse">
        Artilheiro
      </span>
      <div className="flex items-center gap-4">
        <PersonPhoto name={scorer.player.name} photo={photo} size="xl" className="ring-2 ring-lime ring-offset-2 ring-offset-surface" />
        <div className="min-w-0">
          <h3 className="break-words font-display text-[40px] font-extrabold uppercase leading-none text-ink">
            {scorer.player.name}
          </h3>
          <p className="mt-1 text-sm text-ink-2">{scorer.player.nationality}</p>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-3 border-t border-line pt-5">
        {numbers.map((item) => (
          <div key={item.label} className="flex flex-col-reverse">
            <dt className="text-xs uppercase tracking-[0.1em] text-muted">{item.label}</dt>
            <dd className={`font-display text-5xl font-bold leading-none tabular-nums ${item.accent ? "text-lime" : "text-ink"}`}>
              {item.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function ScorerRow({ scorer, rank, photo, max }: { scorer: Scorer; rank: number; photo: string | null; max: number }) {
  const details = [
    scorer.assists !== null && `${scorer.assists} assist.`,
    scorer.playedMatches !== null && `${scorer.playedMatches} jogos`,
  ].filter(Boolean);
  return (
    <li className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
      <span className="w-6 shrink-0 text-center font-display text-lg font-bold tabular-nums text-muted">{rank}</span>
      <PersonPhoto name={scorer.player.name} photo={photo} size="xs" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">
          {scorer.player.name} <span className="font-normal text-muted">· {scorer.player.nationality}</span>
        </p>
        {details.length > 0 && <p className="text-xs text-ink-2">{details.join(" · ")}</p>}
        <div className="mt-1.5 h-1.5 rounded-full bg-bg" aria-hidden="true">
          <div className="h-full rounded-full bg-lime" style={{ width: `${(scorer.goals / max) * 100}%` }} />
        </div>
      </div>
      <p className="shrink-0 text-right font-display text-3xl font-bold leading-none tabular-nums text-ink">
        {scorer.goals}
        <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
          {scorer.goals === 1 ? "gol" : "gols"}
        </span>
      </p>
    </li>
  );
}

export default function TeamScorers({ teamId, competition, squad }: { teamId: string; competition: string; squad: Player[] }) {
  const { data: scorers, isPending, isError, error, refetch, isFetching } = useScorers({ competition, team: teamId });

  return (
    <section id="artilheiros" aria-labelledby="artilheiros-titulo" className="scroll-mt-24 space-y-5">
      <div>
        <SectionTitle id="artilheiros-titulo">Artilheiros</SectionTitle>
        <p className="mt-2 text-sm text-muted">Jogadores do time entre os 100 maiores artilheiros do campeonato.</p>
      </div>
      {isPending ? (
        <SkeletonRegion label="Carregando artilheiros do time…">
          <TeamScorersSkeleton />
        </SkeletonRegion>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} title="Não foi possível carregar a artilharia" />
      ) : scorers.length === 0 ? (
        <EmptyState title="Nenhum artilheiro do time" description="Nenhum jogador do time está entre os 100 maiores artilheiros." />
      ) : (
        <div className="flex flex-wrap items-start gap-4">
          <TopScorer scorer={scorers[0]} photo={photoOf(scorers[0], squad)} />
          {scorers.length > 1 && (
            <div className="min-w-0 flex-[999_1_420px] rounded-2xl border border-line bg-surface px-5 py-2">
              <h3 className="sr-only">Outros artilheiros do time</h3>
              <ol>
                {scorers.slice(1).map((scorer, index) => (
                  <ScorerRow
                    key={scorer.player.id}
                    scorer={scorer}
                    rank={index + 2}
                    photo={photoOf(scorer, squad)}
                    max={scorers[0].goals || 1}
                  />
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
