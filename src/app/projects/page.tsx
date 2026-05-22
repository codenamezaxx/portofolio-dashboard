/**
 * Projects Listing Page
 * Displays all projects with filtering and search
 */

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProjects } from '@/lib/portfolio-data';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Projects | Zakky Ahmad El-Kholily',
  description: 'Explore my portfolio of web development and game development projects, showcasing my skills in React, Next.js, and TypeScript.',
  openGraph: {
    title: 'My Projects | Zakky Ahmad El-Kholily',
    description: 'Explore my portfolio of web development and game development projects.',
    type: 'website',
    url: 'https://codenamezaxx.my.id/projects',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Projects | Zakky Ahmad El-Kholily',
    description: 'Explore my portfolio of web development and game development projects.',
  }
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  try {
    const projects = await getProjects();
    const categories = Array.from(new Set(projects.map(p => p.category)));

    return (
      <main className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <div className="border-b border-[var(--hairline)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-[var(--mute)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[var(--ink)] mb-4">Proyek Saya</h1>
            <p className="text-lg text-[var(--body)]">
              Kumpulan proyek web development dan game development yang pernah saya kerjakan.
            </p>
          </div>

          {/* Projects by Category */}
          {categories.map((category) => {
            const categoryProjects = projects.filter(p => p.category === category);
            return (
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-semibold text-[var(--ink)] mb-6 pb-2 border-b border-[var(--hairline)]">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group animate-fadeIn"
                    >
                      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl overflow-hidden hover:border-[var(--primary)]/40 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        {/* Image wrapped in Link */}
                        {project.image_url && (
                          <Link
                            href={`/projects/${project.id}`}
                            className="relative w-full h-48 overflow-hidden bg-[var(--surface-soft)] block"
                          >
                            <Image
                              src={project.image_url}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              quality={80}
                            />
                          </Link>
                        )}

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <Link 
                              href={`/projects/${project.id}`} 
                              className="hover:text-[var(--primary)] transition-colors"
                            >
                              <h3 className="text-lg font-semibold text-[var(--ink)]">
                                {project.title}
                              </h3>
                            </Link>
                            <Badge variant="accent" className="flex-shrink-0">
                              {project.category}
                            </Badge>
                          </div>

                          <p className="text-[var(--body)] text-sm mb-4 flex-1 leading-relaxed">
                            {project.description}
                          </p>

                          {/* Technologies */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.slice(0, 3).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex gap-2 pt-4 border-t border-[var(--hairline)]">
                            {project.github_link && (
                              <a
                                href={project.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
                              >
                                <Button variant="ghost" size="sm">
                                  GitHub
                                </Button>
                              </a>
                            )}
                            {project.live_link && (
                              <a
                                href={project.live_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
                              >
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            <div className="flex-1" />
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="ghost" size="sm" className="text-[var(--primary)]">
                                Detail →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[var(--mute)] text-lg">Belum ada proyek tersedia.</p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading projects:', error);
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-[var(--ink)] mb-4">Terjadi Kesalahan</h1>
            <p className="text-[var(--mute)]">Gagal memuat proyek. Silakan coba lagi nanti.</p>
          </div>
        </div>
      </main>
    );
  }
}
