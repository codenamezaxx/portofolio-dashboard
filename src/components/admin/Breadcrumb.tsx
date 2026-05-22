/**
 * Breadcrumb Navigation Component
 * 
 * Displays the current page hierarchy for easy navigation.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
  '/admin': [{ label: 'Dashboard', href: '/admin' }],
  '/admin/profile': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Profile', href: '/admin/profile' },
  ],
  '/admin/hero': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Hero Section', href: '/admin/hero' },
  ],
  '/admin/journey': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Journey', href: '/admin/journey' },
  ],
  '/admin/tech-stack': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Tech Stack', href: '/admin/tech-stack' },
  ],
  '/admin/projects': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Projects', href: '/admin/projects' },
  ],
  '/admin/achievements': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Achievements', href: '/admin/achievements' },
  ],
  '/admin/contact': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Contact Info', href: '/admin/contact' },
  ],
  '/admin/users': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
  ],
  '/admin/activity-log': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Activity Log', href: '/admin/activity-log' },
  ],
  '/admin/backups': [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Backups', href: '/admin/backups' },
  ],
};

export function Breadcrumb() {
  const pathname = usePathname();
  const items = BREADCRUMB_MAP[pathname] || [{ label: 'Admin', href: '/admin' }];

  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <span className="text-mute dark:text-mute">/</span>}
          {index === items.length - 1 ? (
            <span className="text-ink dark:text-ink font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-link-blue dark:text-link-blue hover:text-primary dark:hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
