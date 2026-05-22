/**
 * Admin Achievements Manager Page
 * 
 * Allows admins to manage certifications and awards.
 */

'use client';

import { AchievementManager } from '@/components/admin/AchievementManager';

export default function AchievementsAdminPage() {
  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        <AchievementManager />
      </div>
    </main>
  );
}
