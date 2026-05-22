/**
 * Admin Layout
 * 
 * Layout wrapper for all admin pages.
 * Provides protected route access, sidebar navigation, and breadcrumb.
 */

'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/admin/Sidebar';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useSession } from '@/lib/useSession';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useSession();

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-canvas dark:bg-canvas">
        {/* Sidebar Navigation */}
        <Sidebar userEmail={user?.email} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
          {/* Top Header with Breadcrumb */}
          <header className="border-b border-[var(--hairline)] bg-[var(--background)] sticky top-0 z-20">
            <div className="max-w-full mx-auto px-6 pl-16 md:pl-6 py-4 flex items-center justify-between">
              <Breadcrumb />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-canvas dark:bg-canvas">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
