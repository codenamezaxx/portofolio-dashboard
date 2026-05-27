/**
 * SkeletonCard Component
 * 
 * A skeleton loading component that mimics the structure of a card.
 * Useful for displaying placeholder content while loading card data.
 */

import React from 'react';

export interface SkeletonCardProps {
  /**
   * Whether to show an image placeholder
   * @default true
   */
  showImage?: boolean;

  /**
   * Height of the image placeholder
   * @default 'h-40'
   */
  imageHeight?: string;

  /**
   * Number of text lines to display
   * @default 3
   */
  lines?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * ARIA label for accessibility
   * @default 'Loading card'
   */
  ariaLabel?: string;
}

/**
 * SkeletonCard Component
 * Displays a skeleton loading state for card components
 * 
 * @example
 * <SkeletonCard showImage={true} lines={3} />
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  imageHeight = 'h-40',
  lines = 3,
  className = '',
  ariaLabel = 'Loading card',
}) => {
  return (
    <div
      className={`
        bg-primary/5 dark:bg-white/5
        backdrop-blur-md
        rounded-lg overflow-hidden
        border border-primary/10 dark:border-white/10
        animate-pulse
        ${className}
      `}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {showImage && (
        <div
          className={`
            ${imageHeight}
            bg-primary/10 dark:bg-white/10
            animate-pulse
          `}
        />
      )}

      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div
          className="
            h-5
            bg-primary/10 dark:bg-white/10
            rounded
            animate-pulse
            w-3/4
          "
        />

        {/* Content lines skeleton */}
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="
              h-4
              bg-primary/10 dark:bg-white/10
              rounded
              animate-pulse
              w-full
            "
            style={{
              width: index === lines - 1 ? '80%' : '100%',
            }}
          />
        ))}

        {/* Footer skeleton (button area) */}
        <div className="flex gap-2 pt-2">
          <div
            className="
              h-8
              bg-primary/10 dark:bg-white/10
              rounded
              animate-pulse
              flex-1
            "
          />
          <div
            className="
              h-8
              bg-primary/10 dark:bg-white/10
              rounded
              animate-pulse
              flex-1
            "
          />
        </div>
      </div>
    </div>
  );
  };
SkeletonCard.displayName = 'SkeletonCard';
