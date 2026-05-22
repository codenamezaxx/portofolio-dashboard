/**
 * Server-side Validation Utilities
 * 
 * Provides utilities for validating data on the server side using Zod schemas.
 * Used in API routes to ensure data integrity before database operations.
 */

import { ZodSchema, ZodError } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
}

/**
 * Validates data against a Zod schema
 * Returns structured validation result with field-level errors
 */
export function validateData<T>(
  data: unknown,
  schema: ZodSchema
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData as T,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      if (error.issues && Array.isArray(error.issues)) {
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
      return {
        success: false,
        errors,
        message: 'Validation failed',
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred during validation',
    };
  }
}

/**
 * Validates data and throws an error if validation fails
 * Useful for API routes that need to fail fast
 */
export function validateDataOrThrow<T>(
  data: unknown,
  schema: ZodSchema
): T {
  try {
    return schema.parse(data) as T;
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      if (error.issues && Array.isArray(error.issues)) {
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
      throw new ValidationError('Validation failed', errors);
    }
    throw error;
  }
}

/**
 * Custom validation error class
 * Includes field-level error information
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Formats validation errors for API responses
 */
export function formatValidationErrors(
  errors: Record<string, string>
): Record<string, string> {
  return Object.entries(errors).reduce(
    (acc, [key, value]) => {
      // Convert nested paths like "profile.name" to "profile_name"
      const formattedKey = key.replace(/\./g, '_');
      acc[formattedKey] = value;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Checks if a value is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a value is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates file upload
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedMimeTypes = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}
