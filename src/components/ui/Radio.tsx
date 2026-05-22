import React, { forwardRef } from 'react';

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
  options: RadioOption[];
  groupName: string;
}

/**
 * Radio Component
 * A reusable radio button group with label, error handling, and helper text
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      containerClassName = '',
      className = '',
      options,
      groupName,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-2 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <input
                ref={ref}
                type="radio"
                id={`${groupName}-${option.value}`}
                name={groupName}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                disabled={option.disabled}
                className={`
                  w-4 h-4 rounded-full
                  bg-white dark:bg-gray-800
                  border-gray-300 dark:border-gray-600
                  text-blue-600 dark:text-blue-500
                  focus:ring-2 focus:ring-blue-500
                  disabled:bg-gray-100 dark:disabled:bg-gray-700
                  disabled:cursor-not-allowed
                  transition-colors duration-200
                  cursor-pointer
                  ${error ? 'border-red-500' : ''}
                  ${className}
                `}
                {...props}
              />
              <label
                htmlFor={`${groupName}-${option.value}`}
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
