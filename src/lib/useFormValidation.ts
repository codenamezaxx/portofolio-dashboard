/**
 * useFormValidation Hook
 * 
 * A custom hook for managing form state with Zod schema validation.
 * Provides client-side validation, error handling, and form submission.
 * 
 * Usage:
 * ```tsx
 * const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = 
 *   useFormValidation(initialValues, schema, onSubmit);
 * ```
 */

import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

export interface FormValidationOptions<T> {
  initialValues: T;
  schema: ZodSchema;
  onSubmit: (values: T) => Promise<void> | void;
  onError?: (error: Error) => void;
}

export interface FormValidationState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormValidationActions<T> {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  setValues: (values: T) => void;
}

/**
 * Custom hook for form validation with Zod
 * Manages form state, validation, and submission
 */
export function useFormValidation<T extends Record<string, any>>(
  options: FormValidationOptions<T>
): FormValidationState<T> & FormValidationActions<T> {
  const { initialValues, schema, onSubmit, onError } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (fieldName: keyof T, fieldValue: any): string | undefined => {
      try {
        // Try to validate just this field
        const result = schema.safeParse({ ...values, [fieldName]: fieldValue });
        if (!result.success) {
          const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
          const fieldError = fieldErrors[fieldName as string];
          return fieldError?.[0];
        }
        return undefined;
      } catch (error) {
        console.error('Field validation error:', error);
        return undefined;
      }
    },
    [schema, values]
  );

  // Validate all fields
  const validateForm = useCallback((): Partial<Record<keyof T, string>> => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        if (error.issues && Array.isArray(error.issues)) {
          error.issues.forEach((err) => {
            const path = err.path[0] as keyof T;
            if (path) {
              newErrors[path] = err.message;
            }
          });
        }
        return newErrors;
      }
      return {};
    }
  }, [schema, values]);

  // Handle field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;

      // Handle different input types
      let fieldValue: any = value;
      if (type === 'checkbox') {
        fieldValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        fieldValue = value === '' ? '' : Number(value);
      }

      setValues((prev) => ({
        ...prev,
        [fieldName]: fieldValue,
      }));

      // Validate field if it's been touched
      if (touched[fieldName]) {
        const fieldError = validateField(fieldName, fieldValue);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: fieldError,
        }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof T;

      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      // Validate field on blur
      const fieldError = validateField(fieldName, values[fieldName]);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldError,
      }));
    },
    [validateField, values]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate all fields
      const newErrors = validateForm();
      setErrors(newErrors);

      // Mark all fields as touched
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach((key) => {
        allTouched[key as keyof T] = true;
      });
      setTouched(allTouched);

      // If there are errors, don't submit
      if (Object.keys(newErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        }
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, values, onSubmit, onError]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Set field touched state
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field]: isTouched,
    }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Set all values
  const setFormValues = useCallback((newValues: T) => {
    setValues(newValues);
  }, []);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    setValues: setFormValues,
  };
}
