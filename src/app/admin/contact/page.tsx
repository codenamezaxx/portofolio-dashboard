/**
 * Admin Contact Info Page
 * 
 * Allows admins to manage social media links and contact information.
 * Displays the contact info editor component.
 */

'use client';

import { DynamicContactInfoEditor } from '@/lib/dynamic-imports-client';

export default function ContactInfoPage() {
  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <DynamicContactInfoEditor />
      </div>
    </main>
  );
}
