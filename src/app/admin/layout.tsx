/**
 * Admin Layout
 * 
 * Layout wrapper for all admin pages.
 * Provides protected route access, sidebar navigation, and header with profile/theme controls.
 */

'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/admin/Sidebar';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useSession } from '@/lib/useSession';
import { useTheme } from '@/contexts/ThemeProvider';
import { Menu, User as UserIcon } from 'lucide-react';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-canvas dark:bg-canvas overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          isMobileOpen={isMobileOpen} 
          onMobileClose={() => setIsMobileOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="border-b border-hairline dark:border-hairline bg-[var(--surface-card)] shadow-sm sticky top-0 z-30">
            <div className="max-w-full mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
              
              {/* Left Side: Toggles and Breadcrumb */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Mobile Sidebar Toggle */}
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="flex md:hidden p-2 hover:bg-surface-soft dark:hover:bg-surface-soft rounded-md transition-colors text-mute hover:text-primary cursor-pointer"
                  aria-label="Open mobile menu"
                >
                  <Menu className="w-6 h-6" />
                </button>

                {/* Desktop Sidebar Toggle */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden md:flex p-2 hover:bg-surface-soft dark:hover:bg-surface-soft rounded-md transition-colors text-mute hover:text-primary cursor-pointer"
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <Breadcrumb />
              </div>

              {/* Right Side: Theme Switcher and User Profile */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle */}
                <ThemeToggleButton />
                {/* User Profile Info */}
                <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-[var(--hairline)]">
                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-xs text-[var(--mute)] uppercase font-bold tracking-wider">Administrator</p>
                    <p className="text-sm font-semibold text-[var(--ink)] truncate max-w-[150px]">
                      {user?.email?.split('@')[0] || 'Admin'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-soft dark:bg-surface-soft border border-hairline flex items-center justify-center text-primary overflow-hidden shadow-sm">
                    {user?.avatarUrl && typeof user.avatarUrl === 'string' && user.avatarUrl.trim() !== '' ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Handle broken image links
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement?.classList.add('fallback-avatar');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-sm uppercase">
                        {user?.email?.charAt(0) || <UserIcon className="w-5 h-5" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-canvas dark:bg-canvas">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
