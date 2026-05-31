/**
 * Individual Backup API
 * 
 * DELETE /api/admin/backups/[id] - Delete a backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

/**
 * DELETE /api/admin/backups/[id]
 * Delete a specific backup
 */
export async function DELETE(
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

    // Fetch backup before deletion for audit log
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('id, backup_name')
      .eq('id', backupId)
      .single();

    if (fetchError || !backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Delete backup
    const { error: deleteError } = await supabase
      .from('backups')
      .delete()
      .eq('id', backupId);

    if (deleteError) {
      console.error('Error deleting backup:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete backup' },
        { status: 500 }
      );
    }

    // Log audit action
    await logAudit(
      session.userId,
      'DELETE',
      'backups',
      backupId,
      { name: backup.backup_name },
      null,
      {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    return NextResponse.json({
      message: 'Backup deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/backups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}