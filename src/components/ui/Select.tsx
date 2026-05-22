import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
  options: SelectOption[];
  placeholder?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

/**
 * Select Component
 * A reusable select dropdown with label, error handling, helper text, and loading state
 * 
 * @example
 * <Select
 *   label="Category"
 *   options={categories}
 *   placeholder="Select a category"
 *   isLoading={isLoading}
 *   loadingMessage="Loading categories..."
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      containerClassName = '',
      className = '',
      id,
      options,
      placeholder,
      isLoading = false,
      loadingMessage,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const isDisabled = disabled || isLoading;

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={selectId}
              className="text-xs font-bold text-mute uppercase tracking-wider"
            >
              {label}
              {required && <span className="ml-1 text-accent-red">*</span>}
            </label>
          )}
          {isLoading && loadingMessage && (
            <span className="text-xs text-mute animate-pulse">
              {loadingMessage}
            </span>
          )}
        </div>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={isDisabled}
            className={`
              px-3 py-2 border rounded-md
              bg-surface-card
              text-foreground
              border-hairline
              focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue
              disabled:bg-surface-soft
              disabled:text-ash
              disabled:cursor-not-allowed
              transition-colors duration-200
              appearance-none
              bg-no-repeat bg-right
              pr-8
              h-9
              ${error ? 'border-accent-red focus:ring-accent-red/20' : ''}
              ${isLoading ? 'opacity-60' : ''}
              ${className}
            `}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234d4f46' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 8px center',
            }}
            aria-busy={isLoading}
            aria-disabled={isDisabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {isLoading && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-accent-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-mute">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
