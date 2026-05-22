/**
 * API Route: POST /api/upload/pdf
 * 
 * Handles PDF uploads to Supabase Storage.
 * - Validates PDF format and size (max 10MB)
 * - Returns public URL and metadata
 * - Implements error handling and retry logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadPDF, ValidationError, UploadError, StorageError } from '@/lib/storage';
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
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload PDF
    const result = await uploadPDF(file, {
      bucket: 'portfolio-pdfs',
      folder: folder || undefined,
      maxRetries: 3,
      retryDelay: 1000,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('PDF upload error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      );
    }

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
