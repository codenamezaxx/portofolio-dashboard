import { supabase } from './db';

/**
 * Log an admin action to the audit log.
 * @param userId {string} - The admin user performing the action
 * @param action {string} - The action (CREATE, UPDATE, DELETE, etc.)
 * @param entityType {string} - The entity type (table name)
 * @param entityId {string | null} - The primary key of the affected entity
 * @param oldValues {any} - Old values (before change)
 * @param newValues {any} - New values (after change)
 * @param [options] {object} - Optional request info (ipAddress, userAgent, etc)
 */
export async function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null = null,
  oldValues: any = null,
  newValues: any = null,
  options?: { ipAddress?: string; userAgent?: string }
) {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        admin_user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: options?.ipAddress || null,
        user_agent: options?.userAgent || null,
      });
  } catch (error) {
    // Don't throw in production, avoid breaking audit chain if log fails
    // eslint-disable-next-line no-console
    console.error('Failed to log audit event', error);
  }
}