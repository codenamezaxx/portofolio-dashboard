/**
 * Zod validation schemas for all content types.
 * Used for both client-side form validation and server-side API validation.
 */

import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================
// Profile Schema
// ============================================================

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  role: z.string().min(1, 'Role is required').max(255),
  tagline: z.string().min(1, 'Tagline is required'),
  heroImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================
// Journey Schema
// ============================================================

export const journeyItemSchema = z.object({
  year: z.string().min(1, 'Year is required').max(50),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  displayOrder: z.number().int().min(0).optional(),
});

export type JourneyItemInput = z.infer<typeof journeyItemSchema>;

// ============================================================
// Tech Stack Schema
// ============================================================

export const techItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().url('Icon must be a valid URL'),
  displayOrder: z.number().int().min(0).optional(),
});

export type TechItemInput = z.infer<typeof techItemSchema>;

// ============================================================
// Project Schema
// ============================================================

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required').max(100),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  technologies: z.array(z.string().min(1)).min(1, 'At least one technology is required'),
  githubLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  liveLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  demoLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ============================================================
// Achievement Schema
// ============================================================

export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  issuer: z.string().min(1, 'Issuer is required').max(255),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  pdfUrl: z.string().url('PDF URL must be a valid URL'),
  externalLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).optional(),
});

export type AchievementInput = z.infer<typeof achievementSchema>;

// ============================================================
// Contact Info Schema with Platform-Specific URL Validation
// ============================================================

// GitHub URL validation
const githubUrlSchema = z
  .string()
  .refine(
    (url) => !url || url.startsWith('https://github.com/'),
    'GitHub URL must start with https://github.com/'
  )
  .refine(
    (url) => !url || /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/.test(url),
    'Invalid GitHub URL format. Use https://github.com/username'
  )
  .optional()
  .or(z.literal(''));

// LinkedIn URL validation
const linkedinUrlSchema = z
  .string()
  .refine(
    (url) => !url || url.startsWith('https://linkedin.com/') || url.startsWith('https://www.linkedin.com/'),
    'LinkedIn URL must start with https://linkedin.com/ or https://www.linkedin.com/'
  )
  .refine(
    (url) => !url || /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/.test(url),
    'Invalid LinkedIn URL format. Use https://linkedin.com/in/username or https://linkedin.com/company/companyname'
  )
  .optional()
  .or(z.literal(''));

// Instagram URL validation
const instagramUrlSchema = z
  .string()
  .refine(
    (url) => !url || url.startsWith('https://instagram.com/') || url.startsWith('https://www.instagram.com/'),
    'Instagram URL must start with https://instagram.com/ or https://www.instagram.com/'
  )
  .refine(
    (url) => !url || /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(url),
    'Invalid Instagram URL format. Use https://instagram.com/username'
  )
  .optional()
  .or(z.literal(''));

// Telegram URL validation
const telegramUrlSchema = z
  .string()
  .refine(
    (url) => !url || url.startsWith('https://t.me/') || url.startsWith('https://telegram.me/'),
    'Telegram URL must start with https://t.me/ or https://telegram.me/'
  )
  .refine(
    (url) => !url || /^https:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]+\/?$/.test(url),
    'Invalid Telegram URL format. Use https://t.me/username'
  )
  .optional()
  .or(z.literal(''));

// Email validation
const emailSchema = z
  .string()
  .refine(
    (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    'Invalid email format'
  )
  .optional()
  .or(z.literal(''));

export const contactInfoSchema = z
  .object({
    githubUrl: githubUrlSchema,
    linkedinUrl: linkedinUrlSchema,
    instagramUrl: instagramUrlSchema,
    telegramUrl: telegramUrlSchema,
    email: emailSchema,
  })
  .refine(
    (data) => {
      // At least one field should be provided
      return Object.values(data).some((value) => value && value !== '');
    },
    { message: 'At least one contact information field is required' }
  );

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;

// ============================================================
// Admin User Schema
// ============================================================

export const createAdminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

// ============================================================
// File Upload Schema
// ============================================================

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Image must be under 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(f.type),
      'Only JPG, PNG, WebP, and SVG images are allowed'
    ),
});

export const pdfUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 10 * 1024 * 1024, 'PDF must be under 10MB')
    .refine((f) => f.type === 'application/pdf', 'Only PDF files are allowed'),
});
