/**
 * RealtimeProvider Component
 * Provides real-time updates and notifications to the entire app
 */

'use client';

import React from 'react';
import { useRealtimeUpdates } from '@/lib/useRealtimeUpdates';
import { NotificationProvider } from './NotificationProvider';
import { NotificationContainer } from '@/components/ui/NotificationContainer';

interface RealtimeProviderProps {
  children: React.ReactNode;
  enableNotifications?: boolean;
}

/**
 * Provider component for real-time updates
 */
export function RealtimeProvider({
  children,
  enableNotifications = true
}: RealtimeProviderProps) {
  // Subscribe to all portfolio updates
  useRealtimeUpdates();

  return (
    <NotificationProvider>
      {children}
      {enableNotifications && <NotificationContainer />}
    </NotificationProvider>
  );
}

export default RealtimeProvider;
