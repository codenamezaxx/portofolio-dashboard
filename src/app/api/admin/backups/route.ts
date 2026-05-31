/**
 * Backups Management API
 * 
 * GET /api/admin/backups - List all backups
 * POST /api/admin/backups - Create new backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { createBackup, cleanupOldBackups } from '@/lib/backup';
import { logAudit } from '@/lib/audit';

/**
 * GET /api/admin/backups
 * List all backups with metadata
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all backups with creator info
    const { data: backups, error } = await supabase
      .from('backups')
      .select(`
        id,
        backup_name,
        created_at,
        created_by,
        admin_users!backups_created_by_fkey (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching backups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch backups' },
        { status: 500 }
      );
    }

    // Format response
    const formattedBackups = backups.map((backup: any) => ({
      id: backup.id,
      name: backup.backup_name,
      createdAt: backup.created_at,
      createdBy: backup.admin_users?.email || 'Unknown',
    }));

    return NextResponse.json({
      data: formattedBackups,
      total: formattedBackups.length,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/backups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/backups
 * Create a new backup
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name } = body;

    // Validate backup name if provided
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Invalid backup name' },
        { status: 400 }
      );
    }

    // Create backup
    const backup = await createBackup(session.userId, name?.trim());

    // Log audit action
    await logAudit(
      session.userId,
      'CREATE',
      'backups',
      backup.id,
      null,
      {
        name: backup.name,
        size: backup.size,
      },
      {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // Cleanup old backups (async, don't wait)
    cleanupOldBackups().catch(err => {
      console.error('Error cleaning up old backups:', err);
    });

    return NextResponse.json({
      message: 'Backup created successfully',
      data: backup,
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/backups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}