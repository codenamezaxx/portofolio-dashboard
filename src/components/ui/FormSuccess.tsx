import React from 'react';

export interface FormSuccessProps {
  message?: string;
  className?: string;
}

/**
 * FormSuccess Component
 * A component for displaying form-level success messages
 */
export const FormSuccess: React.FC<FormSuccessProps> = ({
  message,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`
        p-3 rounded-md
        bg-green-50 dark:bg-green-900/20
        border border-green-200 dark:border-green-800
        text-green-700 dark:text-green-400
        text-sm
        ${className}
      `}
    >
      {message}
    </div>
  );
};

FormSuccess.displayName = 'FormSuccess';
