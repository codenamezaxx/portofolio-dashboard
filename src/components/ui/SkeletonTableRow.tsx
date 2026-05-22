/**
 * SkeletonTableRow Component
 * 
 * A skeleton loading component that mimics the structure of a table row.
 * Useful for displaying placeholder content while loading table data.
 */

import React from 'react';

export interface SkeletonTableRowProps {
  /**
   * Number of columns in the table
   * @default 4
   */
  columns?: number;

  /**
   * Width of each column (can be array for different widths)
   * @default 'w-full'
   */
  columnWidths?: string | string[];

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * ARIA label for accessibility
   * @default 'Loading table row'
   */
  ariaLabel?: string;
}

/**
 * SkeletonTableRow Component
 * Displays a skeleton loading state for table rows
 * 
 * @example
 * <SkeletonTableRow columns={4} columnWidths={['w-1/4', 'w-1/4', 'w-1/4', 'w-1/4']} />
 */
export const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({
  columns = 4,
  columnWidths = 'w-full',
  className = '',
  ariaLabel = 'Loading table row',
}) => {
  const widths = Array.isArray(columnWidths)
    ? columnWidths
    : Array(columns).fill(columnWidths);

  return (
    <tr
      className={`
        border-b border-gray-200 dark:border-gray-700
        ${className}
      `}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {Array.from({ length: columns }).map((_, index) => (
        <td
          key={index}
          className="px-4 py-3"
        >
          <div
            className={`
              h-4
              bg-gray-200 dark:bg-gray-700
              rounded
              animate-pulse
              ${widths[index] || 'w-full'}
            `}
          />
        </td>
      ))}
    </tr>
  );
};

SkeletonTableRow.displayName = 'SkeletonTableRow';
