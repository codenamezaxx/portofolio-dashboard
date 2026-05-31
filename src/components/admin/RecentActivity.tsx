'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  LogIn, 
  LogOut, 
  Database,
  Clock,
  User,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuditLog {
  id: string;
  adminUserId: string;
  admin_users?: {
    email: string;
  };
  action: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
}

export function RecentActivity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentLogs() {
      try {
        const response = await fetch('/api/admin/audit-logs?limit=5');
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();
        setLogs(data.data || []);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return <Plus className="w-4 h-4 text-accent-green" />;
      case 'UPDATE': return <Edit className="w-4 h-4 text-accent-blue" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-accent-red" />;
      case 'LOGIN': return <LogIn className="w-4 h-4 text-accent-green" />;
      case 'LOGOUT': return <LogOut className="w-4 h-4 text-mute" />;
      case 'RESTORE': return <Database className="w-4 h-4 text-primary" />;
      default: return <FileText className="w-4 h-4 text-mute" />;
    }
  };

  const getEntityLabel = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'projects': return 'Project';
      case 'achievements': return 'Achievement';
      case 'journey_items': return 'Journey Item';
      case 'tech_stack': return 'Tech Stack';
      case 'profiles': return 'Profile';
      case 'contact_info': return 'Contact Info';
      case 'backups': return 'Backup';
      case 'admin_users': return 'User';
      default: return entityType;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-hairline rounded-2xl">
        <div className="p-4 bg-surface-soft dark:bg-surface-soft rounded-full mb-4">
          <FileText className="w-8 h-8 text-mute" />
        </div>
        <p className="text-xl font-bold text-ink dark:text-ink">No recent activity yet</p>
        <p className="text-body dark:text-body mt-2 text-center max-w-xs">
          Your activity log will appear here as you make changes to your portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-hairline">
        {logs.map((log) => (
          <div key={log.id} className="py-4 flex items-center justify-between group hover:bg-surface-soft/50 px-2 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-surface-soft dark:bg-surface-soft rounded-xl">
                {getActionIcon(log.action)}
              </div>
              <div>
                <p className="text-ink dark:text-ink font-bold">
                  {log.action.charAt(0) + log.action.slice(1).toLowerCase()} {getEntityLabel(log.entityType)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-3 h-3 text-mute" />
                  <span className="text-xs text-mute font-medium">{log.admin_users?.email || 'Admin'}</span>
                  <span className="text-xs text-mute/50">•</span>
                  <Clock className="w-3 h-3 text-mute ml-1" />
                  <span className="text-xs text-mute font-medium">{formatTime(log.createdAt)}</span>
                </div>
              </div>
            </div>
            <Link 
              href="/admin/activity-log"
              className="p-2 text-mute hover:text-primary transition-colors rounded-lg group-hover:translate-x-1 duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>
      
      <Link 
        href="/admin/activity-log"
        className="flex items-center justify-center w-full py-3 mt-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-primary/10"
      >
        View All Activity
      </Link>
    </div>
  );
}