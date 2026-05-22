/**
 * Upload Utilities
 * 
 * Provides functions for uploading files to the server-side API endpoints.
 * Includes support for upload progress tracking and cancellation.
 */

import { type UploadResult } from './storage';

export interface UploadApiOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
  compress?: boolean;
  quality?: number;
  abortController?: AbortController;
}

/**
 * Upload an image via the API route.
 * @param file - Image file to upload
 * @param options - Upload options
 * @returns Upload result from API
 */
export async function uploadImageApi(
  file: File,
  options: UploadApiOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);
    if (options.folder) formData.append('folder', options.folder);
    if (options.compress !== undefined) formData.append('compress', String(options.compress));
    if (options.quality !== undefined) formData.append('quality', String(options.quality));

    // Handle progress
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          options.onProgress?.(percentComplete);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (err) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.error || 'Upload failed'));
        } catch (err) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    // Handle cancellation
    if (options.abortController) {
      options.abortController.signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    xhr.open('POST', '/api/upload/image');
    xhr.send(formData);
  });
}

/**
 * Upload a PDF via the API route.
 * @param file - PDF file to upload
 * @param options - Upload options
 * @returns Upload result from API
 */
export async function uploadPDFApi(
  file: File,
  options: UploadApiOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);
    if (options.folder) formData.append('folder', options.folder);

    // Handle progress
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          options.onProgress?.(percentComplete);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (err) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.error || 'Upload failed'));
        } catch (err) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    // Handle cancellation
    if (options.abortController) {
      options.abortController.signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    xhr.open('POST', '/api/upload/pdf');
    xhr.send(formData);
  });
}
