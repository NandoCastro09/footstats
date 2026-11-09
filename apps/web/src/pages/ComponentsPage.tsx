import { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { AlertTriangle, CheckCircle2, Trash2, XCircle } from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import LeagueTable from "../components/LeagueTable";
import MatchCard from "../components/MatchCard";
import Modal from "../components/Modal";
import PlayerCard from "../components/PlayerCard";
import TeamCard from "../components/TeamCard";
import type { Match, Player, Standing, TeamSummary } from "../types";

const gre: TeamSummary = { id: "gremio", name: "Grêmio", shortName: "GRE", crest: null };
const fla: TeamSummary = { id: "flamengo", name: "Flamengo", shortName: "FLA", crest: null };
const pal: TeamSummary = { id: "palmeiras", name: "Palmeiras", shortName: "PAL", crest: null };
const sao: TeamSummary = { id: "sao-paulo", name: "São Paulo", shortName: "SAO", crest: null };
const bot: TeamSummary = { id: "botafogo", name: "Botafogo", shortName: "BOT", crest: null };
const vas: TeamSummary = { id: "vasco", name: "Vasco", shortName: "VAS", crest: null };

const matches: Match[] = [
  { id: "1", competition: "BSA", round: 32, homeTeam: gre, awayTeam: fla, homeScore: 2, awayScore: 1, status: "live", minute: 67, kickoff: "2026-11-04T22:00:00Z", venue: "Arena do Grêmio" },
  { id: "2", competition: "BSA", round: 32, homeTeam: sao, awayTeam: pal, homeScore: 1, awayScore: 1, status: "finished", minute: null, kickoff: "2026-11-02T19:00:00Z", venue: "Morumbis" },
  { id: "3", competition: "BSA", round: 33, homeTeam: bot, awayTeam: vas, homeScore: null, awayScore: null, status: "scheduled", minute: null, kickoff: "2026-11-08T22:30:00Z", venue: "Nilton Santos" },
];

const standings: Standing[] = [
  { position: 1, team: bot, played: 31, wins: 19, draws: 7, losses: 5, goalsFor: 55, goalsAgainst: 26, goalDifference: 29, points: 64, form: ["W", "W", "D", "W", "L"] },
  { position: 2, team: pal, played: 31, wins: 18, draws: 8, losses: 5, goalsFor: 50, goalsAgainst: 25, goalDifference: 25, points: 62, form: ["W", "D", "W", "W", "W"] },
  { position: 3, team: fla, played: 31, wins: 17, draws: 8, losses: 6, goalsFor: 52, goalsAgainst: 30, goalDifference: 22, points: 59, form: ["L", "W", "W", "D", "L"] },
  { position: 4, team: gre, played: 31, wins: 15, draws: 9, losses: 7, goalsFor: 44, goalsAgainst: 31, goalDifference: 13, points: 54, form: ["W", "W", "W", "D", "W"] },
  { position: 5, team: sao, played: 31, wins: 14, draws: 9, losses: 8, goalsFor: 40, goalsAgainst: 33, goalDifference: 7, points: 51, form: ["D", "L", "W", "D", "D"] },
];

const players: Player[] = [
  { id: "p1", name: "Everton Ribeiro", number: 7, position: "Meio-campo", nationality: "Brasil", age: 37, goals: 5, assists: 9, yellowCards: 3, injured: false, photo: null },
  { id: "p2", name: "Pedro", number: 9, position: "Atacante", nationality: "Brasil", age: 29, goals: 18, assists: 4, yellowCards: 1, injured: true, photo: null },
  { id: "p3", name: "Gerson", number: 8, position: "Meio-campo", nationality: "Brasil", age: 29, goals: 3, assists: 6, yellowCards: 7, injured: false, photo: null },
];

export default function ComponentsPage() {
  usePageTitle("Galeria de componentes");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-primary">Galeria de componentes</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Partidas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Classificação</h2>
        <LeagueTable standings={standings} caption="Brasileirão 2026" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Times</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {standings.slice(0, 3).map((standing) => (
            <TeamCard key={standing.team.id} standing={standing} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Jogadores</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Botões, badges e cards</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="cta">Ver ao vivo</Button>
          <Button variant="danger" icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}>
            Excluir
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Enviando</Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}>Vitória</Badge>
          <Badge variant="error" icon={<XCircle className="h-3.5 w-3.5" aria-hidden="true" />}>Derrota</Badge>
          <Badge variant="warning" icon={<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}>Cartão amarelo</Badge>
          <Badge variant="live">Ao vivo</Badge>
          <Badge variant="info">Agendado</Badge>
          <Badge>Encerrado</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card variant="stat">
            <p className="text-sm font-medium uppercase text-ink-muted">Chutes</p>
            <p className="font-display text-3xl font-bold">12</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm font-medium uppercase text-ink-muted">Posse de bola</p>
            <p className="font-display text-3xl font-bold">58%</p>
          </Card>
        </div>
      </section>

      <section className="max-w-md space-y-4">
        <h2 className="text-2xl font-bold">Input e Modal</h2>
        <Input label="Nome" required placeholder="Seu nome" />
        <Input label="E-mail" type="email" required error="Informe um e-mail válido." />
        <Button onClick={() => setIsModalOpen(true)}>Abrir modal</Button>
        <Modal
          isOpen={isModalOpen}
          title="Excluir palpite"
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => setIsModalOpen(false)}
          confirmText="Excluir"
          confirmVariant="danger"
        >
          <p>Tem certeza que deseja excluir este palpite? Essa ação não pode ser desfeita.</p>
        </Modal>
      </section>
    </div>
  );
}
