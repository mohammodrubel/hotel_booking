"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (next: T | ((prev: T | null) => T)) => void;
}

export function useQuery<T>(
  fn: () => Promise<T>,
  deps: readonly unknown[] = [],
  opts: { enabled?: boolean; initialData?: T } = {}
): QueryState<T> {
  const enabled = opts.enabled ?? true;
  const [data, setDataState] = useState<T | null>(opts.initialData ?? null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);
  const tokenRef = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    if (!enabled) return;
    const token = ++tokenRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (tokenRef.current === token) setDataState(result);
    } catch (err) {
      if (tokenRef.current === token) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (tokenRef.current === token) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((next: T | ((prev: T | null) => T)) => {
    setDataState((prev) =>
      typeof next === "function" ? (next as (p: T | null) => T)(prev) : next
    );
  }, []);

  return { data, loading, error, refetch: run, setData };
}
