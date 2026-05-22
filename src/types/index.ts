/**
 * Shared TypeScript types for the portfolio application.
 * These mirror the data structures from the Vite+React portfolio
 * and extend them for the fullstack Next.js version.
 */

// ============================================================
// Portfolio Content Types
// ============================================================

export interface Profile {
  id?: string;
  name: string;
  role: string;
  tagline: string;
  heroImageUrl?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    telegram?: string;
    email?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface JourneyItem {
  id: string | number;
  year: string;
  title: string;
  description: string;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TechItem {
  id?: string;
  name: string;
  icon: string;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id: string | number;
  title: string;
  description: string;
  category: string;
  image?: string;
  imageUrl?: string;
  tech?: string[];
  technologies?: string[];
  links?: {
    github?: string;
    live?: string;
    demo?: string;
    itchio?: string;
  };
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Achievement {
  id: string | number;
  title: string;
  category: string;
  issuer: string;
  year: string | number;
  pdfPath?: string;
  pdfUrl?: string;
  link?: string;
  externalLink?: string;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactInfo {
  id?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactInfoVersionHistory {
  id: string;
  contactInfoId: string;
  adminUserId?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  email?: string;
  createdAt: Date;
}

// ============================================================
// Admin Types
// ============================================================

export interface AdminUser {
  id: string;
  email: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  adminUserId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface Backup {
  id: string;
  backupName: string;
  backupData: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
