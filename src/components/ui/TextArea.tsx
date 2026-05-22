import React, { forwardRef, useId } from 'react';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
  showCharCount?: boolean;
  maxLength?: number;
  isLoading?: boolean;
  loadingMessage?: string;
}

/**
 * TextArea Component
 * A reusable textarea field with label, error handling, helper text, character count, and loading state
 * 
 * @example
 * <TextArea
 *   label="Description"
 *   placeholder="Enter description"
 *   showCharCount
 *   maxLength={500}
 *   isLoading={isSubmitting}
 *   loadingMessage="Saving..."
 * />
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      containerClassName = '',
      className = '',
      id,
      showCharCount = false,
      maxLength,
      value,
      isLoading = false,
      loadingMessage,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const charCount = typeof value === 'string' ? value.length : 0;
    const isDisabled = disabled || isLoading;

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-bold text-mute uppercase tracking-wider"
            >
              {label}
              {required && <span className="ml-1 text-accent-red">*</span>}
            </label>
          )}
          <div className="flex items-center gap-2">
            {isLoading && loadingMessage && (
              <span className="text-xs text-mute animate-pulse">
                {loadingMessage}
              </span>
            )}
            {showCharCount && maxLength && (
              <span className="text-xs text-mute">
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            maxLength={maxLength}
            value={value}
            disabled={isDisabled}
            className={`
              px-3 py-2 border rounded-md
              bg-surface-card
              text-foreground
              border-hairline
              placeholder-stone
              focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue
              disabled:bg-surface-soft
              disabled:text-ash
              disabled:cursor-not-allowed
              transition-all duration-200
              resize-vertical min-h-[120px]
              ${error ? 'border-accent-red focus:ring-accent-red/20' : ''}
              ${isLoading ? 'opacity-60' : ''}
              ${className}
            `}
            aria-busy={isLoading}
            aria-disabled={isDisabled}
            {...props}
          />
          {isLoading && (
            <div className="absolute right-3 top-3">
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

TextArea.displayName = 'TextArea';
