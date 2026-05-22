import React, { forwardRef, useId } from 'react';

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

/**
 * TextInput Component
 * A reusable text input field with label, error handling, helper text, and loading state
 * Conforms to design system specifications with light and dark mode support
 * 
 * Design System Specs:
 * - Light: bg-surface-card border border-hairline rounded-md px-3 py-2 h-9 text-body font-body-md
 * - Focused: 2px accent-blue border with focus ring
 * - Dark: dark:bg-surface-card dark:border-hairline dark:text-body
 * 
 * @example
 * <TextInput
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   isLoading={isSubmitting}
 *   loadingMessage="Validating..."
 * />
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      containerClassName = '',
      className = '',
      id,
      isLoading = false,
      loadingMessage,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const isDisabled = disabled || isLoading;

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-body-xs font-bold text-mute uppercase tracking-wider dark:text-mute"
            >
              {label}
              {required && <span className="ml-1 text-accent-red dark:text-accent-red">*</span>}
            </label>
          )}
          {isLoading && loadingMessage && (
            <span className="text-body-xs text-mute animate-pulse dark:text-mute">
              {loadingMessage}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            disabled={isDisabled}
            className={`
              w-full px-3 py-2 border rounded-md
              bg-surface-card text-body font-body-md
              border-hairline
              placeholder-mute
              focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/50
              disabled:bg-surface-soft disabled:text-ash disabled:cursor-not-allowed
              transition-all duration-200
              h-9
              dark:bg-surface-card dark:text-body dark:border-hairline dark:placeholder-mute
              dark:focus:border-accent-blue dark:focus:ring-accent-blue/50
              dark:disabled:bg-surface-soft dark:disabled:text-ash
              ${error ? 'border-accent-red focus:ring-accent-red/20 dark:border-accent-red dark:focus:ring-accent-red/20' : ''}
              ${isLoading ? 'opacity-60' : ''}
              ${className}
            `}
            aria-busy={isLoading}
            aria-disabled={isDisabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin dark:border-accent-blue dark:border-t-transparent" />
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-body-xs font-medium text-accent-red dark:text-accent-red">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-body-xs text-mute dark:text-mute">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
