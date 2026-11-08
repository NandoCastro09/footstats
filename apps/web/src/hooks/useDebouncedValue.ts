import { useEffect, useState } from "react";

/** Devolve `value` só depois de `delay` ms sem mudanças (evita 1 requisição por tecla). */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
