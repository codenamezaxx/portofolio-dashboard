/**
 * ErrorState Component
 * 
 * Provides a standardized way to display error messages across the application.
 * Features:
 * - Title and message display
 * - Optional retry action
 * - Variant support (inline, full-page, overlay)
 * - Accessibility support (ARIA roles)
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  /** The error title */
  title?: string;
  /** The error message or description */
  message: string;
  /** Optional callback for retry action */
  onRetry?: () => void;
  /** Optional label for retry button (defaults to 'Retry') */
  retryLabel?: string;
  /** Visual variant */
  variant?: 'inline' | 'page' | 'overlay';
  /** Optional CSS class for container */
  className?: string;
  /** Optional error object for debugging (not shown to user) */
  error?: Error | unknown;
}

/**
 * ErrorState Component
 * Standardized error display with retry capability
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Retry',
  variant = 'inline',
  className = '',
  error,
}) => {
  // Log detailed error to console if provided
  if (error) {
    console.error('[ErrorState]', error);
  }

  const containerStyles = {
    inline: `
      flex flex-col items-center justify-center p-6 text-center
      bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg
    `,
    page: `
      flex flex-col items-center justify-center min-h-[400px] p-12 text-center
      bg-canvas dark:bg-canvas
    `,
    overlay: `
      absolute inset-0 z-50 flex items-center justify-center p-6 text-center
      bg-white/80 dark:bg-[var(--surface-card)]/80 backdrop-blur-sm
    `,
  };

  const iconStyles = {
    inline: 'w-8 h-8 text-red-500 mb-3',
    page: 'w-16 h-16 text-red-500 mb-6',
    overlay: 'w-12 h-12 text-red-500 mb-4',
  };

  const titleStyles = {
    inline: 'text-base font-bold text-red-700 dark:text-red-400 mb-1',
    page: 'text-2xl font-bold text-[var(--foreground)] mb-2',
    overlay: 'text-xl font-bold text-[var(--foreground)] mb-2',
  };

  const messageStyles = {
    inline: 'text-sm text-red-600 dark:text-red-300',
    page: 'text-lg text-[var(--mute)] max-w-md',
    overlay: 'text-base text-[var(--mute)] max-w-sm',
  };

  return (
    <div
      className={`${containerStyles[variant]} ${className}`}
      role="alert"
      aria-live="assertive"
      aria-labelledby="error-title"
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <AlertTriangle className={iconStyles[variant]} aria-hidden="true" />
        
        <h2 id="error-title" className={titleStyles[variant]}>
          {title}
        </h2>
        
        <p className={messageStyles[variant]}>
          {message}
        </p>

        {onRetry && (
          <div className="mt-6">
            <Button
              variant={variant === 'inline' ? 'secondary' : 'primary'}
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              {retryLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
