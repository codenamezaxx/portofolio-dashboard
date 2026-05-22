/**
 * API Route: POST /api/upload/image
 * 
 * Handles image uploads to Supabase Storage.
 * - Validates file format and size
 * - Compresses image before upload
 * - Returns public URL and metadata
 * - Implements error handling and retry logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, ValidationError, UploadError, StorageError } from '@/lib/storage';
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
    const compress = formData.get('compress') !== 'false';
    const quality = formData.get('quality') ? parseFloat(formData.get('quality') as string) : 0.8;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload image
    const result = await uploadImage(file, {
      bucket: 'portfolio-images',
      folder: folder || undefined,
      compress,
      quality,
      maxRetries: 3,
      retryDelay: 1000,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Image upload error:', error);

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
