interface Entry<T> {
  value: T;
  expiresAt: number;
}

export function createCache(now: () => number = Date.now) {
  const entries = new Map<string, Entry<unknown>>();
  const inFlight = new Map<string, Promise<unknown>>();

  async function get<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
    const entry = entries.get(key) as Entry<T> | undefined;
    if (entry && entry.expiresAt > now()) return entry.value;

    // Se a mesma chave já está sendo buscada, reaproveita a mesma promise
    // (10 usuários abrindo a tabela ao mesmo tempo = 1 requisição só).
    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const request = load()
      .then((value) => {
        entries.set(key, { value, expiresAt: now() + ttlMs });
        return value;
      })
      .catch((error) => {
        // Se a API externa falhar, devolve o dado vencido em vez de erro.
        if (entry) return entry.value;
        throw error;
      })
      .finally(() => inFlight.delete(key));

    inFlight.set(key, request);
    return request;
  }

  function peek<T>(key: string): T | undefined {
    return (entries.get(key) as Entry<T> | undefined)?.value;
  }

  return { get, peek, clear: () => entries.clear() };
}
