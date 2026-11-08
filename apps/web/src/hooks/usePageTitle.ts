import { useEffect } from "react";

/** Define o <title> da aba: "Partidas · FootStats". */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · FootStats`;
  }, [title]);
}
