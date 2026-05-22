/**
 * API Route: DELETE /api/upload/delete
 * 
 * Handles file deletion from Supabase Storage.
 * - Deletes single or multiple files
 * - Validates file paths
 * - Implements error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteFile, deleteFiles, StorageError } from '@/lib/storage';
import { verifySession } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    // Verify session
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bucket, path, paths } = body;

    // Validate input
    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket is required' },
        { status: 400 }
      );
    }

    if (!path && !paths) {
      return NextResponse.json(
        { error: 'Either path or paths is required' },
        { status: 400 }
      );
    }

    // Delete file(s)
    if (path) {
      await deleteFile(bucket, path);
    } else if (paths && Array.isArray(paths)) {
      await deleteFiles(bucket, paths);
    }

    return NextResponse.json(
      { message: 'File(s) deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('File deletion error:', error);

    if (error instanceof StorageError) {
      const statusCode = error.code === 'PERMISSION_ERROR' ? 403 : 500;
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
