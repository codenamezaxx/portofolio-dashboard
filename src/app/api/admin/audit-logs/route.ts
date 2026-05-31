/**
 * Audit Logs API Routes
 * 
 * Handles fetching and exporting audit logs:
 * - GET: Fetch audit logs with filtering, sorting, and pagination
 * - Supports CSV export
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';

interface AuditLog {
  id: string;
  adminUserId: string;
  adminUserEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface RawAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_users?: {
    email: string;
  } | {
    email: string;
  }[];
}

/**
 * Map raw database row to AuditLog interface
 */
function mapAuditLog(row: RawAuditLog): AuditLog {
  // Handle Supabase join result which might be an object or an array
  let email = 'Unknown';
  if (row.admin_users) {
    if (Array.isArray(row.admin_users)) {
      email = row.admin_users[0]?.email || 'Unknown';
    } else {
      email = row.admin_users.email || 'Unknown';
    }
  }

  return {
    id: row.id,
    adminUserId: row.admin_user_id,
    adminUserEmail: email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    oldValues: row.old_values,
    newValues: row.new_values,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  };
}

/**
 * GET /api/admin/audit-logs
 * Fetch audit logs with filtering, sorting, and pagination
 * Query params:
 * - limit: number of logs per page (default: 50)
 * - offset: pagination offset (default: 0)
 * - action: filter by action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
 * - entityType: filter by entity type (profiles, projects, etc.)
 * - sortBy: sort field (default: created_at)
 * - sortOrder: asc or desc (default: desc)
 * - export: if 'csv', returns CSV file
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const exportFormat = searchParams.get('export');

    // Build query
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin_users(email)
      `, { count: 'exact' });

    // Apply filters
    if (action) {
      query = query.eq('action', action);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // For CSV export, fetch all matching records
    if (exportFormat === 'csv') {
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs for export:', error);
        return NextResponse.json(
          { error: 'Failed to fetch audit logs' },
          { status: 500 }
        );
      }

      const mappedLogs = (data as RawAuditLog[]).map(mapAuditLog);
      const csv = generateCSV(mappedLogs);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Apply pagination for regular requests
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }

    const mappedData = (data as RawAuditLog[]).map(mapAuditLog);

    return NextResponse.json({
      data: mappedData,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/audit-logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV from audit logs
 */
function generateCSV(logs: AuditLog[]): string {
  const headers = [
    'Timestamp',
    'User',
    'Action',
    'Entity Type',
    'Entity ID',
    'IP Address',
    'Changes',
  ];

  const rows = logs.map(log => {
    const timestamp = new Date(log.createdAt).toLocaleString();
    const user = log.adminUserEmail;
    const changes = formatChanges(log.oldValues, log.newValues);

    return [
      timestamp,
      user,
      log.action,
      log.entityType,
      log.entityId || '',
      log.ipAddress || '',
      changes,
    ].map(escapeCSV).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Format changes for CSV
 */
function formatChanges(oldValues: any, newValues: any): string {
  if (!oldValues && !newValues) return '';
  
  const changes: string[] = [];
  
  if (newValues) {
    Object.keys(newValues).forEach(key => {
      const oldVal = oldValues?.[key];
      const newVal = newValues[key];
      
      if (oldVal !== newVal) {
        changes.push(`${key}: ${oldVal || 'null'} → ${newVal || 'null'}`);
      }
    });
  }
  
  return changes.join('; ');
}