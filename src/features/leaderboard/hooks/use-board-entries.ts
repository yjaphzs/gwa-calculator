"use client";

import { useEffect, useState } from "react";

type Subscribe<T> = (
  schoolId: string,
  callback: (entries: T[]) => void,
  onError?: (err: Error) => void,
) => () => void;

/**
 * Live entries for one school's board. `entries` is null while loading;
 * on error it becomes [] with `error` set.
 */
export function useBoardEntries<T>(schoolId: string, subscribe: Subscribe<T>) {
  const [entries, setEntries] = useState<T[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setEntries(null);
    setError(false);
    return subscribe(schoolId, setEntries, () => {
      setError(true);
      setEntries([]);
    });
  }, [schoolId, subscribe]);

  return { entries, error };
}
