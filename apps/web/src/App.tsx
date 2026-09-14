import Button from "./components/Button";
import Card from "./components/Card";
import Badge from "./components/Badge";

export default function App() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8">
          ⚽ FootStats - Component Gallery
        </h1>

        {/* BUTTONS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Buttons</h2>

          <div className="flex gap-4 flex-wrap">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="coral" size="md">
              Ver Ao Vivo
            </Button>
            <Button variant="primary" disabled>
              Desabilitado
            </Button>
          </div>
        </section>

        {/* CARDS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cards</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="match" status="live">
              <h3 className="font-bold text-lg mb-2">Grêmio vs Flamengo</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">2-1</p>
              <Badge variant="live">AO VIVO</Badge>
            </Card>

            <Card variant="match" status="finished">
              <h3 className="font-bold text-lg mb-2">São Paulo vs Palmeiras</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">1-1</p>
              <Badge variant="default">ENCERRADO</Badge>
            </Card>

            <Card variant="stat" status="scheduled">
              <h3 className="font-bold text-lg mb-2">Próximo Jogo</h3>
              <p className="text-gray-600 mb-2">Botafogo vs Vasco</p>
              <Badge variant="warning">19:45</Badge>
            </Card>
          </div>
        </section>

        {/* BADGES */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Badges</h2>

          <div className="flex gap-3 flex-wrap">
            <Badge variant="success">Vitória</Badge>
            <Badge variant="error">Derrota</Badge>
            <Badge variant="warning">Cartão Amarelo</Badge>
            <Badge variant="live">AO VIVO</Badge>
            <Badge variant="default">Empate</Badge>
          </div>
        </section>

        {/* STAT CARDS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stat Cards (Stats)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="stat">
              <p className="text-gray-600 text-sm uppercase font-medium mb-1">
                Chutes
              </p>
              <p className="text-3xl font-bold text-gray-900">12</p>
              <p className="text-xs text-green-600 mt-1">+2 vs última rodada</p>
            </Card>

            <Card variant="stat">
              <p className="text-gray-600 text-sm uppercase font-medium mb-1">
                Posse de Bola
              </p>
              <p className="text-3xl font-bold text-gray-900">58%</p>
              <p className="text-xs text-green-600 mt-1">+5% vs última rodada</p>
            </Card>

            <Card variant="stat">
              <p className="text-gray-600 text-sm uppercase font-medium mb-1">
                Faltas
              </p>
              <p className="text-3xl font-bold text-gray-900">8</p>
              <p className="text-xs text-red-600 mt-1">-2 vs última rodada</p>
            </Card>

            <Card variant="stat">
              <p className="text-gray-600 text-sm uppercase font-medium mb-1">
                Passes Certos
              </p>
              <p className="text-3xl font-bold text-gray-900">89%</p>
              <p className="text-xs text-gray-600 mt-1">consistente</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}