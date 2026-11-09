// Gera src/data/team-links.generated.ts: liga cada time da football-data.org
// (partidas/tabela) ao mesmo time na API-Football (fotos/elenco/técnico).
//
// Uso (em apps/api, com as chaves no .env):  pnpm link-teams
//
// Gasta pouca cota: 1 requisição por liga em cada API, mais a 2ª divisão de
// 2024 (o plano gratuito da API-Football só libera 2022–2024, então é de lá
// que vêm os times promovidos depois). As respostas ficam em scripts/.cache,
// então rodar de novo não gasta nada. Apague a pasta para buscar dados novos.
import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const FD_TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const AF_KEY = process.env.API_FOOTBALL_KEY;
if (!FD_TOKEN || !AF_KEY) {
  console.error("Defina FOOTBALL_DATA_TOKEN e API_FOOTBALL_KEY no apps/api/.env");
  process.exit(1);
}

// Ligas (código football-data.org) → ids de liga na API-Football [1ª divisão, 2ª divisão].
// O Brasileirão fica de fora: ele já tem a ligação conferida à mão em team-links.ts.
const LEAGUES = [
  { code: "PL", country: "England", af: [39, 40] },
  { code: "ELC", country: "England", af: [40, 41] },
  { code: "PD", country: "Spain", af: [140, 141] },
  { code: "SA", country: "Italy", af: [135, 136] },
  { code: "BL1", country: "Germany", af: [78, 79] },
  { code: "FL1", country: "France", af: [61, 62] },
  { code: "DED", country: "Netherlands", af: [88, 89] },
  { code: "PPL", country: "Portugal", af: [94, 95] },
];
const AF_SEASON = 2024;
const MAX_SEARCHES = 15; // teto de buscas avulsas (protege a cota diária)
let searches = 0;
const CACHE_DIR = new URL("./.cache/", import.meta.url);
const OUTPUT = new URL("../src/data/team-links.generated.ts", import.meta.url);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

mkdirSync(CACHE_DIR, { recursive: true });

/** GET com cache em disco e espaçamento (as duas APIs limitam ~10 req/min). */
async function cachedGet(name, url, headers) {
  const file = new URL(`${name}.json`, CACHE_DIR);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  await wait(7000);
  const response = await fetch(url, { headers });
  const body = await response.json();
  const errors = body?.errors;
  if (!response.ok || (errors && Object.keys(errors).length > 0 && !Array.isArray(errors)) || (Array.isArray(errors) && errors.length)) {
    throw new Error(`${url} → ${response.status} ${JSON.stringify(errors ?? body?.message)}`);
  }
  writeFileSync(file, JSON.stringify(body));
  console.log(`  baixado: ${name}`);
  return body;
}

const fd = (code) =>
  cachedGet(`fd-${code}`, `https://api.football-data.org/v4/competitions/${code}/teams`, { "X-Auth-Token": FD_TOKEN });
const afLeague = (id) =>
  cachedGet(`af-league-${id}-${AF_SEASON}`, `https://v3.football.api-sports.io/teams?league=${id}&season=${AF_SEASON}`, { "x-apisports-key": AF_KEY });
const afSearch = (term) =>
  cachedGet(`af-search-${term.replace(/\W+/g, "_")}`, `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(term)}`, { "x-apisports-key": AF_KEY });

// ---- Comparação de nomes e estádios ----

const NOISE = new Set([
  "fc", "afc", "cf", "sc", "ac", "as", "ss", "ssc", "us", "rc", "rcd", "cd", "ud", "sd", "ca", "club", "de",
  "del", "la", "le", "les", "1", "bv", "vfb", "vfl", "tsg", "fsv", "sv", "bsc", "hsc", "ogc", "stade", "olympique",
  "calcio", "football", "futebol", "sporting", "sl", "sad", "fk", "hotspur", "and", "&", "cp", "us", "aj", "rb",
]);

function tokens(text) {
  return (text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t && !NOISE.has(t));
}

function similarity(a, b) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return 0;
  const shared = [...ta].filter((t) => tb.has(t)).length;
  return shared / Math.min(ta.size, tb.size); // 1 = todas as palavras do menor estão no maior
}

function score(fdTeam, afEntry) {
  const af = afEntry.team;
  const names = Math.max(
    similarity(fdTeam.name, af.name),
    similarity(fdTeam.shortName, af.name),
    similarity(fdTeam.name, af.code)
  );
  const venue = fdTeam.venue && afEntry.venue?.name ? similarity(fdTeam.venue, afEntry.venue.name) : 0;
  const code = fdTeam.tla && af.code && fdTeam.tla === af.code ? 0.3 : 0;
  return names + (venue >= 0.6 ? 0.6 : 0) + code;
}

function best(fdTeam, pool) {
  return pool
    .map((entry) => ({ entry, score: score(fdTeam, entry) }))
    .sort((a, b) => b.score - a.score)[0];
}

// ---- Execução ----

const links = new Map(); // fdId → { afId, city, fdName, afName, score }
const review = [];

for (const league of LEAGUES) {
  console.log(`\n${league.code}`);
  const fdTeams = (await fd(league.code)).teams;
  // Todas as listas do mesmo país: cobre promovidos (2ª divisão) e rebaixados (1ª divisão).
  const sameCountry = [...new Set(LEAGUES.filter((l) => l.country === league.country).flatMap((l) => l.af))];
  const pool = [];
  for (const id of sameCountry) pool.push(...(await afLeague(id)).response);

  for (const team of fdTeams) {
    if (links.has(team.id)) continue; // mesmo time em duas ligas (ex.: PL e ELC)
    let found = best(team, pool);

    // Não achou nas listas de 2024: busca pelo nome (1 requisição).
    if (!found || found.score < 0.85) {
      // 0.85 (e não 0.9): 0.6 + 0.3 dá 0.8999… em ponto flutuante.
      const term = tokens(team.shortName ?? team.name).join(" ");
      if (term.length >= 3 && searches < MAX_SEARCHES) {
        searches++;
        const results = (await afSearch(term)).response.filter(
          (r) => r.team.country === league.country && !r.team.national && !/\b(U\d\d|II|B|W)$/.test(r.team.name)
        );
        const searched = best(team, results);
        if (searched && (!found || searched.score > found.score)) found = searched;
      }
    }

    if (!found || found.score < 0.85) {
      review.push(`  ✗ sem par: ${team.name} (${league.code})`);
      continue;
    }
    const { entry, score: s } = found;
    links.set(team.id, {
      afId: entry.team.id,
      city: entry.venue?.city ?? "",
      fdName: team.name,
      afName: entry.team.name,
      score: s,
    });
    const mark = s < 1.3 ? "?" : "✓";
    console.log(`  ${mark} ${team.name.padEnd(32)} → ${entry.team.id} ${entry.team.name} (${s.toFixed(2)})`);
    if (s < 1.3) review.push(`  ? conferir: ${team.name} → ${entry.team.name} (${s.toFixed(2)})`);
  }
}

const body = [...links.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([fdId, l]) => `  "${fdId}": { apiFootballId: ${l.afId}, city: ${JSON.stringify(l.city)} }, // ${l.fdName} = ${l.afName}`)
  .join("\n");

writeFileSync(
  OUTPUT,
  `// GERADO por scripts/link-teams.mjs em ${new Date().toISOString().slice(0, 10)} — não edite à mão.
// Correções: ajuste team-links.ts (as entradas de lá têm prioridade sobre estas).
export const generatedTeamLinks: Record<string, { apiFootballId: number; city: string }> = {
${body}
};
`
);

console.log(`\n${links.size} times ligados → src/data/team-links.generated.ts`);
if (review.length) console.log(`\nPara revisar:\n${review.join("\n")}`);
