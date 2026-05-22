/**
 * Image Optimization Utilities
 * 
 * This module provides utilities for optimizing images across the portfolio:
 * - Responsive image sizing
 * - Format selection (AVIF, WebP, original)
 * - Quality settings based on image type
 * - Lazy loading strategies
 * - CDN caching configuration
 */

/**
 * Image quality settings based on image type
 * Lower quality for larger images, higher for smaller images
 */
export const IMAGE_QUALITY = {
  // Hero and large background images: 80-85 (good balance)
  HERO: 85,
  BACKGROUND: 80,
  
  // Project cards and medium images: 75-80
  PROJECT: 80,
  CARD: 75,
  
  // Small icons and thumbnails: 85-90 (need to be crisp)
  ICON: 90,
  THUMBNAIL: 85,
  
  // Profile images: 85
  PROFILE: 85,
} as const;

/**
 * Responsive image sizes for different components
 * Used in the `sizes` prop of Next.js Image component
 */
export const RESPONSIVE_SIZES = {
  // Hero section: full width on mobile, constrained on desktop
  HERO: '(max-width: 768px) 280px, 448px',
  
  // Project cards: full width on mobile, half width on tablet/desktop
  PROJECT_CARD: '(max-width: 768px) 100vw, 50vw',
  
  // Tech stack icons: fixed size
  TECH_ICON: '32px',
  
  // Achievement thumbnails: responsive
  ACHIEVEMENT: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  
  // Full width images
  FULL_WIDTH: '100vw',
  
  // Half width images
  HALF_WIDTH: '50vw',
  
  // Third width images
  THIRD_WIDTH: '33vw',
} as const;

/**
 * Device breakpoints for responsive images
 * Matches Tailwind CSS breakpoints
 */
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
  ULTRA_WIDE: 1536,
} as const;

/**
 * Image loading strategies
 */
export const LOADING_STRATEGY = {
  // Above-the-fold images: eager loading
  EAGER: 'eager' as const,
  
  // Below-the-fold images: lazy loading
  LAZY: 'lazy' as const,
} as const;

/**
 * Get the appropriate loading strategy based on image position
 * @param isAboveFold - Whether the image is above the fold
 * @returns Loading strategy ('eager' or 'lazy')
 */
export function getLoadingStrategy(isAboveFold: boolean): 'eager' | 'lazy' {
  return isAboveFold ? LOADING_STRATEGY.EAGER : LOADING_STRATEGY.LAZY;
}

/**
 * Get the appropriate quality setting based on image type
 * @param imageType - Type of image (hero, project, icon, etc.)
 * @returns Quality value (1-100)
 */
export function getImageQuality(
  imageType: keyof typeof IMAGE_QUALITY
): number {
  return IMAGE_QUALITY[imageType] || 75;
}

/**
 * Get the appropriate responsive sizes based on component type
 * @param componentType - Type of component (hero, project, etc.)
 * @returns Responsive sizes string for Next.js Image component
 */
export function getResponsiveSizes(
  componentType: keyof typeof RESPONSIVE_SIZES
): string {
  return RESPONSIVE_SIZES[componentType] || RESPONSIVE_SIZES.FULL_WIDTH;
}

/**
 * Image optimization configuration for different scenarios
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Hero section images
  HERO: {
    quality: IMAGE_QUALITY.HERO,
    sizes: RESPONSIVE_SIZES.HERO,
    priority: true,
    loading: 'eager' as const,
  },
  
  // Project card images
  PROJECT: {
    quality: IMAGE_QUALITY.PROJECT,
    sizes: RESPONSIVE_SIZES.PROJECT_CARD,
    priority: false,
    loading: 'lazy' as const,
  },
  
  // Tech stack icons
  TECH_ICON: {
    quality: IMAGE_QUALITY.ICON,
    sizes: RESPONSIVE_SIZES.TECH_ICON,
    priority: false,
    loading: 'lazy' as const,
  },
  
  // Achievement thumbnails
  ACHIEVEMENT: {
    quality: IMAGE_QUALITY.THUMBNAIL,
    sizes: RESPONSIVE_SIZES.ACHIEVEMENT,
    priority: false,
    loading: 'lazy' as const,
  },
} as const;

/**
 * CDN caching headers configuration
 * These headers are set in next.config.ts for optimal caching
 */
export const CDN_CACHE_CONFIG = {
  // Immutable images (content-addressed, never change)
  IMMUTABLE: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  
  // Static images (rarely change)
  STATIC: {
    'Cache-Control': 'public, max-age=86400, must-revalidate',
  },
  
  // Dynamic images (may change)
  DYNAMIC: {
    'Cache-Control': 'public, max-age=3600, must-revalidate',
  },
  
  // User-uploaded images (may change frequently)
  USER_UPLOADED: {
    'Cache-Control': 'public, max-age=1800, must-revalidate',
  },
} as const;

/**
 * Image format support detection
 * Used to determine which formats to serve
 */
export const SUPPORTED_FORMATS = {
  // Modern format with best compression (~20% smaller than WebP)
  AVIF: 'image/avif',
  
  // Widely supported modern format
  WEBP: 'image/webp',
  
  // Fallback formats
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  SVG: 'image/svg+xml',
} as const;

/**
 * Image optimization tips and best practices
 */
export const IMAGE_OPTIMIZATION_TIPS = {
  HERO: 'Hero images should be optimized for fast loading. Use quality 85 and lazy load below-the-fold images.',
  PROJECT: 'Project images benefit from lazy loading. Use quality 80 for good balance between quality and file size.',
  ICON: 'Icons should use quality 90 for crisp rendering. Use fixed sizes when possible.',
  RESPONSIVE: 'Always use the sizes prop to help Next.js generate appropriate srcset values.',
  LAZY_LOADING: 'Use loading="lazy" for below-the-fold images to improve initial page load time.',
  PRIORITY: 'Use priority prop only for above-the-fold images to avoid blocking page render.',
} as const;

/**
 * Calculate optimal image dimensions based on container width
 * @param containerWidth - Width of the image container in pixels
 * @param aspectRatio - Aspect ratio of the image (width/height)
 * @returns Object with width and height
 */
export function calculateImageDimensions(
  containerWidth: number,
  aspectRatio: number = 16 / 9
): { width: number; height: number } {
  return {
    width: containerWidth,
    height: Math.round(containerWidth / aspectRatio),
  };
}

/**
 * Get the appropriate image format based on browser support
 * @param supportsAvif - Whether browser supports AVIF
 * @param supportsWebp - Whether browser supports WebP
 * @returns Preferred image format
 */
export function getPreferredImageFormat(
  supportsAvif: boolean,
  supportsWebp: boolean
): string {
  if (supportsAvif) return SUPPORTED_FORMATS.AVIF;
  if (supportsWebp) return SUPPORTED_FORMATS.WEBP;
  return SUPPORTED_FORMATS.JPEG;
}

export default {
  IMAGE_QUALITY,
  RESPONSIVE_SIZES,
  BREAKPOINTS,
  LOADING_STRATEGY,
  IMAGE_OPTIMIZATION_CONFIG,
  CDN_CACHE_CONFIG,
  SUPPORTED_FORMATS,
  getLoadingStrategy,
  getImageQuality,
  getResponsiveSizes,
  calculateImageDimensions,
  getPreferredImageFormat,
};
