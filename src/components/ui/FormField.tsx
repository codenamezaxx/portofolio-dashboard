/**
 * FormField Component
 * 
 * A wrapper component that integrates form inputs with validation state.
 * Automatically displays errors and manages touched state.
 */

import React, { forwardRef } from 'react';

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
  touched?: boolean;
  variant?: 'default' | 'admin';
}

/**
 * FormField Component
 * A reusable form field with integrated validation display
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      containerClassName = '',
      className = '',
      id,
      touched,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const inputId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const showError = touched && error;

    const baseStyles = {
      default: {
        container: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-[var(--foreground)]',
        input: `
          px-3 py-2 border rounded-md
          bg-[var(--surface-card)]
          text-[var(--foreground)]
          border-[var(--hairline)]
          placeholder-[var(--mute)]
          focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-transparent
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition-colors duration-200
        `,
        error: 'text-sm text-accent-red',
        helper: 'text-sm text-[var(--mute)]',
      },
      admin: {
        container: 'flex flex-col gap-2',
        label: 'text-sm font-medium text-[var(--foreground)]',
        input: `
          px-3 py-2 bg-[var(--surface-card)] border border-[var(--hairline)]
          text-[var(--foreground)] placeholder-[var(--mute)]
          rounded-lg focus:outline-none focus:border-accent-blue/50
          focus:ring-1 focus:ring-accent-blue/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `,
        error: 'text-sm text-accent-red',
        helper: 'text-sm text-[var(--mute)]',
      },
    };

    const styles = baseStyles[variant];

    return (
      <div className={`${styles.container} ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            ${styles.input}
            ${showError ? 'border-accent-red focus:ring-accent-red/20' : ''}
            ${className}
          `}
          {...props}
        />
        {showError && <p className={styles.error}>{error}</p>}
        {helperText && !showError && <p className={styles.helper}>{helperText}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
