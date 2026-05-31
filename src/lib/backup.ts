/**
 * Backup and Recovery Utilities
 * 
 * Provides functions for creating, restoring, encrypting, and verifying database backups.
 * Implements backup retention policy and automated cleanup.
 */

import { supabase } from './db';
import crypto from 'crypto';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

// Backup retention configuration
const BACKUP_RETENTION_DAYS = 30;

/**
 * Get encryption key from environment variable
 * Falls back to a default key for development (NOT SECURE FOR PRODUCTION)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.BACKUP_ENCRYPTION_KEY;
  
  if (!key) {
    console.warn('BACKUP_ENCRYPTION_KEY not set, using default key (NOT SECURE FOR PRODUCTION)');
    // Default key for development only
    return Buffer.from('0123456789abcdef0123456789abcdef', 'utf8');
  }
  
  // Ensure key is exactly 32 bytes
  const keyBuffer = Buffer.from(key, 'utf8');
  if (keyBuffer.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error(`Encryption key must be exactly ${ENCRYPTION_KEY_LENGTH} bytes`);
  }
  
  return keyBuffer;
}

/**
 * Encrypt backup data using AES-256-GCM
 */
export function encryptBackupData(data: string): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt backup data using AES-256-GCM
 */
export function decryptBackupData(
  encrypted: string,
  iv: string,
  authTag: string
): string {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTagBuffer);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Create a complete database backup
 * Backs up all content tables: profiles, tech_stack, journey_items, projects, achievements, contact_info
 */
export async function createBackup(
  adminUserId: string,
  backupName?: string
): Promise<{ id: string; name: string; size: number }> {
  try {
    // Fetch all data from content tables
    const [
      profilesResult,
      techStackResult,
      journeyItemsResult,
      projectsResult,
      achievementsResult,
      contactInfoResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('tech_stack').select('*'),
      supabase.from('journey_items').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('achievements').select('*'),
      supabase.from('contact_info').select('*'),
    ]);

    // Check for errors
    if (profilesResult.error) throw profilesResult.error;
    if (techStackResult.error) throw techStackResult.error;
    if (journeyItemsResult.error) throw journeyItemsResult.error;
    if (projectsResult.error) throw projectsResult.error;
    if (achievementsResult.error) throw achievementsResult.error;
    if (contactInfoResult.error) throw contactInfoResult.error;

    // Create backup data object
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: {
        profiles: profilesResult.data,
        tech_stack: techStackResult.data,
        journey_items: journeyItemsResult.data,
        projects: projectsResult.data,
        achievements: achievementsResult.data,
        contact_info: contactInfoResult.data,
      },
    };

    // Convert to JSON string
    const backupJson = JSON.stringify(backupData);
    const backupSize = Buffer.byteLength(backupJson, 'utf8');

    // Encrypt backup data
    const { encrypted, iv, authTag } = encryptBackupData(backupJson);

    // Generate backup name if not provided
    const name = backupName || `backup-${new Date().toISOString().split('T')[0]}`;

    // Store encrypted backup in database
    const { data: backup, error } = await supabase
      .from('backups')
      .insert({
        backup_name: name,
        backup_data: {
          encrypted,
          iv,
          authTag,
        },
        created_by: adminUserId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: backup.id,
      name: backup.backup_name,
      size: backupSize,
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup');
  }
}

/**
 * Restore database from a backup
 * WARNING: This will overwrite all current data in content tables
 */
export async function restoreBackup(backupId: string): Promise<{
  restored: {
    profiles: number;
    tech_stack: number;
    journey_items: number;
    projects: number;
    achievements: number;
    contact_info: number;
  };
}> {
  try {
    // Fetch backup from database
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError) throw fetchError;
    if (!backup) throw new Error('Backup not found');

    // Decrypt backup data
    const { encrypted, iv, authTag } = backup.backup_data;
    const decryptedJson = decryptBackupData(encrypted, iv, authTag);
    const backupData = JSON.parse(decryptedJson);

    // Verify backup structure
    if (!backupData.tables) {
      throw new Error('Invalid backup format: missing tables');
    }

    // Delete all existing data (in reverse order of dependencies)
    await Promise.all([
      supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('journey_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('tech_stack').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('contact_info').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);

    // Restore data from backup
    const restored = {
      profiles: 0,
      tech_stack: 0,
      journey_items: 0,
      projects: 0,
      achievements: 0,
      contact_info: 0,
    };

    // Restore profiles
    if (backupData.tables.profiles?.length > 0) {
      const { error } = await supabase.from('profiles').insert(backupData.tables.profiles);
      if (error) throw error;
      restored.profiles = backupData.tables.profiles.length;
    }

    // Restore tech_stack
    if (backupData.tables.tech_stack?.length > 0) {
      const { error } = await supabase.from('tech_stack').insert(backupData.tables.tech_stack);
      if (error) throw error;
      restored.tech_stack = backupData.tables.tech_stack.length;
    }

    // Restore journey_items
    if (backupData.tables.journey_items?.length > 0) {
      const { error } = await supabase.from('journey_items').insert(backupData.tables.journey_items);
      if (error) throw error;
      restored.journey_items = backupData.tables.journey_items.length;
    }

    // Restore projects
    if (backupData.tables.projects?.length > 0) {
      const { error } = await supabase.from('projects').insert(backupData.tables.projects);
      if (error) throw error;
      restored.projects = backupData.tables.projects.length;
    }

    // Restore achievements
    if (backupData.tables.achievements?.length > 0) {
      const { error } = await supabase.from('achievements').insert(backupData.tables.achievements);
      if (error) throw error;
      restored.achievements = backupData.tables.achievements.length;
    }

    // Restore contact_info
    if (backupData.tables.contact_info?.length > 0) {
      const { error } = await supabase.from('contact_info').insert(backupData.tables.contact_info);
      if (error) throw error;
      restored.contact_info = backupData.tables.contact_info.length;
    }

    return { restored };
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw new Error('Failed to restore backup');
  }
}

/**
 * Verify backup integrity
 * Checks if backup can be decrypted and has valid structure
 */
export async function verifyBackup(backupId: string): Promise<{
  valid: boolean;
  error?: string;
  stats?: {
    profiles: number;
    tech_stack: number;
    journey_items: number;
    projects: number;
    achievements: number;
    contact_info: number;
  };
}> {
  try {
    // Fetch backup from database
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError) {
      return { valid: false, error: 'Backup not found' };
    }

    // Try to decrypt backup data
    const { encrypted, iv, authTag } = backup.backup_data;
    const decryptedJson = decryptBackupData(encrypted, iv, authTag);
    const backupData = JSON.parse(decryptedJson);

    // Verify backup structure
    if (!backupData.tables) {
      return { valid: false, error: 'Invalid backup format: missing tables' };
    }

    // Count records in each table
    const stats = {
      profiles: backupData.tables.profiles?.length || 0,
      tech_stack: backupData.tables.tech_stack?.length || 0,
      journey_items: backupData.tables.journey_items?.length || 0,
      projects: backupData.tables.projects?.length || 0,
      achievements: backupData.tables.achievements?.length || 0,
      contact_info: backupData.tables.contact_info?.length || 0,
    };

    return { valid: true, stats };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete old backups based on retention policy
 * Keeps backups for BACKUP_RETENTION_DAYS days
 */
export async function cleanupOldBackups(): Promise<{ deletedCount: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - BACKUP_RETENTION_DAYS);
    const cutoffISO = cutoffDate.toISOString();

    const { count, error } = await supabase
      .from('backups')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffISO);

    if (error) throw error;

    return { deletedCount: count || 0 };
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
    throw new Error('Failed to cleanup old backups');
  }
}