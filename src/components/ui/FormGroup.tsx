import React from 'react';

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FormGroup Component
 * A wrapper component for grouping form fields with consistent spacing
 */
export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {children}
    </div>
  );
};

FormGroup.displayName = 'FormGroup';
