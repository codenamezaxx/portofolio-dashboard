import { MetadataRoute } from 'next';
import { getProjects, getAchievements } from '@/lib/portfolio-data';

/**akky-
 * Sitemap Generator
 * Generates a sitemap for the portfolio website to improve SEO.
 * Includes static routes and dynamic routes for projects and certificates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codenamezaxx.my.id' || 'https://codenamezaxx.vercel.app';

  // Static routes
  const staticRoutes = [
    '',
    '/projects',
    '/certificates',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic project routes
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await getProjects();
    projectRoutes = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating project routes for sitemap:', error);
  }

  // Dynamic certificate routes
  // Note: While individual certificate pages may not be implemented yet, 
  // following instructions to include them in sitemap specs.
  let certificateRoutes: MetadataRoute.Sitemap = [];
  try {
    const achievements = await getAchievements();
    certificateRoutes = achievements.map((achievement) => ({
      url: `${baseUrl}/certificates/${achievement.id}`,
      lastModified: achievement.updated_at ? new Date(achievement.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Error generating certificate routes for sitemap:', error);
  }

  return [...staticRoutes, ...projectRoutes, ...certificateRoutes];
}
