/**
 * Admin Journey Manager Page
 * 
 * Allows admins to manage the career timeline/journey milestones.
 */

'use client';

import { DynamicJourneyEditor } from '@/lib/dynamic-imports-client';

export default function JourneyAdminPage() {
  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <DynamicJourneyEditor />
      </div>
    </main>
  );
}
