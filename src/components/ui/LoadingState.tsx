/**
 * LoadingState Component
 * 
 * Standardized loading indicator for different context (inline, page, overlay).
 * Features:
 * - Different visual variants
 * - Customizable message
 * - ARIA accessibility support
 * - Smooth animations
 */

'use client';

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingStateProps {
  /** Optional message to display */
  message?: string;
  /** Visual variant */
  variant?: 'inline' | 'page' | 'overlay';
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Optional CSS class */
  className?: string;
}

/**
 * LoadingState Component
 * Standardized loading state for the application
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  variant = 'inline',
  size = 'md',
  className = '',
}) => {
  const containerStyles = {
    inline: `
      flex flex-col items-center justify-center p-6 text-center
      bg-[var(--surface-soft)]/50 rounded-lg
    `,
    page: `
      flex flex-col items-center justify-center min-h-[400px] p-12 text-center
      bg-canvas dark:bg-canvas
    `,
    overlay: `
      absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center
      bg-white/80 dark:bg-[var(--surface-card)]/80 backdrop-blur-sm
    `,
  };

  const messageStyles = {
    sm: 'text-xs mt-2',
    md: 'text-sm mt-3',
    lg: 'text-base mt-4',
  };

  return (
    <div
      className={`${containerStyles[variant]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center animate-in fade-in duration-300">
        <LoadingSpinner size={size} />
        
        {message && (
          <p className={`${messageStyles[size]} font-medium text-[var(--mute)]`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
