/**
 * Admin User Profile Page
 * 
 * Displays the current user's profile information and settings.
 * Allows users to view their email, account details, and manage profile settings.
 */

'use client';

export const dynamic = 'force-dynamic';

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
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-ink dark:text-ink mb-3">User Profile</h1>
          <p className="text-lg text-mute dark:text-mute font-medium">
            Manage your administrator account, security settings, and professional resume.
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Profile Card & CV Preview */}
          <div className="lg:col-span-8 space-y-8">
            <UserProfileCard user={user} />
            <CVPreviewSection />
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-4">
            <ProfileSettings user={user} />
          </div>
        </div>
      </div>
    </main>
  );
}
