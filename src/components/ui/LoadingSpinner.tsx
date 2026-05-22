import React from 'react';

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Color of the spinner
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';

  /**
   * Optional label text displayed below the spinner
   */
  label?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * ARIA label for accessibility
   * @default 'Loading'
   */
  ariaLabel?: string;
}

/**
 * LoadingSpinner Component
 * A reusable spinner component for indicating loading states
 * Supports different sizes and colors with accessibility features
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  className = '',
  ariaLabel = 'Loading',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-yellow-500',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-2 border-gray-200 dark:border-gray-700
          ${colorClasses[color]}
          rounded-full
          animate-spin
        `}
      />
      {label && (
        <p
          className={`
            ${labelSizeClasses[size]}
            text-gray-600 dark:text-gray-400
          `}
        >
          {label}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';
