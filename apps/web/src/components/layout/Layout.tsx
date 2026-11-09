import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RouteSkeleton } from "../skeletons/PageSkeletons";
import BottomNav from "./BottomNav";
import DemoBanner from "./DemoBanner";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Ao trocar de página: volta ao topo e leva o foco para o conteúdo (leitor de tela anuncia a página nova).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div
      className="flex min-h-screen flex-col pb-20 lg:pb-0"
    >
      <a
        href="#conteudo"
        className="sr-only z-[70] rounded-control bg-primary-solid px-4 py-3 font-semibold text-ink-inverse shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <DemoBanner />
      <main
        id="conteudo"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto min-h-screen w-full max-w-6xl flex-1 px-4 py-8 outline-none"
      >
        <Suspense fallback={<RouteSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
