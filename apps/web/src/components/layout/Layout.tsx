import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SkeletonGrid } from "../Skeleton";
import DemoBanner from "./DemoBanner";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Ao trocar de página, leva o foco para o conteúdo (leitor de tela anuncia a nova página).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only z-[70] rounded-control bg-white px-4 py-3 font-semibold text-primary shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <DemoBanner />
      <main
        id="conteudo"
        ref={mainRef}
        tabIndex={-1}
        // min-h-screen: o rodapé fica sempre abaixo da dobra, então a troca
        // skeleton → conteúdo não "empurra" o rodapé na tela (evita CLS).
        className="mx-auto min-h-screen w-full max-w-6xl flex-1 px-4 py-8 outline-none"
      >
        {/* Enquanto o código da página (lazy) é baixado. */}
        <Suspense fallback={<SkeletonGrid count={6} label="Carregando página…" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
