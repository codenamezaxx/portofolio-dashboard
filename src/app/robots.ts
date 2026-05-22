import { MetadataRoute } from 'next';

/**
 * Robots.txt Generator
 * Configures search engine crawler access to the website.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://codenamezaxx.my.id' || 'https://codenamezaxx.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
