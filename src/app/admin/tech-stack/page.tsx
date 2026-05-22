/**
 * Tech Stack Manager Page
 * 
 * Admin page for managing tech stack items.
 * Displays a list of tech stack items with options to add, edit, delete, and reorder.
 * 
 * Features:
 * - List view with name and icon display
 * - Add/edit/delete functionality
 * - Drag-and-drop reordering
 * - Form validation
 * - Error handling
 * - Responsive design
 * - Accessibility features
 */

'use client';

import { DynamicTechStackEditor } from '@/lib/dynamic-imports-client';

export default function TechStackPage() {
  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <DynamicTechStackEditor />
      </div>
    </main>
  );
}
