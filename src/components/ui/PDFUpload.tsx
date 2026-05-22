/**
 * PDFUpload Component
 * 
 * Features:
 * - Drag-and-drop PDF upload
 * - File validation (size, type)
 * - Upload progress tracking
 * - Success/Error feedback
 * - Integration with Supabase Storage
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadPDF } from '@/lib/storage';
import { Button } from './Button';
import { FileText, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface PDFUploadProps {
  onUpload?: (result: { url: string; filename: string }) => void;
  onError?: (error: Error) => void;
  bucket?: string;
  folder?: string;
  maxSize?: number; // In bytes
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function PDFUpload({
  onUpload,
  onError,
  bucket = 'portfolio',
  folder = 'documents',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = '',
  label = 'Upload PDF Certificate',
}: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setError(null);
      setSuccess(false);
      
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        const err = 'Only PDF files are allowed';
        setError(err);
        onError?.(new Error(err));
        return;
      }

      // Validate file size
      if (selectedFile.size > maxSize) {
        const err = `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`;
        setError(err);
        onError?.(new Error(err));
        return;
      }

      setFile(selectedFile);
      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadPDF(selectedFile, {
          bucket,
          folder,
          onProgress: (p) => setProgress(p),
        });

        setSuccess(true);
        onUpload?.(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setUploading(false);
      }
    },
    [folder, maxSize, onUpload, onError]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const reset = () => {
    setFile(null);
    setSuccess(false);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
          ${dragActive ? 'border-[var(--primary)] bg-[var(--surface-soft)]' : 'border-[var(--hairline)] hover:border-[var(--stone)] bg-[var(--surface-card)]'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {!file && !uploading && !success && (
            <>
              <div className="p-3 bg-[var(--surface-soft)] rounded-full">
                <Upload className="w-6 h-6 text-[var(--mute)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                <p className="text-xs text-[var(--mute)] mt-1">
                  Drag and drop or click to browse (Max {(maxSize / 1024 / 1024).toFixed(0)}MB)
                </p>
              </div>
            </>
          )}

          {uploading && (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--foreground)] flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading {file?.name}...
                </span>
                <span className="text-[var(--mute)]">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-[var(--surface-soft)] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[var(--primary)] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 w-full p-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {file?.name}
                </p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Upload successful
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="p-1 hover:bg-[var(--surface-soft)] rounded-full transition-colors text-[var(--mute)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && !uploading && (
            <div className="text-center space-y-2">
              <div className="p-2 bg-red-500/10 rounded-full inline-block">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
