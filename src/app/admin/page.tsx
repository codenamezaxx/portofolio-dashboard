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
import { SyncStatus } from '@/components/admin/SyncStatus';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { 
  Briefcase, 
  Trophy, 
  Settings, 
  Target, 
  Mail, 
  ChevronRight,
  Plus,
  FileText,
  Users,
  Database
} from 'lucide-react';
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
      <div className="flex-1 w-full py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-10 lg:mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-ink dark:text-ink mb-4">
            Welcome back, <span className="text-primary dark:text-primary">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-md md:text-lg text-body dark:text-body max-w-2xl">
            Manage your portfolio content, monitor your project stats, and update your professional journey.
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
            icon={Briefcase}
            isLoading={statsLoading}
            color="blue"
          />
          <StatisticsWidget
            label="Total Achievements"
            value={statistics?.achievements ?? 0}
            icon={Trophy}
            isLoading={statsLoading}
            color="amber"
          />
          <StatisticsWidget
            label="Tech Stack Items"
            value={statistics?.techStack ?? 0}
            icon={Settings}
            isLoading={statsLoading}
            color="purple"
          />
        </div>

        {/* Quick Actions & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-ink dark:text-ink">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { href: '/admin/hero', icon: Target, label: 'Edit Hero', desc: 'Update profile info', color: 'border-primary/20' },
                { href: '/admin/projects', icon: Briefcase, label: 'Manage Projects', desc: 'Add or edit portfolio', color: 'border-accent-blue/20' },
                { href: '/admin/achievements', icon: Trophy, label: 'Achievements', desc: 'Manage certificates', color: 'border-accent-green/20' },
                { href: '/admin/contact', icon: Mail, label: 'Contact Info', desc: 'Manage social links', color: 'border-accent-purple/20' },
                { href: '/admin/users', icon: Users, label: 'Users', desc: 'Manage admin accounts', color: 'border-accent-blue/20' },
                { href: '/admin/backups', icon: Database, label: 'Backups', desc: 'Database snapshots', color: 'border-accent-green/20' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group p-5 bg-surface-card dark:bg-surface-card border ${action.color} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-surface-soft dark:bg-surface-soft group-hover:bg-primary/10 transition-colors">
                      <action.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-ink dark:text-ink text-base">{action.label}</p>
                      <p className="text-xs text-mute dark:text-mute">{action.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-mute opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* New Project / Stats Summary */}
          <div className="lg:col-span-1">
             <SyncStatus />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="p-6 lg:p-8 bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-xl shadow-sm">
          <h2 className="text-2xl font-extrabold text-ink dark:text-ink mb-6">Recent Activity</h2>
          <RecentActivity />
        </div>
      </div>
    </main>
  );
}
