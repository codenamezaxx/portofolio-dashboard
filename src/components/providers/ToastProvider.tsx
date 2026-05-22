'use client';

import React, { useState } from 'react';
import {
  ToastProvider as ToastContextProvider,
  type ToastProviderProps as ToastContextProviderProps,
} from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export interface ToastProviderProps extends ToastContextProviderProps {}

/**
 * Complete Toast Provider Component
 * Wraps the ToastContext provider and includes the ToastContainer
 *
 * This component should be placed at the root of your application
 * to provide toast functionality to all child components.
 *
 * Usage:
 * ```tsx
 * // In your root layout or app component
 * import { ToastProvider } from '@/components/providers/ToastProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ToastProvider position="top-right" maxToasts={5}>
 *           {children}
 *         </ToastProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right',
}) => {
  return (
    <ToastContextProvider maxToasts={maxToasts} position={position}>
      <ToastContainerWrapper position={position} maxToasts={maxToasts}>
        {children}
      </ToastContainerWrapper>
    </ToastContextProvider>
  );
};

ToastProvider.displayName = 'ToastProvider';

interface ToastContainerWrapperProps {
  children: React.ReactNode;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts: number;
}

/**
 * Internal wrapper component that renders the ToastContainer
 * This is separated to ensure useToast hook is called within the provider
 */
const ToastContainerWrapper: React.FC<ToastContainerWrapperProps> = ({
  children,
  position,
  maxToasts,
}) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={position}
        maxToasts={maxToasts}
      />
      {children}
    </>
  );
};

ToastContainerWrapper.displayName = 'ToastContainerWrapper';
