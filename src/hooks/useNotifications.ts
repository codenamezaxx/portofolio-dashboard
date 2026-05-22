/**
 * useNotifications Hook
 * React hook for managing notifications
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  onNotification,
  notify,
  notifyError,
  notifyUpdateSuccess,
  notifyContentChange,
  notifyCacheRevalidation,
  type Notification,
  type NotificationType
} from '@/lib/notifications';

/**
 * Hook to manage notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = onNotification((notification) => {
      setNotifications(prev => {
        const existing = prev.find(n => n.id === notification.id);
        if (existing) {
          return prev.map(n => n.id === notification.id ? notification : n);
        }
        return [...prev, notification];
      });

      // Auto-remove notification after duration
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration);
      }
    });

    return unsubscribe;
  }, []);

  const show = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => {
    return notify(type, title, message, duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((title: string, message: string, duration?: number) => {
    return notify('success', title, message, duration);
  }, []);

  const error = useCallback((title: string, message: string, duration?: number) => {
    return notifyError(title, message);
  }, []);

  const info = useCallback((title: string, message: string, duration?: number) => {
    return notify('info', title, message, duration);
  }, []);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    return notify('warning', title, message, duration);
  }, []);

  const contentUpdate = useCallback((contentType: string) => {
    return notify('info', `${contentType} updated`, `${contentType} content has been updated.`, 3000);
  }, []);

  const sync = useCallback(() => {
    return notify('info', 'Syncing', 'Syncing content...', 2000);
  }, []);

  return {
    notifications,
    show,
    dismiss,
    success,
    error,
    info,
    warning,
    contentUpdate,
    sync
  };
}
