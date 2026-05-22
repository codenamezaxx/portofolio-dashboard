import React from 'react';

export interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * FormError Component
 * A component for displaying form-level error messages
 */
export const FormError: React.FC<FormErrorProps> = ({
  message,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`
        p-3 rounded-md
        bg-red-50 dark:bg-red-900/20
        border border-red-200 dark:border-red-800
        text-red-700 dark:text-red-400
        text-sm
        ${className}
      `}
    >
      {message}
    </div>
  );
};

FormError.displayName = 'FormError';
