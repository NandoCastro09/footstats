interface Entry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache em memória com validade (TTL), pensado para APIs com limite de
 * requisições:
 * - várias chamadas simultâneas para a mesma chave fazem UMA requisição;
 * - se a atualização falhar, devolve o último valor bom (mesmo vencido).
 */
export function createCache(now: () => number = Date.now) {
  const entries = new Map<string, Entry<unknown>>();
  const inFlight = new Map<string, Promise<unknown>>();

  async function get<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
    const entry = entries.get(key) as Entry<T> | undefined;
    if (entry && entry.expiresAt > now()) return entry.value;

    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const request = load()
      .then((value) => {
        entries.set(key, { value, expiresAt: now() + ttlMs });
        return value;
      })
      .catch((error) => {
        if (entry) return entry.value; // dado vencido é melhor que nenhum
        throw error;
      })
      .finally(() => inFlight.delete(key));

    inFlight.set(key, request);
    return request;
  }

  /** Último valor guardado (mesmo vencido), sem disparar requisição. */
  function peek<T>(key: string): T | undefined {
    return (entries.get(key) as Entry<T> | undefined)?.value;
  }

  return { get, peek, clear: () => entries.clear() };
}
