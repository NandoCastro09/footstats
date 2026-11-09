import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import LeagueProvider from "./league/LeagueProvider";
import MatchesPage from "./pages/MatchesPage";

// Páginas carregadas sob demanda: quem abre "Partidas" não baixa o código do
// formulário (zod + react-hook-form) nem das outras telas.
const StandingsPage = lazy(() => import("./pages/StandingsPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const MatchPage = lazy(() => import("./pages/MatchPage"));
const PredictionsPage = lazy(() => import("./pages/PredictionsPage"));
const ComponentsPage = lazy(() => import("./pages/ComponentsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const LeaguesPage = lazy(() => import("./pages/LeaguesPage"));

export default function App() {
  return (
    <LeagueProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<MatchesPage />} />
          <Route path="classificacao" element={<StandingsPage />} />
          <Route path="partidas/:id" element={<MatchPage />} />
          <Route path="times/:id" element={<TeamPage />} />
          <Route path="palpites" element={<PredictionsPage />} />
          <Route path="ligas" element={<LeaguesPage />} />
          <Route path="componentes" element={<ComponentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </LeagueProvider>
  );
}
