/**
 * Real-time Notification System
 * Notifies users of content updates
 */

import { ContentChangeEvent } from './realtime';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // milliseconds, 0 = persistent
}

// Notification listeners
const notificationListeners = new Set<(notification: Notification) => void>();

// Notification queue
const notificationQueue: Notification[] = [];

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create and dispatch a notification
 */
export function notify(
  type: NotificationType,
  title: string,
  message: string,
  duration: number = 5000
): Notification {
  const notification: Notification = {
    id: generateNotificationId(),
    type,
    title,
    message,
    timestamp: Date.now(),
    duration
  };

  notificationQueue.push(notification);
  notificationListeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (error) {
      console.error('Error in notification listener:', error);
    }
  });

  return notification;
}

/**
 * Subscribe to notifications
 */
export function onNotification(listener: (notification: Notification) => void): () => void {
  notificationListeners.add(listener);

  // Return unsubscribe function
  return () => {
    notificationListeners.delete(listener);
  };
}

/**
 * Create notification from content change event
 */
export function notifyContentChange(event: ContentChangeEvent): void {
  const tableNames: Record<string, string> = {
    profiles: 'Profile',
    tech_stack: 'Tech Stack',
    journey_items: 'Journey',
    projects: 'Projects',
    achievements: 'Achievements',
    contact_info: 'Contact Info'
  };

  const tableName = tableNames[event.table] || event.table;
  const actionText = event.type === 'INSERT' ? 'added' : event.type === 'UPDATE' ? 'updated' : 'deleted';

  notify(
    'info',
    `${tableName} ${actionText}`,
    `${tableName} content has been ${actionText}. The page will refresh shortly.`,
    4000
  );
}

/**
 * Notify about cache revalidation
 */
export function notifyCacheRevalidation(tag: string): void {
  notify(
    'info',
    'Updating content',
    `Refreshing ${tag} content...`,
    2000
  );
}

/**
 * Notify about successful update
 */
export function notifyUpdateSuccess(itemName: string): void {
  notify(
    'success',
    'Update successful',
    `${itemName} has been updated successfully.`,
    3000
  );
}

/**
 * Notify about error
 */
export function notifyError(title: string, message: string): void {
  notify(
    'error',
    title,
    message,
    5000
  );
}

/**
 * Get notification history
 */
export function getNotificationHistory(limit: number = 10): Notification[] {
  return notificationQueue.slice(-limit);
}

/**
 * Clear notification history
 */
export function clearNotificationHistory(): void {
  notificationQueue.length = 0;
}

/**
 * Get number of active listeners
 */
export function getListenerCount(): number {
  return notificationListeners.size;
}
