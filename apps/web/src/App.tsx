import { useState } from "react";
import Button from "./components/Button";
import Card from "./components/Card";
import Badge from "./components/Badge";
import MatchCard from "./components/MatchCard";
import TeamCard from "./components/TeamCard";
import LeagueTable from "./components/LeagueTable";
import PlayerCard from "./components/PlayerCard";
import Modal from "./components/Modal";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const leagueTeams = [
    {
      position: 1,
      name: "Botafogo",
      played: 20,
      wins: 15,
      draws: 3,
      losses: 2,
      goalsFor: 48,
      goalsAgainst: 18,
      points: 48,
    },
    {
      position: 2,
      name: "Grêmio",
      played: 20,
      wins: 13,
      draws: 5,
      losses: 2,
      goalsFor: 42,
      goalsAgainst: 16,
      points: 44,
    },
    {
      position: 3,
      name: "Flamengo",
      played: 20,
      wins: 12,
      draws: 4,
      losses: 4,
      goalsFor: 38,
      goalsAgainst: 20,
      points: 40,
    },
    {
      position: 4,
      name: "São Paulo",
      played: 20,
      wins: 11,
      draws: 3,
      losses: 6,
      goalsFor: 35,
      goalsAgainst: 24,
      points: 36,
    },
    {
      position: 5,
      name: "Palmeiras",
      played: 20,
      wins: 10,
      draws: 5,
      losses: 5,
      goalsFor: 34,
      goalsAgainst: 22,
      points: 35,
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8">
          ⚽ FootStats - Component Gallery
        </h1>

        {/* MATCH CARDS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Partidas</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MatchCard
              team1="Grêmio"
              team2="Flamengo"
              score1={2}
              score2={1}
              status="live"
            />
            <MatchCard
              team1="São Paulo"
              team2="Palmeiras"
              score1={1}
              score2={1}
              status="finished"
            />
            <MatchCard
              team1="Botafogo"
              team2="Vasco"
              score1={0}
              score2={0}
              status="scheduled"
              time="19:45"
            />
          </div>
        </section>

        {/* TEAM CARDS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Times</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TeamCard
              name="Grêmio"
              position={1}
              points={48}
              wins={15}
              draws={3}
              losses={2}
              goalsFor={42}
              goalsAgainst={16}
            />
            <TeamCard
              name="Botafogo"
              position={2}
              points={44}
              wins={13}
              draws={5}
              losses={2}
              goalsFor={48}
              goalsAgainst={18}
            />
            <TeamCard
              name="Flamengo"
              position={3}
              points={40}
              wins={12}
              draws={4}
              losses={4}
              goalsFor={38}
              goalsAgainst={20}
            />
          </div>
        </section>

        {/* PLAYER CARDS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Jogadores</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlayerCard
              name="Everton Ribeiro"
              position="Meio-campo"
              number={7}
              goals={5}
              assists={9}
            />
            <PlayerCard
              name="Pedro"
              position="Atacante"
              number={9}
              goals={18}
              assists={4}
              injured
            />
            <PlayerCard
              name="Gerson"
              position="Meio-campo"
              number={8}
              height="1.79m"
              goals={3}
              assists={6}
            />
          </div>
        </section>

        {/* MODAL */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Modal</h2>

          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Abrir Modal
          </Button>

          <Modal
            isOpen={isModalOpen}
            title="Confirmar ação"
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => setIsModalOpen(false)}
          >
            <p className="text-gray-700">
              Tem certeza que deseja continuar?
            </p>
          </Modal>
        </section>

        {/* LEAGUE TABLE */}
        <section className="mb-12">
          <LeagueTable teams={leagueTeams} title="Brasileirão 2024" />
        </section>

        {/* COMPONENTS BASICS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Componentes Básicos
          </h2>

          <div className="space-y-6">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Buttons</h3>
              <div className="flex gap-4 flex-wrap">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="coral" size="md">
                  Ver Ao Vivo
                </Button>
                <Button variant="primary" disabled>
                  Desabilitado
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Badges</h3>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="success">Vitória</Badge>
                <Badge variant="error">Derrota</Badge>
                <Badge variant="warning">Cartão Amarelo</Badge>
                <Badge variant="live">AO VIVO</Badge>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="stat">
                  <p className="text-gray-600 text-sm uppercase font-medium mb-1">
                    Chutes
                  </p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </Card>
                <Card variant="stat">
                  <p className="text-gray-600 text-sm uppercase font-medium mb-1">
                    Posse de Bola
                  </p>
                  <p className="text-3xl font-bold text-gray-900">58%</p>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}