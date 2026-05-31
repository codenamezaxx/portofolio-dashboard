/**
 * Backup Manager Component
 * 
 * Manages database backups with:
 * - List backups
 * - Create backup
 * - Verify backup
 * - Restore backup
 * - Delete backup
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Database, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  Info,
  AlertTriangle
} from 'lucide-react';

interface Backup {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
}

interface VerifyResult {
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
}

export function BackupManager() {
  const router = useRouter();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [backupName, setBackupName] = useState('');

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/backups');
      if (!response.ok) throw new Error('Failed to fetch backups');
      const data = await response.json();
      setBackups(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: backupName.trim() || undefined }),
      });
      if (!response.ok) throw new Error('Failed to create backup');
      await fetchBackups();
      setShowCreateModal(false);
      setBackupName('');
      setSuccessMessage('Backup created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create backup');
      setTimeout(() => setError(null), 5000);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;
    const id = selectedBackup.id;
    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/backups/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete backup');
      await fetchBackups();
      setShowDeleteModal(false);
      setSuccessMessage('Backup deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete backup');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(null);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    try {
      setRestoring(selectedBackup.id);
      const response = await fetch(`/api/admin/backups/${selectedBackup.id}/restore`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to restore backup');
      const data = await response.json();
      setShowRestoreModal(false);
      setSuccessMessage(`Backup restored successfully!\n\nRestored:\n- Profiles: ${data.data.restored.profiles}\n- Tech Stack: ${data.data.restored.tech_stack}\n- Journey: ${data.data.restored.journey_items}\n- Projects: ${data.data.restored.projects}\n- Achievements: ${data.data.restored.achievements}\n- Contact Info: ${data.data.restored.contact_info}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore backup');
      setTimeout(() => setError(null), 5000);
    } finally {
      setRestoring(null);
    }
  };

  const handleVerifyBackup = async (backup: Backup) => {
    try {
      setVerifying(backup.id);
      setSelectedBackup(backup);
      const response = await fetch(`/api/admin/backups/${backup.id}/verify`);
      const data = await response.json();
      setVerifyResult(data);
      setShowVerifyModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify backup');
      setTimeout(() => setError(null), 5000);
    } finally {
      setVerifying(null);
    }
  };

  const openRestoreModal = (backup: Backup) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-ink tracking-tight">Backup Management</h1>
            <p className="text-body dark:text-body font-medium mt-1">Create and restore database backups</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} disabled={creating} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> {creating ? 'Creating...' : 'Create Backup'}
        </Button>
      </div>

      {successMessage && <FormSuccess message={successMessage} />}
      {error && <FormError message={error} />}

      {backups.length === 0 ? (
        <div className="text-center py-12 bg-surface-card dark:bg-surface-card border-2 border-dashed border-hairline rounded-2xl">
          <p className="text-mute dark:text-mute mb-4">No backups found</p>
          <Button onClick={() => setShowCreateModal(true)}>Create First Backup</Button>
        </div>
      ) : (
        <div className="bg-surface-card dark:bg-surface-card rounded-2xl shadow-md overflow-hidden border border-hairline">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-hairline">
              <thead className="bg-surface-soft dark:bg-surface-soft">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-right text-xs font-black text-mute uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-surface-soft dark:hover:bg-surface-soft transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-ink dark:text-ink">{backup.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-body">{new Date(backup.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-body">{backup.createdBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleVerifyBackup(backup)}
                      disabled={verifying === backup.id}
                      className="text-accent-blue hover:text-accent-blue/80 disabled:opacity-50 font-bold"
                    >
                      {verifying === backup.id ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                      onClick={() => openRestoreModal(backup)}
                      disabled={restoring === backup.id}
                      className="text-accent-green hover:text-accent-green/80 disabled:opacity-50 font-bold"
                    >
                      {restoring === backup.id ? 'Restoring...' : 'Restore'}
                    </button>
                    <button
                      onClick={() => { setSelectedBackup(backup); setShowDeleteModal(true); }}
                      disabled={deleting === backup.id}
                      className="text-accent-red hover:text-accent-red/80 disabled:opacity-50 font-bold"
                    >
                      {deleting === backup.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Create Backup Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Backup">
        <div className="space-y-4">
          <TextInput
            label="Backup Name (optional)"
            placeholder="Leave empty for auto-generated name"
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            className="h-11"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreateBackup} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {/* Restore Backup Modal */}
      <Modal isOpen={showRestoreModal} onClose={() => setShowRestoreModal(false)} title="Restore Backup">
        <div className="space-y-4">
          <div className="bg-accent-red-soft/20 border border-accent-red/20 text-accent-red px-4 py-3 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Warning!</p>
              <p className="text-sm mt-1">This will overwrite all current data with the backup data. This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-sm text-body">
            Are you sure you want to restore from backup: <strong>{selectedBackup?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowRestoreModal(false)} disabled={restoring !== null}>Cancel</Button>
            <Button variant="danger" onClick={handleRestoreBackup} disabled={restoring !== null}>
              {restoring ? 'Restoring...' : 'Restore'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Backup Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Backup">
        <div className="space-y-4">
          <p className="text-body">
            Are you sure you want to delete backup <strong>{selectedBackup?.name}</strong>?
          </p>
          <div className="bg-accent-red-soft/20 border border-accent-red/20 text-accent-red px-4 py-3 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Warning!</p>
              <p className="text-sm mt-1">This action cannot be undone. The backup file will be permanently removed.</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={deleting !== null}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteBackup} disabled={deleting !== null}>
              {deleting ? 'Deleting...' : 'Delete Backup'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Verify Backup Modal */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Backup Verification">
        <div className="space-y-4">
          {verifyResult?.valid ? (
            <>
              <div className="bg-accent-green-soft/20 border border-accent-green/20 text-accent-green px-4 py-3 rounded-xl flex gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <p className="font-bold">✓ Backup is valid</p>
              </div>
              {verifyResult.stats && (
                <div className="text-sm text-body">
                  <p className="font-bold mb-2">Backup contains:</p>
                  <ul className="space-y-1">
                    <li>• Profiles: {verifyResult.stats.profiles}</li>
                    <li>• Tech Stack: {verifyResult.stats.tech_stack}</li>
                    <li>• Journey Items: {verifyResult.stats.journey_items}</li>
                    <li>• Projects: {verifyResult.stats.projects}</li>
                    <li>• Achievements: {verifyResult.stats.achievements}</li>
                    <li>• Contact Info: {verifyResult.stats.contact_info}</li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-accent-red-soft/20 border border-accent-red/20 text-accent-red px-4 py-3 rounded-xl">
              <p className="font-bold">✗ Backup is invalid</p>
              <p className="text-sm mt-1">{verifyResult?.error}</p>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowVerifyModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Info Tip */}
      <div className="p-5 rounded-2xl bg-accent-blue-soft/20 border border-accent-blue/10 flex gap-4">
        <Info className="w-6 h-6 text-accent-blue flex-shrink-0" />
        <p className="text-xs text-body leading-relaxed">
          <span className="font-black text-accent-blue uppercase tracking-wider block mb-1">Backup Policy</span>
          Regular backups ensure data safety. Backups are encrypted and retained for 30 days. Always verify backups before restoration.
        </p>
      </div>
    </div>
  );
}