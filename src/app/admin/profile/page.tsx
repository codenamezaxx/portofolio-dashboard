/**
 * Admin User Profile Page
 * 
 * Displays the current user's profile information and settings.
 * Allows users to view their email, account details, and manage profile settings.
 */

'use client';

import { useSession } from '@/lib/useSession';
import { UserProfileCard } from '@/components/admin/UserProfileCard';
import { ProfileSettings } from '@/components/admin/ProfileSettings';
import { CVPreviewSection } from '@/components/admin/CVPreviewSection';

export default function UserProfilePage() {
  const { user, isLoading, error } = useSession();

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-canvas dark:bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-surface-soft dark:border-surface-soft border-t-primary dark:border-t-primary rounded-full animate-spin" />
          <p className="text-mute dark:text-mute">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-canvas dark:bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <p className="text-accent-red dark:text-accent-red">Failed to load profile</p>
          <p className="text-mute dark:text-mute text-sm">{error || 'User not found'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink dark:text-ink mb-2">User Profile</h1>
          <p className="text-body dark:text-body">
            View and manage your account information
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card & CV Preview */}
          <div className="lg:col-span-2 space-y-6">
            <UserProfileCard user={user} />
            <CVPreviewSection />
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSettings user={user} />
          </div>
        </div>
      </div>
    </main>
  );
}
