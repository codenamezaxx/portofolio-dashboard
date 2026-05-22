'use client';

import { useContext } from 'react';
import { ToastContext, ToastContextType } from '@/contexts/ToastContext';

/**
 * useToast Hook
 * Provides access to toast notification functionality
 *
 * Usage:
 * ```tsx
 * const toast = useToast();
 *
 * // Show success toast
 * toast.success('Profile updated successfully!');
 *
 * // Show error toast
 * toast.error('Failed to save changes');
 *
 * // Show warning toast
 * toast.warning('This action cannot be undone');
 *
 * // Show info toast
 * toast.info('New updates available');
 *
 * // Show toast with custom duration
 * toast.success('Saved!', { duration: 3000 });
 *
 * // Show toast with action button
 * toast.success('Profile updated!', {
 *   action: {
 *     label: 'Undo',
 *     onClick: () => handleUndo(),
 *   },
 * });
 *
 * // Clear all toasts
 * toast.clearToasts();
 * ```
 *
 * @throws {Error} If used outside of ToastProvider
 * @returns {ToastContextType} Toast context with all methods
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
