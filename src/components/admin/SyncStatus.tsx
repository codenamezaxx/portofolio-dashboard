/**
 * Sync Status Component
 * 
 * Displays the real-time API connection status and last update timestamp.
 * Performs a health check on mount and provides visual feedback.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type Status = 'loading' | 'online' | 'offline';

export function SyncStatus() {
  const [apiStatus, setApiStatus] = useState<Status>('loading');
  const [lastUpdate, setLastUpdate] = useState<string>('-');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Using statistics endpoint as a proxy for health check
      const startTime = Date.now();
      const response = await fetch('/api/admin/statistics', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (response.ok) {
        setApiStatus('online');
        const now = new Date();
        const formattedDate = now.toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        setLastUpdate(formattedDate + ` (${latency}ms)`);
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setApiStatus('offline');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(checkConnection, 120000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div className="h-full flex flex-col p-6 bg-[var(--surface-card)] border border-hairline rounded-xl shadow-xl dark:shadow-primary/10 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-accent-green animate-pulse' : apiStatus === 'offline' ? 'bg-accent-red' : 'bg-mute animate-pulse'}`} />
          Quick Status
        </h3>
        <button 
          onClick={checkConnection}
          disabled={isRefreshing}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          title="Refresh connection"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {/* Last Update Card */}
        <div className="p-4 bg-[var(--surface-soft)] rounded-lg border border-white/10 group hover:border-white/20 transition-colors">
          <p className="text-xs text-mute uppercase font-bold tracking-wider mb-1">Last Sync Check</p>
          <div className="flex items-center justify-between">
            <p className="text-[var(--foreground)] text-lg font-bold tabular-nums">
              {apiStatus === 'loading' && lastUpdate === '-' ? (
                <span className="inline-block w-24 h-6 bg-white/10 rounded animate-pulse" />
              ) : (
                lastUpdate
              )}
            </p>
          </div>
        </div>

        {/* API Status Card */}
        <div className="p-4 bg-[var(--surface-soft)] rounded-lg border border-white/10 group hover:border-white/20 transition-colors">
          <p className="text-xs text-mute uppercase font-bold tracking-wider mb-1">Database Connectivity</p>
          <div className="flex items-center gap-2">
            {apiStatus === 'online' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-accent-green" />
                <p className="text-lg font-bold text-accent-green">Terhubung / Stabil</p>
              </>
            )}
            {apiStatus === 'offline' && (
              <>
                <XCircle className="w-5 h-5 text-accent-red" />
                <p className="text-lg font-bold text-accent-red">Terputus</p>
              </>
            )}
            {apiStatus === 'loading' && (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-lg font-bold text-white/50">Memeriksa...</p>
              </>
            )}
          </div>
        </div>
      </div>

      <Link 
        href="/admin/projects" 
        className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-pressed text-on-primary rounded-lg font-bold transition-all shadow-lg hover:shadow-primary/20"
      >
        <Plus className="w-5 h-5" />
        Add New Project
      </Link>
    </div>
  );
}
