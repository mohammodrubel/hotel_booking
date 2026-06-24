"use client";

import { useCallback, useState } from "react";

export interface MutationState<TArgs, TResult> {
  mutate: (args: TArgs) => Promise<TResult>;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  opts: {
    onSuccess?: (result: TResult, args: TArgs) => void | Promise<void>;
    onError?: (error: Error, args: TArgs) => void;
  } = {}
): MutationState<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(args);
        await opts.onSuccess?.(result, args);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        opts.onError?.(e, args);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [fn, opts]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
}
