/**
 * Admin Projects Manager Page
 * 
 * Allows admins to manage portfolio projects.
 */

'use client';

import { DynamicProjectManager } from '@/lib/dynamic-imports-client';

export default function ProjectsAdminPage() {
  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        <DynamicProjectManager />
      </div>
    </main>
  );
}
