'use client';

/**
 * Dynamic Imports Utility - Server Components
 * 
 * Provides utilities for route-based code splitting and lazy loading.
 * This file contains dynamic imports for server-side rendered components.
 */

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { 
  JourneySkeleton, 
  TechStackSkeleton, 
  ProjectSkeleton, 
  AchievementSkeleton 
} from '@/components/ui/SectionSkeletons';

/**
 * Loading component for dynamic imports
 */
export const DynamicLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-surface-soft border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-mute font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * Error component for failed dynamic imports
 */
export const DynamicErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-accent-red font-medium">Failed to load component</p>
      <p className="text-xs text-mute">{error?.message || 'Unknown error'}</p>
    </div>
  </div>
);

/**
 * Dynamic import configuration for public portfolio sections
 * These are heavy components that benefit from code splitting
 * Configured with ssr: true for SEO
 */

export const DynamicHero = dynamic(
  () => import('@/components/sections/Hero'),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: true, // Server-side render for SEO
  }
);

export const DynamicJourney = dynamic(
  () => import('@/components/sections/Journey'),
  {
    loading: () => <JourneySkeleton />,
    ssr: false, // Disable SSR to prevent carousel layout calculation issues on server
  }
);

export const DynamicTechStack = dynamic(
  () => import('@/components/sections/TechStack'),
  {
    loading: () => <TechStackSkeleton />,
    ssr: true,
  }
);

export const DynamicProjects = dynamic(
  () => import('@/components/sections/Projects'),
  {
    loading: () => <ProjectSkeleton />,
    ssr: true,
  }
);

export const DynamicAchievements = dynamic(
  () => import('@/components/sections/Achievements'),
  {
    loading: () => <AchievementSkeleton />,
    ssr: false, // Disable SSR to prevent 'DOMMatrix is not defined' error from pdfjs
  }
);

export const DynamicContacts = dynamic(
  () => import('@/components/sections/Contacts'),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: true,
  }
);

/**
 * Dynamic import configuration for heavy UI components
 * These are configured with ssr: true for public pages
 */

export const DynamicCertificatesGallery = dynamic(
  () => import('@/components/sections/CertificatesGallery'),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: true,
  }
);

/**
 * Preload a dynamic component
 * Useful for prefetching components on hover or route prediction
 * 
 * @param importFn - The import function to preload
 */
export function preloadDynamicComponent(
  importFn: () => Promise<{ default: any }>
) {
  if (typeof window !== 'undefined') {
    importFn();
  }
}
