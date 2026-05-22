/**
 * useAsync Hook
 * 
 * A comprehensive hook for handling async operations with loading and error states.
 * Automatically manages loading state during async operations and captures errors.
 * Supports manual state control and automatic cleanup.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ErrorType } from './useError';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: {
    message: string;
    type: ErrorType;
    description?: string;
  } | null;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: <R = T>(
    asyncFn: () => Promise<R>,
    onSuccess?: (data: R) => void,
    onError?: (error: Error) => void
  ) => Promise<R | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (message: string, type?: ErrorType, description?: string) => void;
  clearError: () => void;
}

/**
 * Hook for handling async operations with loading and error states
 * @param initialData - Initial data value
 * @returns Object with async state and control methods
 * 
 * @example
 * const { data, isLoading, error, execute } = useAsync<User>(null);
 * 
 * const handleFetch = async () => {
 *   await execute(
 *     () => fetchUser(id),
 *     (user) => console.log('Success:', user),
 *     (err) => console.error('Error:', err)
 *   );
 * };
 */
export function useAsync<T = unknown>(initialData: T | null = null): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async <R = T,>(
      asyncFn: () => Promise<R>,
      onSuccess?: (data: R) => void,
      onError?: (error: Error) => void
    ): Promise<R | null> => {
      if (!isMountedRef.current) return null;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await asyncFn();

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            data: (result as unknown) as T,
            isLoading: false,
            error: null,
          }));

          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: {
              message: error.message || 'An error occurred',
              type: 'generic' as ErrorType,
              description: error.message,
            },
          }));

          onError?.(error);
        }

        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({
        data: initialData,
        isLoading: false,
        error: null,
      });
    }
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        data,
      }));
    }
  }, []);

  const setError = useCallback(
    (message: string, type: ErrorType = 'generic', description?: string) => {
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          error: {
            message,
            type,
            description,
          },
        }));
      }
    },
    []
  );

  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        error: null,
      }));
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    clearError,
  };
}
