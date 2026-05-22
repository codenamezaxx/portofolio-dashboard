/**
 * useRealtimeUpdates Hook
 * React hook for subscribing to real-time content updates
 */

'use client';

import { useEffect, useCallback } from 'react';
import { subscribeToAllChanges, subscribeToTableChanges, ContentTableType } from './realtime';
import { handleContentChange } from './cache-invalidation';
import { notifyContentChange } from './notifications';

/**
 * Hook to subscribe to all content changes
 * Automatically handles cache invalidation and notifications
 */
export function useRealtimeUpdates() {
  useEffect(() => {
    // Subscribe to all content changes
    const unsubscribe = subscribeToAllChanges((event) => {
      // Handle cache invalidation
      handleContentChange(event);

      // Notify user
      notifyContentChange(event);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);
}

/**
 * Hook to subscribe to specific table changes
 */
export function useTableUpdates(
  table: ContentTableType,
  onUpdate?: (event: any) => void
) {
  useEffect(() => {
    const unsubscribe = subscribeToTableChanges(table, (event) => {
      // Handle cache invalidation
      handleContentChange(event);

      // Call custom handler if provided
      if (onUpdate) {
        onUpdate(event);
      }

      // Notify user
      notifyContentChange(event);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [table, onUpdate]);
}

/**
 * Hook to subscribe to multiple table changes
 */
export function useMultipleTableUpdates(
  tables: ContentTableType[],
  onUpdate?: (event: any) => void
) {
  useEffect(() => {
    const unsubscribers = tables.map((table) =>
      subscribeToTableChanges(table, (event) => {
        // Handle cache invalidation
        handleContentChange(event);

        // Call custom handler if provided
        if (onUpdate) {
          onUpdate(event);
        }

        // Notify user
        notifyContentChange(event);
      })
    );

    // Cleanup on unmount
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [tables, onUpdate]);
}
