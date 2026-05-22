import React from 'react';

export interface SkeletonLoaderProps {
  /**
   * Number of skeleton lines to display
   * @default 1
   */
  lines?: number;

  /**
   * Height of each skeleton line
   * @default 'h-4'
   */
  lineHeight?: string;

  /**
   * Width of the skeleton (can be full, percentage, or specific width)
   * @default 'w-full'
   */
  width?: string;

  /**
   * Gap between skeleton lines
   * @default 'gap-2'
   */
  gap?: string;

  /**
   * Whether to show a circular skeleton (for avatars)
   * @default false
   */
  isCircle?: boolean;

  /**
   * Size of circular skeleton
   * @default 'w-12 h-12'
   */
  circleSize?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * ARIA label for accessibility
   * @default 'Loading content'
   */
  ariaLabel?: string;
}

/**
 * SkeletonLoader Component
 * A reusable skeleton loading component for displaying placeholder content
 * Supports multiple lines, circular shapes, and customizable dimensions
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 1,
  lineHeight = 'h-4',
  width = 'w-full',
  gap = 'gap-2',
  isCircle = false,
  circleSize = 'w-12 h-12',
  className = '',
  ariaLabel = 'Loading content',
}) => {
  if (isCircle) {
    return (
      <div
        className={`
          ${circleSize}
          rounded-full
          bg-gray-200 dark:bg-gray-700
          animate-pulse
          ${className}
        `}
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
      />
    );
  }

  return (
    <div
      className={`flex flex-col ${gap} ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            ${width}
            ${lineHeight}
            rounded
            bg-gray-200 dark:bg-gray-700
            animate-pulse
            ${index === lines - 1 ? 'w-3/4' : ''}
          `}
        />
      ))}
    </div>
  );
};

SkeletonLoader.displayName = 'SkeletonLoader';
