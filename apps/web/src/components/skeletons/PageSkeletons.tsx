/**
 * Skeletons que seguem o layout de cada tela (mesmas grades, alturas e posições),
 * para a troca skeleton → conteúdo não "pular". Usados na troca de tela
 * (Suspense das rotas) e enquanto cada request está em andamento.
 */
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import S, { SkeletonRegion } from "../Skeleton";
import { cn } from "../../lib/cn";

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

// ---------------------------------------------------------------- comuns

/** Mesmo grid do <PageHero>: eyebrow, título gigante, texto, números e coluna da direita. */
export function HeroSkeleton({
  aside,
  stats = false,
  titleClass = "w-[min(100%,520px)]",
}: {
  aside?: ReactNode;
  stats?: boolean;
  titleClass?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-8 pt-4 sm:pt-8 lg:pt-12",
        Boolean(aside) && "grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))]"
      )}
    >
      <div className="min-w-0">
        <S className="h-3.5 w-64 max-w-full" />
        <S className={cn("mt-4 h-[clamp(44px,9vw,108px)]", titleClass)} />
        <S className="mt-6 h-4 w-full max-w-xl" />
        <S className="mt-2 h-4 w-4/5 max-w-md" />
        {stats && (
          <div className="mt-7 flex gap-10">
            {range(3).map((i) => (
              <div key={i}>
                <S className="h-11 w-14" />
                <S className="mt-2 h-3 w-16" />
              </div>
            ))}
          </div>
        )}
        <S className="mt-6 h-6 w-56 max-w-full" />
      </div>
      {aside && <div className="min-w-0">{aside}</div>}
    </div>
  );
}

/** Título de seção grande ("PRÓXIMAS PARTIDAS"). */
export function SectionTitleSkeleton({ className }: { className?: string }) {
  return <S className={cn("h-9 w-72 max-w-full", className)} />;
}

/** Busca + segmentado (Partidas e Ligas). */
export function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-surface p-4">
      <div className="min-w-0 flex-[1_1_260px]">
        <S className="h-4 w-28" />
        <S className="mt-2 h-12 w-full rounded-[10px]" />
      </div>
      <S className="h-[54px] min-w-0 flex-[1_1_420px] rounded-[14px]" />
    </div>
  );
}

/** Cabeçalho de grupo: "SÁBADO, 14 DE NOVEMBRO ——— 2 jogos". */
function GroupHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <S className="h-3 w-48" />
      <span className="h-px flex-1 bg-line" />
      <S className="h-3 w-14" />
    </div>
  );
}

// ---------------------------------------------------------------- partidas

export function FeaturedMatchSkeleton() {
  const side = (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
      <S className="h-[60px] w-[60px] rounded-full sm:h-[76px] sm:w-[76px]" />
      <S className="h-6 w-20 max-w-full sm:w-28" />
    </div>
  );
  return (
    <div className="overflow-hidden rounded-panel border border-[#243027] bg-surface p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <S className="h-6 w-36 rounded-full" />
        <S className="h-3 w-20" />
      </div>
      <div className="flex items-center gap-4 py-6">
        {side}
        <div className="flex flex-col items-center gap-2">
          <S className="h-11 w-20 sm:w-28" />
          <S className="h-4 w-20" />
        </div>
        {side}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <div className="flex gap-2">
          {range(3).map((i) => (
            <S key={i} className="h-14 w-[58px] rounded-[10px]" />
          ))}
        </div>
        <S className="h-4 w-48" />
      </div>
      <div className="mt-5 flex gap-3">
        <S className="h-11 flex-1 rounded-full" />
        <S className="h-11 flex-1 rounded-full" />
      </div>
    </div>
  );
}

/** Mesma estrutura do <MatchCard> (linha: horário | times | estádio | botão). */
export function MatchRowSkeleton() {
  const team = (reverse: boolean) => (
    <div className={cn("flex flex-col items-center gap-2 sm:flex-row sm:gap-3", reverse && "sm:flex-row-reverse")}>
      <S className="h-10 w-10 shrink-0 rounded-full" />
      <S className="h-5 w-24 max-w-full" />
    </div>
  );
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[14px] border border-line bg-surface px-4 py-4 sm:gap-x-7 sm:px-5">
      <div className="flex w-full items-baseline gap-3 sm:w-[84px] sm:flex-col sm:gap-2">
        <S className="h-7 w-16" />
        <S className="h-3 w-16" />
      </div>
      <div className="grid min-w-0 flex-[1_1_380px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        {team(true)}
        <S className="h-6 w-8" />
        {team(false)}
      </div>
      <div className="min-w-0 flex-[1_1_150px] sm:flex-[1_1_220px]">
        <S className="h-4 w-48 max-w-full" />
      </div>
      <S className="ml-auto h-11 w-28 rounded-full" />
    </div>
  );
}

/** Seção de partidas: título + grupo do dia + linhas. */
export function MatchListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      <SectionTitleSkeleton />
      <GroupHeaderSkeleton />
      <div className="space-y-3">
        {range(rows).map((i) => (
          <MatchRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function MatchesPageSkeleton() {
  return (
    <SkeletonRegion label="Carregando partidas…" className="space-y-10">
      <HeroSkeleton stats aside={<FeaturedMatchSkeleton />} titleClass="w-[min(100%,460px)]" />
      <FilterBarSkeleton />
      <MatchListSkeleton />
    </SkeletonRegion>
  );
}

// ---------------------------------------------------------------- classificação

export function HighlightCardsSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
      {range(4).map((i) => (
        <div key={i} className="min-h-[132px] rounded-2xl border border-line bg-surface p-5">
          <S className="h-3 w-24" />
          <div className="mt-5 flex items-center gap-3">
            <S className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <S className="h-6 w-32 max-w-full" />
              <S className="mt-2 h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tabela (classificação ou artilharia): cabeçalho + linhas. */
export function TableSkeleton({ rows = 10, form = true }: { rows?: number; form?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <S className="h-7 w-64 max-w-[60%]" />
        <S className="hidden h-3 w-48 sm:block" />
      </div>
      <div className="flex items-center gap-4 px-5 py-4">
        <S className="h-3 w-6" />
        <S className="h-3 w-16" />
        <div className="ml-auto hidden gap-6 sm:flex">
          {range(7).map((i) => (
            <S key={i} className="h-3 w-6" />
          ))}
        </div>
      </div>
      {range(rows).map((i) => (
        <div key={i} className="flex items-center gap-4 border-t border-line px-5 py-3">
          <S className="h-[30px] w-[30px] shrink-0 rounded-lg" />
          <S className="h-8 w-8 shrink-0 rounded-full" />
          <S className="h-4 w-36" />
          <S className="ml-auto h-6 w-8" />
          <div className="hidden items-center gap-6 md:flex">
            {range(6).map((j) => (
              <S key={j} className="h-4 w-6" />
            ))}
          </div>
          {form && (
            <div className="hidden gap-1 lg:flex">
              {range(5).map((j) => (
                <S key={j} className="h-6 w-6 rounded-md" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Destaques + tabela + artilharia (o que carrega depois do topo da página). */
export function StandingsContentSkeleton() {
  return (
    <SkeletonRegion label="Carregando classificação…" className="space-y-10">
      <HighlightCardsSkeleton />
      <div className="space-y-5">
        <SectionTitleSkeleton />
        <TableSkeleton />
      </div>
    </SkeletonRegion>
  );
}

export function StandingsPageSkeleton() {
  return (
    <SkeletonRegion label="Carregando classificação…" className="space-y-10">
      <HeroSkeleton titleClass="w-[min(100%,720px)]" />
      <HighlightCardsSkeleton />
      <div className="space-y-5">
        <SectionTitleSkeleton />
        <TableSkeleton />
      </div>
    </SkeletonRegion>
  );
}

// ---------------------------------------------------------------- palpites

export function PredictionCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <S className="h-3 w-28" />
        <S className="h-6 w-24 rounded-full" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <S className="h-8 w-8 rounded-full" />
        <S className="h-8 w-20" />
        <S className="h-8 w-8 rounded-full" />
      </div>
      <S className="mt-3 h-4 w-44" />
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <S className="h-3 w-36" />
        <S className="h-9 w-32 rounded-full" />
      </div>
    </div>
  );
}

export function PredictionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <SkeletonRegion label="Carregando palpites…" className="space-y-3">
      {range(count).map((i) => (
        <PredictionCardSkeleton key={i} />
      ))}
    </SkeletonRegion>
  );
}

function FieldSkeleton() {
  return (
    <div>
      <S className="h-4 w-20" />
      <S className="mt-2 h-12 w-full rounded-[10px]" />
    </div>
  );
}

export function PredictionsPageSkeleton() {
  return (
    <SkeletonRegion label="Carregando palpites…" className="space-y-10">
      <HeroSkeleton titleClass="w-[min(100%,640px)]" />
      <div className="flex flex-wrap items-start gap-8">
        <div className="min-w-0 flex-[999_1_560px] space-y-5 rounded-panel border border-line bg-surface p-5 sm:p-7">
          <S className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <FieldSkeleton />
          <S className="h-56 w-full rounded-2xl" />
          <S className="h-24 w-full rounded-[10px]" />
          <S className="h-[52px] w-full rounded-full" />
        </div>
        <div className="min-w-0 flex-[1_1_320px] space-y-4">
          <S className="h-7 w-56" />
          {range(3).map((i) => (
            <PredictionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}

// ---------------------------------------------------------------- time

function TeamHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-8 rounded-3xl border border-line bg-surface p-6 sm:p-9">
      <div className="flex min-w-0 flex-[999_1_440px] flex-wrap items-center gap-6">
        <S className="h-[120px] w-[120px] shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 basis-64">
          <S className="h-3 w-48" />
          <S className="mt-3 h-[clamp(44px,8vw,96px)] w-4/5" />
          <S className="mt-4 h-4 w-72 max-w-full" />
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
        <S className="h-[88px] w-full rounded-2xl" />
        <S className="h-[88px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function TeamScorersSkeleton() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="min-w-0 flex-[1_1_320px] rounded-2xl border border-line bg-surface p-6">
        <S className="h-6 w-28 rounded-full" />
        <div className="mt-5 flex items-center gap-4">
          <S className="h-[88px] w-[88px] shrink-0 rounded-full" />
          <S className="h-9 w-40" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5">
          {range(3).map((i) => (
            <S key={i} className="h-12 w-14" />
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-[999_1_420px] rounded-2xl border border-line bg-surface px-5 py-2">
        {range(5).map((i) => (
          <div key={i} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
            <S className="h-5 w-5" />
            <S className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <S className="h-4 w-40 max-w-full" />
              <S className="mt-2 h-3 w-24" />
              <S className="mt-2 h-1.5 w-full" />
            </div>
            <S className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SquadSkeleton() {
  return (
    <div className="space-y-5">
      <SectionTitleSkeleton className="w-40" />
      <S className="h-[54px] w-full rounded-[14px]" />
      <GroupHeaderSkeleton />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3">
        {range(8).map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-[14px] border border-line bg-surface p-4">
            <S className="h-[52px] w-[52px] shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <S className="h-4 w-32 max-w-full" />
              <S className="mt-2 h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamPageSkeleton() {
  return (
    <SkeletonRegion label="Carregando time…" className="space-y-10">
      <div className="space-y-4">
        <S className="h-5 w-48" />
        <TeamHeaderSkeleton />
      </div>
      <div className="flex gap-7 border-b border-line pb-3">
        {range(3).map((i) => (
          <S key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionTitleSkeleton />
          <S className="h-7 w-52" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
          {range(4).map((i) => (
            <S key={i} className="h-[220px] rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <SectionTitleSkeleton className="w-56" />
        <TeamScorersSkeleton />
      </div>
      <SquadSkeleton />
    </SkeletonRegion>
  );
}

// ---------------------------------------------------------------- ligas

export function CurrentLeagueSkeleton() {
  return (
    <div className="rounded-panel border-2 border-line bg-surface p-6">
      <div className="flex items-start gap-4">
        <S className="h-[72px] w-[72px] shrink-0 rounded-[14px]" />
        <div className="min-w-0 flex-1">
          <S className="h-6 w-28 rounded-full" />
          <S className="mt-2 h-9 w-56 max-w-full" />
          <S className="mt-2 h-4 w-36" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {range(3).map((i) => (
          <S key={i} className="h-[72px] rounded-[12px]" />
        ))}
      </div>
    </div>
  );
}

function LeagueCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-line bg-surface p-4">
      <S className="h-14 w-14 shrink-0 rounded-[14px]" />
      <div className="min-w-0 flex-1">
        <S className="h-4 w-32 max-w-full" />
        <S className="mt-2 h-4 w-40 max-w-full" />
      </div>
      <S className="h-11 w-28 shrink-0 rounded-full" />
    </div>
  );
}

export function LeagueGroupsSkeleton() {
  return (
    <SkeletonRegion label="Carregando ligas…" className="space-y-10">
      <FilterBarSkeleton />
      {[1, 6].map((count, group) => (
        <div key={group} className="space-y-4">
          <div className="flex items-center gap-4">
            <S className="h-7 w-48" />
            <span className="h-px flex-1 bg-line" />
            <S className="h-3 w-12" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-3">
            {range(count).map((i) => (
              <LeagueCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

export function LeaguesPageSkeleton() {
  return (
    <SkeletonRegion label="Carregando ligas…" className="space-y-10">
      <HeroSkeleton aside={<CurrentLeagueSkeleton />} titleClass="w-[min(100%,280px)]" />
      <LeagueGroupsSkeleton />
    </SkeletonRegion>
  );
}

// ---------------------------------------------------------------- partida

export function MatchPageSkeleton() {
  const side = (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <S className="h-14 w-14 rounded-full sm:h-20 sm:w-20" />
      <S className="h-6 w-20 max-w-full sm:w-28" />
    </div>
  );
  return (
    <SkeletonRegion label="Carregando partida…" className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-panel border border-[#243027] bg-surface p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <S className="h-5 w-24" />
          <S className="h-3 w-48 max-w-[50%]" />
        </div>
        <div className="flex items-center gap-3 py-5 sm:gap-6">
          {side}
          <div className="flex flex-col items-center gap-2">
            <S className="h-6 w-24 rounded-full" />
            <S className="h-12 w-20 sm:w-28" />
            <S className="h-3 w-20" />
          </div>
          {side}
        </div>
        <S className="mx-auto h-4 w-64 max-w-full" />
        <S className="mt-5 h-12 w-full rounded-xl" />
      </div>
      <div className="space-y-4 rounded-card border border-line bg-surface p-4">
        {range(6).map((i) => (
          <div key={i}>
            <div className="flex justify-between">
              <S className="h-3 w-8" />
              <S className="h-3 w-28" />
              <S className="h-3 w-8" />
            </div>
            <S className="mt-2 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

// ---------------------------------------------------------------- troca de tela

/** Skeleton da próxima tela enquanto o código dela (lazy) é baixado. */
export function RouteSkeleton() {
  const { pathname } = useLocation();
  if (pathname === "/") return <MatchesPageSkeleton />;
  if (pathname.startsWith("/classificacao")) return <StandingsPageSkeleton />;
  if (pathname.startsWith("/partidas/")) return <MatchPageSkeleton />;
  if (pathname.startsWith("/times/")) return <TeamPageSkeleton />;
  if (pathname.startsWith("/palpites")) return <PredictionsPageSkeleton />;
  if (pathname.startsWith("/ligas")) return <LeaguesPageSkeleton />;
  return (
    <SkeletonRegion label="Carregando página…" className="space-y-10">
      <HeroSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {range(6).map((i) => (
          <S key={i} className="h-48 rounded-card" />
        ))}
      </div>
    </SkeletonRegion>
  );
}
