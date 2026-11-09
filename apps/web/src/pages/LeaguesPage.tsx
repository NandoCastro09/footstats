import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, CircleDot, ListOrdered, Search, Target } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import PageHero from "../components/PageHero";
import SegmentedControl from "../components/SegmentedControl";
import { CurrentLeagueSkeleton, LeagueGroupsSkeleton } from "../components/skeletons/PageSkeletons";
import { fieldBase, fieldState } from "../components/styles";
import { useCompetitions } from "../hooks/useApi";
import { usePageTitle } from "../hooks/usePageTitle";
import { cn } from "../lib/cn";
import { useLeague } from "../league/leagueContext";
import type { Competition } from "../types";

type Region = "brasil" | "europa" | "continentais";
type RegionFilter = Region | "all";

const regions: Array<{ value: Region; label: string; title: string }> = [
  { value: "brasil", label: "Brasil", title: "Brasil" },
  { value: "europa", label: "Europa", title: "Ligas europeias" },
  { value: "continentais", label: "Continentais", title: "Continentais" },
];

function regionOf(competition: Competition): Region {
  if (competition.country === "Brasil") return "brasil";
  if (competition.code === "CL" || competition.country === "Europa") return "continentais";
  return "europa";
}

const countryCodes: Record<string, string> = {
  Brasil: "BRA",
  Inglaterra: "ENG",
  Espanha: "ESP",
  Itália: "ITA",
  Alemanha: "GER",
  França: "FRA",
  Holanda: "NED",
  Portugal: "POR",
  Europa: "UEFA",
};

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function LeagueLogo({ competition, size }: { competition: Competition; size: 56 | 72 }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[14px] bg-[#F4F6F1]",
        size === 56 ? "h-14 w-14 p-2" : "h-[72px] w-[72px] p-2.5"
      )}
    >
      <img src={competition.emblem} alt="" width={size} height={size} loading="lazy" className="h-full w-full object-contain" />
    </span>
  );
}

function CurrentLeagueCard({ competition }: { competition: Competition }) {
  const shortcuts = [
    { to: "/", label: "Partidas", icon: CircleDot },
    { to: "/classificacao", label: "Classificação", icon: ListOrdered },
    { to: "/palpites", label: "Palpites", icon: Target },
  ];
  return (
    <section aria-labelledby="liga-atual" className="rounded-panel border-2 border-lime bg-surface p-6">
      <div className="flex items-start gap-4">
        <LeagueLogo competition={competition} size={72} />
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] text-ink-inverse">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Liga atual
          </p>
          <h2 id="liga-atual" className="mt-2 font-display text-4xl font-extrabold uppercase leading-none text-ink">
            {competition.name}
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            {competition.country} · temporada {competition.season}
          </p>
        </div>
      </div>
      <ul className="mt-5 grid grid-cols-3 gap-2">
        {shortcuts.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex min-h-touch flex-col items-center justify-center gap-1.5 rounded-[12px] border border-line bg-bg px-2 py-3 text-center text-sm font-semibold text-ink hover:border-lime"
            >
              <Icon className="h-5 w-5 text-lime" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LeagueCard({
  competition,
  current,
  onSelect,
}: {
  competition: Competition;
  current: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "flex h-full items-center gap-4 rounded-[14px] bg-surface p-4",
        current ? "border-2 border-lime" : "border border-line"
      )}
    >
      <LeagueLogo competition={competition} size={56} />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 font-sans text-base font-bold leading-snug text-ink">{competition.name}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
          <span className="rounded-md bg-bg px-1.5 py-0.5 text-xs font-bold tracking-[0.08em] text-ink">
            {countryCodes[competition.country] ?? competition.country.slice(0, 3).toUpperCase()}
          </span>
          {competition.country} · {competition.season}
        </p>
      </div>
      {current ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-ink-inverse">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Atual
        </span>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Selecionar ${competition.name}`}
          className="inline-flex min-h-touch shrink-0 items-center rounded-full border border-line-strong px-4 text-sm font-semibold text-ink hover:border-lime"
        >
          Selecionar
        </button>
      )}
    </article>
  );
}

export default function LeaguesPage() {
  usePageTitle("Ligas");
  const { code, competition, setLeague } = useLeague();
  const { data: competitions, isPending, isError, error, refetch, isFetching } = useCompetitions();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [announcement, setAnnouncement] = useState("");
  const searchId = useId();

  const filtered = useMemo(() => {
    const query = normalize(search.trim());
    return (competitions ?? []).filter(
      (c) =>
        (region === "all" || regionOf(c) === region) &&
        (!query || normalize(`${c.name} ${c.country}`).includes(query))
    );
  }, [competitions, search, region]);

  const countIn = (value: Region) => (competitions ?? []).filter((c) => regionOf(c) === value).length;

  function select(next: Competition) {
    setLeague(next.code);
    setAnnouncement(`${next.name} selecionada. Partidas, classificação e palpites agora mostram essa liga.`);
  }

  return (
    <div className="space-y-10">
      <PageHero
        eyebrow={competitions ? `${competitions.length} competições disponíveis` : "Carregando competições"}
        title="Ligas"
        description="Escolha a competição. Partidas, classificação, artilharia e palpites passam a mostrar a liga escolhida."
        aside={competition ? <CurrentLeagueCard competition={competition} /> : <CurrentLeagueSkeleton />}
      />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {isPending ? (
        <LeagueGroupsSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <>
          <form
            role="search"
            aria-label="Filtrar ligas"
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
              <label htmlFor={searchId} className="text-sm font-semibold text-ink">
                Buscar liga
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  id={searchId}
                  type="search"
                  placeholder="Nome ou país"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  autoComplete="off"
                  maxLength={40}
                  className={cn(fieldBase, fieldState(false), "pl-11")}
                />
              </div>
            </div>
            <SegmentedControl<RegionFilter>
              label="Filtrar por região"
              value={region}
              onChange={setRegion}
              className="flex-[1_1_420px]"
              options={[
                { value: "all", label: "Todas", count: competitions.length },
                ...regions.map((r) => ({ value: r.value, label: r.label, count: countIn(r.value) })),
              ]}
            />
          </form>

          {filtered.length === 0 ? (
            <EmptyState title="Nenhuma liga encontrada" description="Tente outro nome ou país." />
          ) : (
            <div className="space-y-10">
              {regions.map((r) => {
                const items = filtered.filter((c) => regionOf(c) === r.value);
                if (items.length === 0) return null;
                return (
                  <section key={r.value} aria-labelledby={`regiao-${r.value}`} className="space-y-4">
                    <h2 id={`regiao-${r.value}`} className="flex items-center gap-4">
                      <span className="shrink-0 font-display text-[28px] font-extrabold uppercase leading-none text-ink">
                        {r.title}
                      </span>
                      <span className="h-px flex-1 bg-line" aria-hidden="true" />
                      <span className="shrink-0 font-sans text-sm font-medium text-muted">
                        {items.length} {items.length === 1 ? "liga" : "ligas"}
                      </span>
                    </h2>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-3">
                      {items.map((c) => (
                        <li key={c.code}>
                          <LeagueCard competition={c} current={c.code === code} onSelect={() => select(c)} />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
