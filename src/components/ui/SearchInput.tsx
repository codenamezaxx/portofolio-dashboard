import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

/**
 * SearchInput Component
 * A specialized text input for search functionality with icon
 * Conforms to design system specifications with light and dark mode support
 * 
 * Design System Specs:
 * - Light: bg-surface-card border border-hairline rounded-md px-3 py-2 h-9 text-body font-body-md pl-10
 * - Dark: dark:bg-surface-card dark:border-hairline dark:text-body
 * 
 * @example
 * <SearchInput
 *   placeholder="Search projects..."
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 * />
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      label,
      error,
      helperText,
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
    const inputId = id || `search-input-${Math.random().toString(36).substr(2, 9)}`;
    const isDisabled = disabled || isLoading;

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-xs font-bold text-mute uppercase tracking-wider dark:text-mute"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute dark:text-mute pointer-events-none" />
          <input
            ref={ref}
            id={inputId}
            type="search"
            disabled={isDisabled}
            className={`
              w-full px-3 py-2 pl-10 border rounded-md
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

SearchInput.displayName = 'SearchInput';
