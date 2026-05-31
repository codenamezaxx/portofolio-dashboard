/**
 * Activity Log Viewer Component
 * 
 * Displays audit logs with:
 * - List logs in table
 * - Filter by action and entity type
 * - Pagination
 * - Export to CSV
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FileText, Download, Filter, Info } from 'lucide-react';

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

const ACTION_TYPES = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
const ENTITY_TYPES = ['profiles', 'tech_stack', 'journey_items', 'projects', 'achievements', 'contact_info', 'admin_users'];

export function ActivityLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
  });
  
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.offset]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      
      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();
      setLogs(data.data);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      
      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to export logs');
      
      const data = await response.json();
      const csv = convertToCSV(data.data);
      downloadCSV(csv, `audit-logs-${new Date().toISOString()}.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export logs');
      setTimeout(() => setError(null), 5000);
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data: AuditLog[]): string => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = data.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.adminUserEmail,
      log.action,
      log.entityType,
      log.entityId || '',
      log.ipAddress || '',
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setPagination(prev => ({
      ...prev,
      offset: direction === 'next' 
        ? prev.offset + prev.limit 
        : Math.max(0, prev.offset - prev.limit),
    }));
  };

  const formatChanges = (oldValues: any, newValues: any): string => {
    if (!oldValues && !newValues) return 'No additional details';
    if (!oldValues) return 'Created new entry';
    if (!newValues) return 'Deleted existing entry';
    
    try {
      const changes: string[] = [];
      const keys = new Set([...Object.keys(oldValues || {}), ...Object.keys(newValues || {})]);
      
      keys.forEach(key => {
        const oldVal = oldValues?.[key];
        const newVal = newValues?.[key];
        
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          const displayOld = typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal || 'null');
          const displayNew = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal || 'null');
          changes.push(`${key}: ${displayOld} → ${displayNew}`);
        }
      });
      
      return changes.length > 0 ? changes.join(', ') : 'No changes detected';
    } catch (err) {
      return 'Error parsing changes';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-ink tracking-tight">Activity Log</h1>
            <p className="text-body dark:text-body font-medium mt-1">View all admin actions and changes</p>
          </div>
        </div>
        <Button onClick={handleExportCSV} disabled={exporting} variant="ghost" className="shadow-lg">
          <Download className="w-4 h-4 mr-2" /> {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {error && <FormError message={error} />}

      {/* Filters */}
      <div className="bg-surface-card dark:bg-surface-card rounded-2xl p-6 border border-hairline">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-black text-ink">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-body mb-2">Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-hairline bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Actions</option>
              {ACTION_TYPES.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-body mb-2">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-hairline bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Entities</option>
              {ENTITY_TYPES.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface-card dark:bg-surface-card rounded-2xl shadow-md overflow-hidden border border-hairline">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-hairline">
            <thead className="bg-surface-soft dark:bg-surface-soft">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">Changes</th>
                <th className="px-6 py-3 text-left text-xs font-black text-mute uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-mute">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-soft dark:hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-ink">
                      {log.adminUserEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        log.action === 'CREATE' ? 'bg-accent-green-soft text-accent-green' :
                        log.action === 'UPDATE' ? 'bg-accent-blue-soft text-accent-blue' :
                        log.action === 'DELETE' ? 'bg-accent-red-soft text-accent-red' :
                        'bg-surface-soft text-body'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 text-sm text-body max-w-xs truncate">
                      {formatChanges(log.oldValues, log.newValues)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-mute">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-hairline flex items-center justify-between">
            <div className="text-sm text-body">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => handlePageChange('prev')}
                disabled={pagination.offset === 0}
              >
                Previous
              </Button>
              <div className="px-4 py-2 text-sm font-bold text-body">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="ghost"
                onClick={() => handlePageChange('next')}
                disabled={pagination.offset + pagination.limit >= pagination.total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info Tip */}
      <div className="p-5 rounded-2xl bg-accent-blue-soft/20 border border-accent-blue/10 flex gap-4">
        <Info className="w-6 h-6 text-accent-blue flex-shrink-0" />
        <p className="text-xs text-body leading-relaxed">
          <span className="font-black text-accent-blue uppercase tracking-wider block mb-1">Audit Trail</span>
          All admin actions are logged for security and compliance. Logs are retained for 90 days.
        </p>
      </div>
    </div>
  );
}