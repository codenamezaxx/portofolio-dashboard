'use client';

import React, { createContext, useCallback, useState } from 'react';
import { ToastMessage, ToastType } from '@/components/ui/Toast';

export interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (
    message: string,
    type: ToastType,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, options?: { duration?: number }) => string;
  error: (message: string, options?: { duration?: number }) => string;
  warning: (message: string, options?: { duration?: number }) => string;
  info: (message: string, options?: { duration?: number }) => string;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Toast Provider Component
 * Provides toast notification functionality to the entire application
 *
 * Features:
 * - Global toast state management
 * - Multiple toast types (success, error, warning, info)
 * - Convenience methods for each type
 * - Configurable max toasts and position
 * - Auto-dismiss with customizable duration
 * - Optional action buttons
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType,
      options?: {
        duration?: number;
        action?: {
          label: string;
          onClick: () => void;
        };
      }
    ): string => {
      const id = `toast-${Date.now()}-${Math.random()}`;

      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration: options?.duration ?? 5000,
        action: options?.action,
      };

      setToasts((prevToasts) => {
        const updated = [...prevToasts, newToast];
        // Keep only the most recent maxToasts
        return updated.slice(-maxToasts);
      });

      return id;
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, options?: { duration?: number }): string => {
      return addToast(message, 'success', options);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: { duration?: number }): string => {
      return addToast(message, 'error', options);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: { duration?: number }): string => {
      return addToast(message, 'warning', options);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: { duration?: number }): string => {
      return addToast(message, 'info', options);
    },
    [addToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';
