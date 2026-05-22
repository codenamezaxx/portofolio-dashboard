/**
 * ImageUpload Component
 * 
 * Features:
 * - Drag-and-drop file upload with visual feedback
 * - File preview before upload
 * - Progress tracking with percentage and file size display
 * - Upload cancellation support
 * - Error handling with user-friendly messages
 * - Image compression
 * - Thumbnail generation
 * - Accessibility support
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { type UploadResult } from '@/lib/storage';
import { uploadImageApi } from '@/lib/upload-utils';
import Image from 'next/image';

export interface ImageUploadProps {
  onUpload?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  bucket?: string;
  folder?: string;
  compress?: boolean;
  quality?: number;
  maxSize?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
  className?: string;
  showFileSize?: boolean;
  value?: string;
  onChange?: (url: string) => void;
}

export function ImageUpload({
  onUpload,
  onError,
  onCancel,
  bucket = 'portfolio-images',
  folder,
  compress = true,
  quality = 0.8,
  maxSize = 5 * 1024 * 1024,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  disabled = false,
  className = '',
  showFileSize = true,
  value,
  onChange,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setCurrentFile(file);

      // Validate file format
      if (!acceptedFormats.includes(file.type)) {
        const errorMessage = `Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`;
        setError(errorMessage);
        const error = new Error(errorMessage);
        onError?.(error);
        setCurrentFile(null);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        const errorMessage = `File size exceeds maximum of ${(maxSize / 1024 / 1024).toFixed(2)}MB`;
        setError(errorMessage);
        const error = new Error(errorMessage);
        onError?.(error);
        setCurrentFile(null);
        return;
      }

      // Show local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      setUploading(true);
      setProgress(0);

      // Create abort controller for cancellation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const result = await uploadImageApi(file, {
          folder,
          compress,
          quality,
          onProgress: setProgress,
          abortController,
        });

        onUpload?.(result);
        onChange?.(result.url);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        // Don't show error if upload was cancelled
        if (err instanceof Error && err.message !== 'Upload cancelled') {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error.message);
          onError?.(error);
        }
      } finally {
        setUploading(false);
        setProgress(0);
        setCurrentFile(null);
        abortControllerRef.current = null;
      }
    },
    [bucket, folder, compress, quality, maxSize, acceptedFormats, onUpload, onError, onChange]
  );

  const handleCancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploading(false);
    setProgress(0);
    setCurrentFile(null);
    setPreview(value || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel?.();
  }, [onCancel, value]);

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 bg-[var(--surface-card)]
          ${dragActive ? 'border-[var(--primary)] bg-[var(--surface-soft)]' : 'border-[var(--hairline)] hover:border-[var(--stone)]'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="button"
        tabIndex={disabled || uploading ? -1 : 0}
        aria-label="Upload image area"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !uploading) {
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
          disabled={disabled || uploading}
          className="hidden"
          aria-label="Upload image"
        />

        {preview && !uploading ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video max-h-48 mx-auto overflow-hidden rounded-md border border-[var(--hairline)]">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-[var(--mute)]">Click or drag to change image</p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-xs text-red-500 hover:text-red-400 font-semibold"
              >
                Hapus Gambar
              </button>
            </div>
          </div>
        ) : uploading ? (
          <div className="space-y-4">
            <div className="text-lg font-semibold text-[var(--foreground)]">
              Mengunggah...
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-[var(--surface-soft)] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
              />
            </div>

            {/* Progress Information */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {Math.round(progress)}% Selesai
              </p>
              {showFileSize && currentFile && (
                <p className="text-xs text-[var(--mute)]">
                  {currentFile.name} • {(currentFile.size / 1024 / 1024).toFixed(2)}MB
                </p>
              )}
            </div>

            {/* Cancel Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancelUpload();
              }}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              aria-label="Cancel upload"
            >
              Batalkan Unggahan
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-[var(--mute)]"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-3.172-3.172a4 4 0 00-5.656 0L9.172 20M24 16a4 4 0 110-8 4 4 0 010 8z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Tarik dan lepas gambar di sini
            </p>
            <p className="text-sm text-[var(--mute)]">
              atau klik untuk memilih file
            </p>
            <p className="text-xs text-[var(--ash)]">
              Format: JPG, PNG, WebP, SVG (Maks. {(maxSize / 1024 / 1024).toFixed(0)}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
