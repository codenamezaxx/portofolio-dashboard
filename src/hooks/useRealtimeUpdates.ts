/**
 * useRealtimeUpdates Hook
 * React hook for subscribing to real-time content updates
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  subscribeToTableChanges,
  subscribeToAllChanges,
  unsubscribeFromAll,
  type ContentTableType,
  type ContentChangeEvent,
  type ContentChangeCallback
} from '@/lib/realtime';

interface UseRealtimeUpdatesOptions {
  tables?: ContentTableType[];
  onUpdate?: (event: ContentChangeEvent) => void;
  autoInvalidateCache?: boolean;
  revalidationDelay?: number;
}

/**
 * Hook to subscribe to real-time content updates
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const {
    tables,
    onUpdate,
    autoInvalidateCache = true,
    revalidationDelay = 1000
  } = options;

  const unsubscribersRef = useRef<Array<() => void>>([]);
  const revalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdate = useCallback((event: ContentChangeEvent) => {
    // Call custom callback if provided
    if (onUpdate) {
      onUpdate(event);
    }

    // Auto-invalidate cache if enabled
    if (autoInvalidateCache) {
      // Cancel previous timeout
      if (revalidationTimeoutRef.current) {
        clearTimeout(revalidationTimeoutRef.current);
      }

      // Schedule revalidation with delay to batch multiple updates
      revalidationTimeoutRef.current = setTimeout(() => {
        // Trigger revalidation
        console.log(`Revalidating cache for ${event.table}`);
      }, revalidationDelay);
    }
  }, [onUpdate, autoInvalidateCache, revalidationDelay]);

  useEffect(() => {
    // Subscribe to updates
    if (tables && tables.length > 0) {
      unsubscribersRef.current = tables.map(table =>
        subscribeToTableChanges(table, handleUpdate)
      );
    } else {
      // Subscribe to all portfolio updates if no specific tables provided
      unsubscribersRef.current = [subscribeToAllChanges(handleUpdate)];
    }

    // Cleanup on unmount
    return () => {
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribersRef.current = [];

      if (revalidationTimeoutRef.current) {
        clearTimeout(revalidationTimeoutRef.current);
      }
    };
  }, [tables, handleUpdate]);

  return {
    isSubscribed: unsubscribersRef.current.length > 0
  };
}

/**
 * Hook to subscribe to all portfolio updates
 */
export function useAllPortfolioUpdates(onUpdate?: (event: ContentChangeEvent) => void) {
  return useRealtimeUpdates({
    onUpdate,
    autoInvalidateCache: true
  });
}

/**
 * Hook to subscribe to specific content type updates
 */
export function useContentTypeUpdates(
  contentType: ContentTableType,
  onUpdate?: (event: ContentChangeEvent) => void
) {
  return useRealtimeUpdates({
    tables: [contentType],
    onUpdate,
    autoInvalidateCache: true
  });
}

/**
 * Cleanup all subscriptions on app unmount
 */
export function useCleanupSubscriptions() {
  useEffect(() => {
    return () => {
      unsubscribeFromAll();
    };
  }, []);
}
