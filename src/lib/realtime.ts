/**
 * Real-time Content Updates
 * Supabase real-time subscriptions for portfolio content changes
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Initialize Supabase client for real-time operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Types for real-time events
export type ContentChangeType = 'INSERT' | 'UPDATE' | 'DELETE';
export type ContentTableType = 'profiles' | 'tech_stack' | 'journey_items' | 'projects' | 'achievements' | 'contact_info';

export interface ContentChangeEvent {
  type: ContentChangeType;
  table: ContentTableType;
  record: any;
  oldRecord?: any;
  timestamp: number;
}

// Callback type for content changes
export type ContentChangeCallback = (event: ContentChangeEvent) => void;

// Store active subscriptions
const activeSubscriptions = new Map<string, RealtimeChannel>();
const changeCallbacks = new Map<string, Set<ContentChangeCallback>>();

/**
 * Subscribe to changes on a specific table
 */
export function subscribeToTableChanges(
  table: ContentTableType,
  callback: ContentChangeCallback
): () => void {
  const subscriptionKey = `${table}`;

  // Add callback to the set
  if (!changeCallbacks.has(subscriptionKey)) {
    changeCallbacks.set(subscriptionKey, new Set());
  }
  changeCallbacks.get(subscriptionKey)!.add(callback);

  // Create subscription if it doesn't exist
  if (!activeSubscriptions.has(subscriptionKey)) {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          const event: ContentChangeEvent = {
            type: payload.eventType as ContentChangeType,
            table: table,
            record: payload.new,
            oldRecord: payload.old,
            timestamp: Date.now()
          };

          // Call all registered callbacks
          changeCallbacks.get(subscriptionKey)?.forEach((cb) => {
            try {
              cb(event);
            } catch (error) {
              console.error(`Error in content change callback for ${table}:`, error);
            }
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${table} changes`);
        }
      });

    activeSubscriptions.set(subscriptionKey, channel);
  }

  // Return unsubscribe function
  return () => {
    const callbacks = changeCallbacks.get(subscriptionKey);
    if (callbacks) {
      callbacks.delete(callback);
      
      // If no more callbacks, unsubscribe from channel
      if (callbacks.size === 0) {
        const channel = activeSubscriptions.get(subscriptionKey);
        if (channel) {
          supabase.removeChannel(channel);
          activeSubscriptions.delete(subscriptionKey);
          changeCallbacks.delete(subscriptionKey);
        }
      }
    }
  };
}

/**
 * Subscribe to all portfolio content changes
 */
export function subscribeToAllChanges(callback: ContentChangeCallback): () => void {
  const tables: ContentTableType[] = [
    'profiles',
    'tech_stack',
    'journey_items',
    'projects',
    'achievements',
    'contact_info'
  ];

  const unsubscribers = tables.map((table) => subscribeToTableChanges(table, callback));

  // Return function to unsubscribe from all
  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}

/**
 * Unsubscribe from all active subscriptions
 */
export function unsubscribeFromAll(): void {
  activeSubscriptions.forEach((channel) => {
    supabase.removeChannel(channel);
  });
  activeSubscriptions.clear();
  changeCallbacks.clear();
}

/**
 * Get the number of active subscriptions
 */
export function getActiveSubscriptionCount(): number {
  return activeSubscriptions.size;
}
