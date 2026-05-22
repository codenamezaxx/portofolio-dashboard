/**
 * API Route: POST /api/upload/batch
 * 
 * Handles batch file uploads to Supabase Storage.
 * - Accepts multiple files (images and PDFs)
 * - Returns results for successful and failed uploads
 * - Implements error handling and retry logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { batchUpload, StorageError } from '@/lib/storage';
import { verifySession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string | null;
    const compress = formData.get('compress') !== 'false';
    const quality = formData.get('quality') ? parseFloat(formData.get('quality') as string) : 0.8;

    // Validate files exist
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file count
    if (files.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 files per batch' },
        { status: 400 }
      );
    }

    // Determine bucket based on file types
    // For batch uploads, we'll use a generic approach
    const bucket = 'portfolio-images'; // Could be enhanced to handle mixed types

    // Upload batch
    const result = await batchUpload(files, {
      bucket,
      folder: folder || undefined,
      compress,
      quality,
      maxRetries: 3,
      retryDelay: 1000,
    });

    // Return results
    const statusCode = result.failed.length === 0 ? 201 : 207; // 207 Multi-Status for partial success
    return NextResponse.json(
      {
        successful: result.successful,
        failed: result.failed.map((f) => ({
          filename: f.file.name,
          error: f.error.message,
        })),
        summary: {
          total: files.length,
          successful: result.successful.length,
          failed: result.failed.length,
        },
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Batch upload error:', error);

    if (error instanceof StorageError) {
      const statusCode = error.code === 'QUOTA_ERROR' ? 507 : 500;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
