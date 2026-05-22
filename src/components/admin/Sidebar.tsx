/**
 * Admin Sidebar Navigation Component
 * 
 * Provides navigation menu for admin panel with collapsible mobile support.
 * Displays all content management sections and user profile.
 * Conforms to design system specifications with light and dark mode support.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/lib/useLogout';
import { useTheme } from '@/contexts/ThemeProvider';
import { Sun, Moon, Terminal, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Swal from 'sweetalert2';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: '📊',
    description: 'Overview and statistics',
  },
  {
    label: 'Profile',
    href: '/admin/profile',
    icon: '👤',
    description: 'View your profile',
  },
  {
    label: 'Hero Section',
    href: '/admin/hero',
    icon: '🎯',
    description: 'Edit profile information',
  },
  {
    label: 'Journey',
    href: '/admin/journey',
    icon: '🚀',
    description: 'Manage career timeline',
  },
  {
    label: 'Tech Stack',
    href: '/admin/tech-stack',
    icon: '⚙️',
    description: 'Manage technologies',
  },
  {
    label: 'Projects',
    href: '/admin/projects',
    icon: '💼',
    description: 'Manage portfolio projects',
  },
  {
    label: 'Achievements',
    href: '/admin/achievements',
    icon: '🏆',
    description: 'Manage certificates',
  },
  {
    label: 'Contact Info',
    href: '/admin/contact',
    icon: '📧',
    description: 'Manage social links',
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: '👥',
    description: 'Manage admin users',
  },
  {
    label: 'Activity Log',
    href: '/admin/activity-log',
    icon: '📝',
    description: 'View audit logs',
  },
  {
    label: 'Backups',
    href: '/admin/backups',
    icon: '💾',
    description: 'Manage backups',
  },
];

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Sesi admin Anda akan diakhiri.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#cd4239',
      cancelButtonColor: '#8B7355',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: 'var(--background)',
      color: 'var(--foreground)',
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-md hover:bg-[var(--surface-soft)] transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-ink dark:text-ink"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Design System Compliant */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[var(--surface-card)] border-r border-[var(--hairline)] flex flex-col z-40 transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo / Branding */}
        <div className="p-6 flex items-center gap-3">
          <div>
            <Terminal className="text-[var(--accent)] w-8 h-8" />
          </div>
          <div>
            <p className="text-xl font-bold uppercase tracking-wider text-[var(--foreground)]">Admin Panel</p>
            <p className="text-xs text-[var(--mute)] uppercase tracking-wider">Portfolio Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive(item.href)
                ? 'bg-[var(--surface-soft)] text-[var(--ink)] border border-[var(--hairline)]'
                : 'text-[var(--body)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]'
                }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-[var(--hairline)] p-4 space-y-3">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface-doc)] border border-[var(--hairline)] rounded-md">
            <div className="overflow-hidden">
              <p className="text-xs text-[var(--mute)] uppercase tracking-wider mb-1">Account</p>
              <p className="text-xs font-medium text-[var(--ink)] truncate">
                {userEmail || 'Admin User'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex-shrink-0 p-2 rounded-lg bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] transition-all duration-300 w-9 h-9 flex items-center justify-center cursor-pointer"
              title="Switch mode"
            >
              {mounted && (theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-card)] text-[var(--ink)] border border-[var(--hairline)] rounded-md transition-colors text-body-xs font-medium tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Link>
            <Button
              variant='danger'
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-3 py-2 text-body-xs font-medium tracking-wider cursor-pointer"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
