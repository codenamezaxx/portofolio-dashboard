/**
 * Admin Hero Section Page
 * 
 * Allows admins to edit the profile information displayed in the hero section.
 */

'use client';

import { DynamicHeroEditor } from '@/lib/dynamic-imports-client';

export default function HeroAdminPage() {
  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <DynamicHeroEditor />
      </div>
    </main>
  );
}
