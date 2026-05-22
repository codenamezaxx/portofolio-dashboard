/**
 * User Profile Card Component
 * 
 * Displays the current user's profile information including:
 * - Email address
 * - Account status
 * - Last login timestamp
 * - Account creation date
 * - Last update date
 */

'use client';

import type { AdminUser } from '@/types';

interface UserProfileCardProps {
  user: AdminUser;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md overflow-hidden">
      {/* Header */}
      <div className="bg-surface-soft dark:bg-surface-soft border-b border-hairline dark:border-hairline p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-md bg-primary flex items-center justify-center text-on-primary text-2xl font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold text-ink dark:text-ink">
              {user.email}
            </h2>
            <p className="text-sm text-mute dark:text-mute mt-1">
              {user.isActive ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent-green dark:bg-accent-green rounded-full" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent-red dark:bg-accent-red rounded-full" />
                  Inactive
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Account Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-ink dark:text-ink mb-4">
            Account Information
          </h3>
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start justify-between p-4 bg-surface-doc dark:bg-surface-doc rounded-md border border-hairline dark:border-hairline">
              <div>
                <p className="text-xs text-mute dark:text-mute uppercase tracking-wide mb-1">
                  Email Address
                </p>
                <p className="text-sm font-medium text-ink dark:text-ink">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start justify-between p-4 bg-surface-doc dark:bg-surface-doc rounded-md border border-hairline dark:border-hairline">
              <div>
                <p className="text-xs text-mute dark:text-mute uppercase tracking-wide mb-1">
                  Account Status
                </p>
                <p className="text-sm font-medium text-ink dark:text-ink">
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div>
          <h3 className="text-lg font-semibold text-ink dark:text-ink mb-4">
            Activity
          </h3>
          <div className="space-y-4">
            {/* Last Login */}
            <div className="flex items-start justify-between p-4 bg-surface-doc dark:bg-surface-doc rounded-md border border-hairline dark:border-hairline">
              <div>
                <p className="text-xs text-mute dark:text-mute uppercase tracking-wide mb-1">
                  Last Login
                </p>
                <p className="text-sm font-medium text-ink dark:text-ink">
                  {formatDate(user.lastLogin)}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start justify-between p-4 bg-surface-doc dark:bg-surface-doc rounded-md border border-hairline dark:border-hairline">
              <div>
                <p className="text-xs text-mute dark:text-mute uppercase tracking-wide mb-1">
                  Account Created
                </p>
                <p className="text-sm font-medium text-ink dark:text-ink">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-start justify-between p-4 bg-surface-doc dark:bg-surface-doc rounded-md border border-hairline dark:border-hairline">
              <div>
                <p className="text-xs text-mute dark:text-mute uppercase tracking-wide mb-1">
                  Last Updated
                </p>
                <p className="text-sm font-medium text-ink dark:text-ink">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User ID */}
        <div className="p-4 bg-surface-doc dark:bg-surface-doc rounded-md border border-hairline dark:border-hairline">
          <p className="text-xs text-mute dark:text-mute uppercase tracking-wide mb-2">
            User ID
          </p>
          <p className="text-xs font-mono text-mute dark:text-mute break-all">
            {user.id}
          </p>
        </div>
      </div>
    </div>
  );
}
