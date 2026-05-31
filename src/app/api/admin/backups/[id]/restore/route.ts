/**
 * Backup Restore API
 * 
 * POST /api/admin/backups/[id]/restore - Restore from a backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { restoreBackup } from '@/lib/backup';
import { logAudit } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/admin/backups/[id]/restore
 * Restore database from a backup
 * WARNING: This will overwrite all current data
 */
export async function POST(
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

    // Restore backup
    const result = await restoreBackup(backupId);

    // Log audit action
    await logAudit(
      session.userId,
      'RESTORE',
      'backups',
      backupId,
      null,
      result.restored,
      {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // Revalidate portfolio pages after restore
    revalidatePath('/', 'layout');
    revalidatePath('/projects');
    revalidatePath('/certificates');

    return NextResponse.json({
      message: 'Backup restored successfully',
      data: result,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/backups/[id]/restore:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}