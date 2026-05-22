/**
 * SkeletonText Component
 * 
 * A skeleton loading component that mimics text content.
 * Useful for displaying placeholder content while loading text data.
 */

import React from 'react';

export interface SkeletonTextProps {
  /**
   * Number of lines to display
   * @default 3
   */
  lines?: number;

  /**
   * Height of each line
   * @default 'h-4'
   */
  lineHeight?: string;

  /**
   * Gap between lines
   * @default 'gap-2'
   */
  gap?: string;

  /**
   * Width of the skeleton
   * @default 'w-full'
   */
  width?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * ARIA label for accessibility
   * @default 'Loading text'
   */
  ariaLabel?: string;
}

/**
 * SkeletonText Component
 * Displays a skeleton loading state for text content
 * 
 * @example
 * <SkeletonText lines={4} lineHeight="h-5" />
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 'h-4',
  gap = 'gap-2',
  width = 'w-full',
  className = '',
  ariaLabel = 'Loading text',
}) => {
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
          `}
          style={{
            width: index === lines - 1 ? '80%' : '100%',
          }}
        />
      ))}
    </div>
  );
};

SkeletonText.displayName = 'SkeletonText';
