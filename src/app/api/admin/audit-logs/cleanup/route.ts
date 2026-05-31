/**
 * Audit Logs Cleanup API
 * 
 * Implements log retention policy by deleting logs older than 90 days.
 * This endpoint should be called periodically (e.g., daily via cron job).
 * 
 * Can be scheduled using:
 * - Vercel Cron Jobs (requires Pro plan)
 * - External cron service (e.g., cron-job.org, EasyCron)
 * - Supabase Edge Functions with pg_cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';

const RETENTION_DAYS = 90;

/**
 * POST /api/admin/audit-logs/cleanup
 * Delete audit logs older than 90 days
 * 
 * Security: Requires admin authentication
 * Can also be called with a secret token for automated cron jobs
 */
export async function POST(request: NextRequest) {
  try {
    // Check for cron secret token (for automated cleanup)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow either admin session or valid cron secret
    const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    
    if (!isAuthorizedCron) {
      // Verify admin session
      const session = await verifySession(request);
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Calculate cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    const cutoffISO = cutoffDate.toISOString();

    // Delete old logs
    const { data, error, count } = await supabase
      .from('audit_logs')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffISO);

    if (error) {
      console.error('Error cleaning up audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to cleanup audit logs' },
        { status: 500 }
      );
    }

    const deletedCount = count || 0;

    console.log(`Audit log cleanup: Deleted ${deletedCount} logs older than ${RETENTION_DAYS} days`);

    return NextResponse.json({
      message: 'Audit logs cleaned up successfully',
      deletedCount,
      cutoffDate: cutoffISO,
      retentionDays: RETENTION_DAYS,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/audit-logs/cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/audit-logs/cleanup
 * Get information about logs that would be deleted (dry run)
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

    // Calculate cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    const cutoffISO = cutoffDate.toISOString();

    // Count logs that would be deleted
    const { count, error } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffISO);

    if (error) {
      console.error('Error counting old audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to count old audit logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      logsToDelete: count || 0,
      cutoffDate: cutoffISO,
      retentionDays: RETENTION_DAYS,
      message: `${count || 0} logs would be deleted (older than ${RETENTION_DAYS} days)`,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/audit-logs/cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}