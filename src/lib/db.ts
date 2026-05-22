/**
 * Database utilities for Supabase connection and queries.
 * Provides typed database access for all content types.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';
import type { AdminUser } from '@/types';

// ============================================================
// Supabase Client
// ============================================================

/**
 * Create and export Supabase client for server-side operations.
 * Uses service role key for admin operations.
 */
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL || '',
  env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ============================================================
// Admin User Queries
// ============================================================

/**
 * Find an admin user by email.
 * @param email - Admin user email
 * @returns Admin user with password hash if found, null otherwise
 */
export async function findAdminUserByEmail(email: string): Promise<(AdminUser & { passwordHash: string }) | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, password_hash, is_active, last_login, created_at, updated_at')
    .eq('email', email)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data
    ? {
        id: data.id,
        email: data.email,
        isActive: data.is_active,
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        passwordHash: data.password_hash,
      }
    : null;
}

/**
 * Find an admin user by ID.
 * @param userId - Admin user ID
 * @returns Admin user if found, null otherwise
 */
export async function findAdminUserById(userId: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, is_active, last_login, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data
    ? {
        id: data.id,
        email: data.email,
        isActive: data.is_active,
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }
    : null;
}

/**
 * Update admin user's last login timestamp.
 * @param userId - Admin user ID
 * @returns Updated admin user
 */
export async function updateAdminUserLastLogin(userId: string): Promise<AdminUser> {
  const { data, error } = await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
    .select('id, email, is_active, last_login, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return {
    id: data.id,
    email: data.email,
    isActive: data.is_active,
    lastLogin: data.last_login ? new Date(data.last_login) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// ============================================================
// Audit Logging
// ============================================================

export interface AuditLogEntry {
  adminUserId: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry.
 * @param entry - Audit log entry data
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    admin_user_id: entry.adminUserId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    old_values: entry.oldValues,
    new_values: entry.newValues,
    ip_address: entry.ipAddress,
    user_agent: entry.userAgent,
  });

  if (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

// ============================================================
// Database Health Check
// ============================================================

/**
 * Check if database connection is working.
 * @returns true if connection is successful, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('admin_users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
