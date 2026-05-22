/**
 * useError Hook
 * 
 * A custom hook for managing error state in components.
 * Provides methods to set, clear, and check error status.
 * Supports different error types for context-aware error handling.
 */

import { useState, useCallback } from 'react';

export type ErrorType = 'validation' | 'network' | 'server' | 'auth' | 'generic';

export interface ErrorInfo {
  message: string;
  type: ErrorType;
  description?: string;
}

export interface UseErrorReturn {
  error: ErrorInfo | null;
  hasError: boolean;
  setError: (message: string, type?: ErrorType, description?: string) => void;
  clearError: () => void;
  setErrorInfo: (error: ErrorInfo | null) => void;
}

/**
 * Hook for managing error state
 * @returns Object with error state and control methods
 * 
 * @example
 * const { error, hasError, setError, clearError } = useError();
 * 
 * const handleFetch = async () => {
 *   try {
 *     await fetchData();
 *     clearError();
 *   } catch (err) {
 *     setError('Failed to fetch data', 'network');
 *   }
 * };
 */
export function useError(): UseErrorReturn {
  const [error, setErrorState] = useState<ErrorInfo | null>(null);

  const setError = useCallback(
    (message: string, type: ErrorType = 'generic', description?: string) => {
      setErrorState({
        message,
        type,
        description,
      });
    },
    []
  );

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const setErrorInfo = useCallback((errorInfo: ErrorInfo | null) => {
    setErrorState(errorInfo);
  }, []);

  return {
    error,
    hasError: error !== null,
    setError,
    clearError,
    setErrorInfo,
  };
}
