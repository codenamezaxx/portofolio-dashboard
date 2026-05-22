/**
 * Admin Dashboard Page
 * 
 * Main admin dashboard showing statistics and quick actions.
 * Displays user information and navigation to content management sections.
 */

'use client';

import { useSession } from '@/lib/useSession';
import { useStatistics } from '@/lib/useStatistics';
import { StatisticsWidget } from '@/components/admin/StatisticsWidget';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, isLoading } = useSession();
  const { statistics, isLoading: statsLoading, error: statsError } = useStatistics();

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-canvas dark:bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-surface-soft dark:border-surface-soft border-t-primary dark:border-t-primary rounded-full animate-spin" />
          <p className="text-mute dark:text-mute font-bold text-sm uppercase tracking-wider">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col min-h-screen bg-canvas dark:bg-canvas">
      {/* Main Content */}
      <div className="flex-1 w-full py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-ink dark:text-ink mb-4">
            Welcome back, <span className="text-primary dark:text-primary">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-lg text-body dark:text-body">
            Manage your portfolio content from this dashboard
          </p>
        </div>

        {/* Error Message */}
        {statsError && (
          <div className="mb-8 p-4 bg-accent-red-soft dark:bg-accent-red-soft border border-accent-red/20 dark:border-accent-red/20 rounded-md">
            <p className="text-sm text-accent-red dark:text-accent-red font-medium">{statsError}</p>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatisticsWidget
            label="Total Projects"
            value={statistics?.projects ?? 0}
            icon=" "
            isLoading={statsLoading}
          />
          <StatisticsWidget
            label="Total Achievements"
            value={statistics?.achievements ?? 0}
            icon=" "
            isLoading={statsLoading}
          />
          <StatisticsWidget
            label="Tech Stack Items"
            value={statistics?.techStack ?? 0}
            icon=" "
            isLoading={statsLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-ink dark:text-ink mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/admin/hero', icon: '🎯', label: 'Edit Hero', desc: 'Update profile info' },
              { href: '/admin/projects', icon: '💼', label: 'Projects', desc: 'Manage portfolio' },
              { href: '/admin/achievements', icon: '🏆', label: 'Achievements', desc: 'Manage certificates' },
              { href: '/admin/tech-stack', icon: '⚙️', label: 'Tech Stack', desc: 'Manage skills' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="p-4 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md hover:border-stone dark:hover:border-stone hover:bg-surface-soft dark:hover:bg-surface-soft transition-all duration-200"
              >
                <div className="flex flex-col items-start gap-3">
                  <span className="text-3xl grayscale opacity-50">{action.icon}</span>
                  <div>
                    <p className="font-bold text-ink dark:text-ink">{action.label}</p>
                    <p className="text-xs text-mute dark:text-mute mt-1">{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="p-8 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md">
          <h2 className="text-2xl font-extrabold text-ink dark:text-ink mb-6">Recent Activity</h2>
          <div className="text-center py-12">
            <p className="text-lg text-mute dark:text-mute font-medium">No recent activity yet</p>
            <p className="text-sm text-stone dark:text-stone mt-2">
              Your activity log will appear here as you make changes to your portfolio
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
