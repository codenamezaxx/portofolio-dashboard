import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Set the workspace root to the nextjs-app directory to avoid
  // Turbopack detecting the parent workspace's lockfile
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Image optimization — allow external image domains used in portfolio
  images: {
    // Add supported qualities to avoid Next.js warnings
    qualities: [75, 80],
    // Enable AVIF format for better compression (modern browsers)
    // AVIF provides ~20% better compression than WebP
    formats: ['image/avif', 'image/webp'],
    
    // Configure remote patterns for external image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/gh/devicons/**',
      },
      {
        protocol: 'https',
        hostname: 'img.itch.zone',
      },
      // Supabase Storage pattern for uploaded images
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    
    // Device sizes for responsive images (breakpoints for srcset generation)
    // These are the screen widths that Next.js will generate images for
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for srcset generation (for images that don't span full viewport)
    // Used for smaller images like tech stack icons, badges, etc.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640, 768, 1024],
    
    // Cache optimization
    // Immutable images are cached for 1 year (max allowed by HTTP spec)
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for immutable images
    
    // Dangerously allow SVG (used for tech stack icons)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Cache control for images
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
            source: '/images/**',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
            source: '/_next/image/**',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
