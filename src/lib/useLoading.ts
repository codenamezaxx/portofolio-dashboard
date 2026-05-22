/**
 * useLoading Hook
 * 
 * A custom hook for managing loading state in components.
 * Provides methods to start, stop, and check loading status.
 * Useful for managing async operations and UI state.
 */

import { useState, useCallback } from 'react';

export interface UseLoadingReturn {
  isLoading: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Hook for managing loading state
 * @returns Object with loading state and control methods
 * 
 * @example
 * const { isLoading, start, stop } = useLoading();
 * 
 * const handleFetch = async () => {
 *   start();
 *   try {
 *     await fetchData();
 *   } finally {
 *     stop();
 *   }
 * };
 */
export function useLoading(initialState: boolean = false): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initialState);

  const start = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  const toggle = useCallback(() => {
    setIsLoading((prev) => !prev);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    start,
    stop,
    toggle,
    setLoading,
  };
}
