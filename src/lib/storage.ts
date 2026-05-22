/**
 * Supabase Storage utilities for image and file uploads.
 * Handles image compression, thumbnail generation, and CDN serving.
 * 
 * Features:
 * - Image compression with configurable quality
 * - Thumbnail generation for previews
 * - Batch upload support with retry logic
 * - Progress tracking callbacks
 * - Comprehensive error handling
 * - Multiple format support (JPEG, PNG, WebP, SVG)
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

// ============================================================
// Supabase Storage Client
// ============================================================

/**
 * Create Supabase client for storage operations.
 * Uses service role key for server-side operations to bypass RLS,
 * and anon key for client-side operations (if any remain).
 */
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
  console.error('❌ Supabase client initialization failed: Missing environment variables.');
}

// Determine which key to use
const isServer = typeof window === 'undefined';
const supabaseKey = isServer ? (supabaseServiceKey || supabaseAnonKey) : supabaseAnonKey;

export const supabaseStorage = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// ============================================================
// Storage Error Types
// ============================================================

export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends StorageError {
  constructor(message: string, originalError?: Error) {
    super(message, 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationError';
  }
}

export class UploadError extends StorageError {
  constructor(message: string, originalError?: Error) {
    super(message, 'UPLOAD_ERROR', originalError);
    this.name = 'UploadError';
  }
}

export class NetworkError extends StorageError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

export class QuotaError extends StorageError {
  constructor(message: string, originalError?: Error) {
    super(message, 'QUOTA_ERROR', originalError);
    this.name = 'QuotaError';
  }
}

export class PermissionError extends StorageError {
  constructor(message: string, originalError?: Error) {
    super(message, 'PERMISSION_ERROR', originalError);
    this.name = 'PermissionError';
  }
}

// ============================================================
// Image Compression
// ============================================================

/**
 * Compress image using Canvas API.
 * Reduces file size while maintaining quality.
 * @param file - Image file to compress
 * @param quality - Compression quality (0-1), default 0.8
 * @param maxWidth - Maximum width in pixels, default 2000
 * @param maxHeight - Maximum height in pixels, default 2000
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 2000,
  maxHeight: number = 2000
): Promise<Blob | File> {
  // Return original file if running on server (Canvas API not available)
  if (typeof window === 'undefined') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

// ============================================================
// Thumbnail Generation
// ============================================================

/**
 * Generate thumbnail from image.
 * Creates a small preview image for display.
 * @param file - Image file
 * @param size - Thumbnail size in pixels (default 200)
 * @returns Thumbnail as Blob
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return compressImage(file, 0.7, size, size);
}

// ============================================================
// File Upload to Supabase Storage
// ============================================================

export interface UploadOptions {
  bucket: string;
  folder?: string;
  onProgress?: (progress: number) => void;
  compress?: boolean;
  quality?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UploadResult {
  url: string;
  filename: string;
  path: string;
  size: number;
  contentType: string;
  originalSize?: number;
  compressionRatio?: number;
}

export interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{
    file: File;
    error: Error;
  }>;
}

/**
 * Retry logic with exponential backoff.
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delay - Initial delay in milliseconds
 * @returns Result of function
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors
      if (lastError.message.includes('Invalid') || lastError.message.includes('validation')) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        const backoffDelay = delay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError || new Error('Upload failed after retries');
}

/**
 * Upload image to Supabase Storage.
 * Automatically compresses and generates unique filename.
 * @param file - Image file to upload
 * @param options - Upload options
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  // Validate file
  const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!validFormats.includes(file.type)) {
    throw new ValidationError(
      'Invalid image format. Only JPG, PNG, WebP, and SVG are allowed.'
    );
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new ValidationError(`Image must be under 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  const originalSize = file.size;
  let uploadFile = file;
  let compressionRatio = 1;

  // Compress image if requested
  if (options.compress !== false && file.type !== 'image/svg+xml') {
    try {
      const compressedBlob = await compressImage(
        file,
        options.quality || 0.8
      );
      uploadFile = new File([compressedBlob], file.name, {
        type: file.type,
      });
      compressionRatio = uploadFile.size / originalSize;
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}-${random}.${ext}`;

  // Build path
  const path = options.folder
    ? `${options.folder}/${filename}`
    : filename;

  // Upload with retry logic
  const maxRetries = options.maxRetries ?? 3;
  const retryDelay = options.retryDelay ?? 1000;

  try {
    await retryWithBackoff(
      async () => {
        const { data, error } = await supabaseStorage.storage
          .from(options.bucket)
          .upload(path, uploadFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          if (error.message.includes('quota')) {
            throw new QuotaError(`Storage quota exceeded: ${error.message}`);
          }
          if (error.message.includes('permission')) {
            throw new PermissionError(`Permission denied: ${error.message}`);
          }
          if (error.message.toLowerCase().includes('bucket not found') || (error as any).status === 404) {
            throw new UploadError(`Bucket "${options.bucket}" not found. Please create it in Supabase Storage.`);
          }
          throw new UploadError(`Upload failed: ${error.message}`);
        }

        return data;
      },
      maxRetries,
      retryDelay
    );
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during upload: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }

  // Get public URL
  const { data: publicData } = supabaseStorage.storage
    .from(options.bucket)
    .getPublicUrl(path);

  return {
    url: publicData.publicUrl,
    filename,
    path,
    size: uploadFile.size,
    contentType: uploadFile.type,
    originalSize,
    compressionRatio: Math.round(compressionRatio * 100) / 100,
  };
}

/**
 * Upload PDF to Supabase Storage.
 * @param file - PDF file to upload
 * @param options - Upload options
 * @returns Upload result with URL and metadata
 */
export async function uploadPDF(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  // Validate file
  if (file.type !== 'application/pdf') {
    throw new ValidationError('Only PDF files are allowed');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new ValidationError(`PDF must be under 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  const isResume = options.folder === 'resumes';

  // Generate filename: fixed for resumes to overwrite, unique for other PDFs
  const filename = isResume
    ? 'cv.pdf'
    : `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.pdf`;

  // Build path
  const path = options.folder
    ? `${options.folder}/${filename}`
    : filename;

  // Upload with retry logic
  const maxRetries = options.maxRetries ?? 3;
  const retryDelay = options.retryDelay ?? 1000;

  try {
    await retryWithBackoff(
      async () => {
        const { data, error } = await supabaseStorage.storage
          .from(options.bucket)
          .upload(path, file, {
            cacheControl: isResume ? 'no-store, no-cache, must-revalidate, max-age=0' : '3600',
            upsert: isResume ? true : false,
          });

        if (error) {
          if (error.message.includes('quota')) {
            throw new QuotaError(`Storage quota exceeded: ${error.message}`);
          }
          if (error.message.includes('permission')) {
            throw new PermissionError(`Permission denied: ${error.message}`);
          }
          if (error.message.toLowerCase().includes('bucket not found') || (error as any).status === 404) {
            throw new UploadError(`Bucket "${options.bucket}" not found. Please create it in Supabase Storage.`);
          }
          throw new UploadError(`Upload failed: ${error.message}`);
        }

        return data;
      },
      maxRetries,
      retryDelay
    );
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during upload: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }

  // Get public URL
  const { data: publicData } = supabaseStorage.storage
    .from(options.bucket)
    .getPublicUrl(path);

  return {
    url: publicData.publicUrl,
    filename,
    path,
    size: file.size,
    contentType: file.type,
  };
}

/**
 * Upload multiple files in batch.
 * @param files - Array of files to upload
 * @param options - Upload options
 * @returns Batch upload result with successful and failed uploads
 */
export async function batchUpload(
  files: File[],
  options: UploadOptions
): Promise<BatchUploadResult> {
  const results: BatchUploadResult = {
    successful: [],
    failed: [],
  };

  const totalFiles = files.length;
  let processedFiles = 0;

  for (const file of files) {
    try {
      let result: UploadResult;

      if (file.type === 'application/pdf') {
        result = await uploadPDF(file, options);
      } else {
        result = await uploadImage(file, options);
      }

      results.successful.push(result);
    } catch (error) {
      results.failed.push({
        file,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    processedFiles++;
    if (options.onProgress) {
      const progress = (processedFiles / totalFiles) * 100;
      options.onProgress(progress);
    }
  }

  return results;
}

// ============================================================
// File Deletion
// ============================================================

/**
 * Delete file from Supabase Storage.
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabaseStorage.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      if (error.message.includes('permission')) {
        throw new PermissionError(`Permission denied: ${error.message}`);
      }
      throw new UploadError(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during deletion: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Delete multiple files from Supabase Storage.
 * @param bucket - Storage bucket name
 * @param paths - Array of file paths in bucket
 */
export async function deleteFiles(bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  try {
    const { error } = await supabaseStorage.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      if (error.message.includes('permission')) {
        throw new PermissionError(`Permission denied: ${error.message}`);
      }
      throw new UploadError(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during deletion: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

// ============================================================
// File Listing and Metadata
// ============================================================

/**
 * List files in a bucket folder.
 * @param bucket - Storage bucket name
 * @param folder - Folder path (optional)
 * @returns Array of file objects
 */
export async function listFiles(bucket: string, folder?: string) {
  try {
    const { data, error } = await supabaseStorage.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new UploadError(`Failed to list files: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during file listing: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get file metadata from Supabase Storage.
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns File metadata
 */
export async function getFileMetadata(bucket: string, path: string) {
  try {
    const { data, error } = await supabaseStorage.storage
      .from(bucket)
      .list(path, { limit: 1 });

    if (error) {
      throw new UploadError(`Failed to get metadata: ${error.message}`);
    }

    return data;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during metadata retrieval: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

// ============================================================
// URL Utilities
// ============================================================

/**
 * Get public URL for a file in storage.
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns Public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabaseStorage.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Extract path from public URL.
 * @param url - Public URL
 * @returns File path
 */
export function extractPathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    // Remove empty parts and bucket name
    return parts.slice(3).join('/');
  } catch {
    return url;
  }
}

/**
 * Copy file within storage.
 * @param bucket - Storage bucket name
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 */
export async function copyFile(
  bucket: string,
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  try {
    // Download source file
    const { data, error: downloadError } = await supabaseStorage.storage
      .from(bucket)
      .download(sourcePath);

    if (downloadError) {
      throw new UploadError(`Failed to download source file: ${downloadError.message}`);
    }

    // Upload to destination
    const { error: uploadError } = await supabaseStorage.storage
      .from(bucket)
      .upload(destinationPath, data, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new UploadError(`Failed to upload to destination: ${uploadError.message}`);
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during file copy: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Move file within storage.
 * @param bucket - Storage bucket name
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 */
export async function moveFile(
  bucket: string,
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  try {
    // Copy file
    await copyFile(bucket, sourcePath, destinationPath);

    // Delete source
    await deleteFile(bucket, sourcePath);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new NetworkError(
      `Network error during file move: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}
