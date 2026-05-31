/**
 * Backup Verification API
 * 
 * GET /api/admin/backups/[id]/verify - Verify backup integrity
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { verifyBackup } from '@/lib/backup';

/**
 * GET /api/admin/backups/[id]/verify
 * Verify backup integrity and structure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: backupId } = await params;

    // Verify backup
    const result = await verifyBackup(backupId);

    if (!result.valid) {
      return NextResponse.json(
        { 
          valid: false,
          error: result.error || 'Backup verification failed'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/backups/[id]/verify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}