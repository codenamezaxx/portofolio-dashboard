/**
 * File Validation Utilities
 * 
 * Comprehensive file validation for image uploads including:
 * - MIME type validation
 * - Magic number (file signature) validation
 * - File size validation
 * - User-friendly error messages
 * - TypeScript types for validation results
 */

// ============================================================
// Types
// ============================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    filename: string;
    size: number;
    mimeType: string;
    detectedMimeType?: string;
  };
}

export interface FileValidationOptions {
  maxSize?: number; // bytes
  allowedFormats?: string[]; // MIME types
  checkMagicNumbers?: boolean;
}

// ============================================================
// Magic Numbers (File Signatures)
// ============================================================

/**
 * Magic numbers for common image formats.
 * These are the first few bytes of a file that identify its type.
 */
const MAGIC_NUMBERS: Record<string, Uint8Array> = {
  'image/jpeg': new Uint8Array([0xff, 0xd8, 0xff]),
  'image/png': new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  'image/gif': new Uint8Array([0x47, 0x49, 0x46]),
  'image/webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]), // RIFF header
  'image/svg+xml': new Uint8Array([0x3c, 0x3f, 0x78, 0x6d]), // <?xml
};

/**
 * Detect MIME type from file magic numbers.
 * @param buffer - File buffer (first 12 bytes minimum)
 * @returns Detected MIME type or null
 */
export function detectMimeTypeFromMagicNumber(buffer: Uint8Array): string | null {
  // Check JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // Check PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  // Check GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif';
  }

  // Check WebP (RIFF header + WEBP signature)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // Check SVG (XML declaration)
  if (
    buffer[0] === 0x3c &&
    buffer[1] === 0x3f &&
    buffer[2] === 0x78 &&
    buffer[3] === 0x6d
  ) {
    return 'image/svg+xml';
  }

  return null;
}

/**
 * Verify file magic number matches MIME type.
 * @param buffer - File buffer
 * @param mimeType - Expected MIME type
 * @returns true if magic number matches, false otherwise
 */
export function verifyMagicNumber(buffer: Uint8Array, mimeType: string): boolean {
  const detectedType = detectMimeTypeFromMagicNumber(buffer);
  return detectedType === mimeType;
}

// ============================================================
// File Size Validation
// ============================================================

/**
 * Validate file size.
 * @param file - File to validate
 * @param maxSize - Maximum size in bytes (default 5MB for images)
 * @returns Validation result
 */
export function validateFileSize(
  file: File,
  maxSize: number = 5 * 1024 * 1024
): ValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    };
  }

  return {
    valid: true,
    details: {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    },
  };
}

// ============================================================
// MIME Type Validation
// ============================================================

/**
 * Validate file MIME type.
 * @param file - File to validate
 * @param allowedFormats - Array of allowed MIME types
 * @returns Validation result
 */
export function validateMimeType(
  file: File,
  allowedFormats: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
): ValidationResult {
  if (!allowedFormats.includes(file.type)) {
    const formatList = allowedFormats
      .map((fmt) => fmt.split('/')[1].toUpperCase())
      .join(', ');
    return {
      valid: false,
      error: `Invalid file format. Only ${formatList} files are allowed.`,
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    };
  }

  return {
    valid: true,
    details: {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    },
  };
}

// ============================================================
// Magic Number Validation
// ============================================================

/**
 * Validate file magic number (file signature).
 * Ensures file content matches its MIME type.
 * @param file - File to validate
 * @param allowedFormats - Array of allowed MIME types
 * @returns Promise<ValidationResult>
 */
export async function validateMagicNumber(
  file: File,
  allowedFormats: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
): Promise<ValidationResult> {
  try {
    // Read first 12 bytes of file
    const slice = file.slice(0, 12);
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(slice);
    });
    const view = new Uint8Array(buffer);

    // Detect MIME type from magic number
    const detectedType = detectMimeTypeFromMagicNumber(view);

    // If we couldn't detect a type, it might be an invalid file
    if (!detectedType) {
      return {
        valid: false,
        error: 'File appears to be corrupted or not a valid image file.',
        details: {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        },
      };
    }

    // Check if detected type is in allowed formats
    if (!allowedFormats.includes(detectedType)) {
      const formatList = allowedFormats
        .map((fmt) => fmt.split('/')[1].toUpperCase())
        .join(', ');
      return {
        valid: false,
        error: `File content does not match allowed formats. Only ${formatList} files are allowed.`,
        details: {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          detectedMimeType: detectedType,
        },
      };
    }

    // Verify magic number matches declared MIME type
    if (file.type && !verifyMagicNumber(view, file.type)) {
      return {
        valid: false,
        error: 'File content does not match its declared format. The file may have been renamed or corrupted.',
        details: {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          detectedMimeType: detectedType,
        },
      };
    }

    return {
      valid: true,
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        detectedMimeType: detectedType,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      valid: false,
      error: `Failed to validate file: ${errorMessage}`,
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    };
  }
}

// ============================================================
// Comprehensive File Validation
// ============================================================

/**
 * Comprehensive file validation combining all checks.
 * @param file - File to validate
 * @param options - Validation options
 * @returns Promise<ValidationResult>
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<ValidationResult> {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    checkMagicNumbers = true,
  } = options;

  // Step 1: Validate file size
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Step 2: Validate MIME type
  const mimeValidation = validateMimeType(file, allowedFormats);
  if (!mimeValidation.valid) {
    return mimeValidation;
  }

  // Step 3: Validate magic number (file signature)
  if (checkMagicNumbers) {
    const magicValidation = await validateMagicNumber(file, allowedFormats);
    if (!magicValidation.valid) {
      return magicValidation;
    }
  }

  return {
    valid: true,
    details: {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    },
  };
}

// ============================================================
// Batch File Validation
// ============================================================

/**
 * Validate multiple files.
 * @param files - Array of files to validate
 * @param options - Validation options
 * @returns Promise<ValidationResult[]>
 */
export async function validateFiles(
  files: File[],
  options: FileValidationOptions = {}
): Promise<ValidationResult[]> {
  return Promise.all(files.map((file) => validateFile(file, options)));
}

// ============================================================
// Format-Specific Validators
// ============================================================

/**
 * Validate image file (JPG, PNG, WebP, SVG).
 * @param file - File to validate
 * @returns Promise<ValidationResult>
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
  return validateFile(file, {
    maxSize: 5 * 1024 * 1024,
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    checkMagicNumbers: true,
  });
}

/**
 * Validate PDF file.
 * @param file - File to validate
 * @returns Promise<ValidationResult>
 */
export async function validatePdfFile(file: File): Promise<ValidationResult> {
  // First check MIME type
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Only PDF files are allowed.',
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    };
  }

  // Check file size (10MB for PDFs)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `PDF file size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    };
  }

  // Validate PDF magic number
  try {
    const slice = file.slice(0, 4);
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(slice);
    });
    const view = new Uint8Array(buffer);

    // PDF files start with %PDF
    if (view[0] !== 0x25 || view[1] !== 0x50 || view[2] !== 0x44 || view[3] !== 0x46) {
      return {
        valid: false,
        error: 'File appears to be corrupted or not a valid PDF file.',
        details: {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        },
      };
    }

    return {
      valid: true,
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      valid: false,
      error: `Failed to validate PDF: ${errorMessage}`,
      details: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    };
  }
}

// ============================================================
// Error Message Formatting
// ============================================================

/**
 * Format validation error message for display.
 * @param result - Validation result
 * @returns Formatted error message
 */
export function formatValidationError(result: ValidationResult): string {
  if (result.valid) {
    return '';
  }

  return result.error || 'File validation failed';
}

/**
 * Get user-friendly error message.
 * @param error - Error message or ValidationResult
 * @returns User-friendly message
 */
export function getUserFriendlyErrorMessage(
  error: string | ValidationResult
): string {
  if (typeof error === 'string') {
    return error;
  }

  return formatValidationError(error);
}
