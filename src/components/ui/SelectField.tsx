/**
 * SelectField Component
 * 
 * A wrapper component that integrates select inputs with validation state.
 * Automatically displays errors and manages touched state.
 */

import React, { forwardRef } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  containerClassName?: string;
  touched?: boolean;
  variant?: 'default' | 'admin';
}

/**
 * SelectField Component
 * A reusable select field with integrated validation display
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
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
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const showError = touched && error;

    const baseStyles = {
      default: {
        container: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-[var(--foreground)]',
        select: `
          px-3 py-2 border rounded-md
          bg-[var(--surface-card)]
          text-[var(--foreground)]
          border-[var(--hairline)]
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
        select: `
          px-3 py-2 bg-[var(--surface-card)] border border-[var(--hairline)]
          text-[var(--foreground)] rounded-lg focus:outline-none focus:border-accent-blue/50
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
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            ${styles.select}
            ${showError ? 'border-accent-red focus:ring-accent-red/20' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {showError && <p className={styles.error}>{error}</p>}
        {helperText && !showError && <p className={styles.helper}>{helperText}</p>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
