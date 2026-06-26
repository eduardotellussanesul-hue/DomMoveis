import { useState, useCallback } from 'react';

type ApiFunction<T, P extends any[] = []> = (...args: P) => Promise<T>;

export function useApi<T, P extends any[] = []>(
  apiFn: ApiFunction<T, P>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  return { data, loading, error, execute };
}