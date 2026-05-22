'use client';

import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Button Component
 * A reusable button with multiple variants, sizes, and loading state
 * Conforms to the design system specifications with light and dark mode support
 * 
 * Variants:
 * - primary: Gold background (#B8860B) with deep olive text, 40px height
 * - secondary: Soft cream background with ink text, 40px height
 * - tertiary: Transparent background with ink text
 * - danger: Red accent background with white text
 * - ghost: Transparent with hover effect
 * - outline: Transparent with border
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      font-button-md rounded-md
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-1
      dark:focus:ring-offset-surface-card
      disabled:cursor-not-allowed
      inline-flex items-center justify-center gap-2
    `;

    const variantStyles = {
      // Primary: Gold background, deep olive text, 40px height
      primary: `
        bg-primary text-on-primary
        hover:bg-primary-pressed active:bg-primary-active
        disabled:bg-surface-soft disabled:text-ash
        dark:bg-primary dark:text-on-primary
        dark:hover:bg-primary-pressed dark:active:bg-primary-active
        dark:disabled:bg-surface-soft dark:disabled:text-ash
      `,
      // Secondary: Soft cream background, ink text, 40px height
      secondary: `
        bg-surface-soft text-ink
        hover:bg-surface-soft/80 active:bg-surface-soft/60
        disabled:bg-surface-soft disabled:text-ash
        dark:bg-surface-soft dark:text-ink
        dark:hover:bg-surface-soft/80 dark:active:bg-surface-soft/60
        dark:disabled:bg-surface-soft dark:disabled:text-ash
      `,
      // Tertiary: Transparent background, ink text
      tertiary: `
        bg-transparent text-ink
        hover:bg-surface-soft/50 active:bg-surface-soft/70
        disabled:text-ash
        dark:text-ink
        dark:hover:bg-surface-soft/20 dark:active:bg-surface-soft/30
        dark:disabled:text-ash
      `,
      // Danger: Red accent background
      danger: `
        bg-accent-red-soft text-accent-red
        hover:bg-accent-red hover:text-white
        disabled:bg-surface-soft disabled:text-ash
        dark:bg-accent-red-soft dark:text-accent-red
        dark:hover:bg-accent-red dark:hover:text-white
        dark:disabled:bg-surface-soft dark:disabled:text-ash
      `,
      // Ghost: Transparent with subtle hover
      ghost: `
        bg-transparent text-body
        hover:bg-surface-soft/50 active:bg-surface-soft/70
        disabled:text-ash
        dark:text-body
        dark:hover:bg-surface-soft/20 dark:active:bg-surface-soft/30
        dark:disabled:text-ash
      `,
      // Outline: Transparent with border
      outline: `
        bg-transparent text-body border border-hairline
        hover:bg-surface-soft/50 active:bg-surface-soft/70
        disabled:border-hairline disabled:text-ash
        dark:text-body dark:border-hairline
        dark:hover:bg-surface-soft/20 dark:active:bg-surface-soft/30
        dark:disabled:border-hairline dark:disabled:text-ash
      `,
    };

    const sizeStyles = {
      sm: 'px-3 py-1 text-xs h-8',
      md: 'px-4 py-2 h-10',
      lg: 'px-6 py-3 text-base h-12',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyle}
          ${className}
        `}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
