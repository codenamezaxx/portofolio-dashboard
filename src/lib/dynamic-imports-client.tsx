/**
 * Dynamic Imports Utility - Client Components
 * 
 * Provides utilities for route-based code splitting and lazy loading.
 * This file contains dynamic imports for client-side only components.
 * Must be used in client components only (marked with 'use client').
 */

'use client';

import dynamic from 'next/dynamic';
import { DynamicLoadingFallback } from './dynamic-imports';

/**
 * Dynamic import configuration for admin panel components
 * These are admin-only components that should be lazy-loaded
 * Configured with ssr: false for client-side only rendering
 */

export const DynamicHeroEditor = dynamic(
  () => import('@/components/admin/HeroEditor').then(mod => ({ default: mod.HeroEditor })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false, // Client-side only for admin
  }
);

export const DynamicJourneyEditor = dynamic(
  () => import('@/components/admin/JourneyEditor').then(mod => ({ default: mod.JourneyEditor })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicTechStackEditor = dynamic(
  () => import('@/components/admin/TechStackEditor').then(mod => ({ default: mod.TechStackEditor })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicProjectManager = dynamic(
  () => import('@/components/admin/ProjectManager').then(mod => ({ default: mod.ProjectManager })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicAchievementManager = dynamic(
  () => import('@/components/admin/AchievementManager').then(mod => ({ default: mod.AchievementManager })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicContactInfoEditor = dynamic(
  () => import('@/components/admin/ContactInfoEditor').then(mod => ({ default: mod.ContactInfoEditor })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicProfileSettings = dynamic(
  () => import('@/components/admin/ProfileSettings').then(mod => ({ default: mod.ProfileSettings })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

/**
 * Dynamic import configuration for heavy UI components
 * These are configured with ssr: false for client-side only rendering
 */

export const DynamicPDFPreview = dynamic(
  () => import('@/components/ui/PDFPreview').then(mod => ({ default: mod.PDFPreview })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicImageUpload = dynamic(
  () => import('@/components/ui/ImageUpload').then(mod => ({ default: mod.ImageUpload })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicPDFUpload = dynamic(
  () => import('@/components/ui/PDFUpload').then(mod => ({ default: mod.PDFUpload })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);

export const DynamicDataTable = dynamic(
  () => import('@/components/ui/DataTable').then(mod => ({ default: mod.DataTable })),
  {
    loading: () => <DynamicLoadingFallback />,
    ssr: false,
  }
);
