/**
 * Project Detail Page
 * Displays detailed information about a specific project
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectById, getProjects } from '@/lib/portfolio-data';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, GitBranch, ExternalLink, Gamepad2 } from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((project) => ({
      id: project.id?.toString() || ''
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata(
  { params }: ProjectDetailPageProps
): Promise<Metadata> {
  try {
    const { id } = await params;
    const project = await getProjectById(id);
    if (!project) {
      return {
        title: 'Proyek Tidak Ditemukan',
        description: 'Proyek yang Anda cari tidak ada.'
      };
    }
    return {
      title: `${project.title} | Zakky Ahmad El-Kholily`,
      description: project.description,
      openGraph: {
        title: project.title,
        description: project.description,
        type: 'website',
        images: project.image_url ? [{ url: project.image_url }] : []
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: project.description,
        images: project.image_url ? [project.image_url] : []
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Proyek', description: 'Detail proyek' };
  }
}

export const revalidate = 3600;

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);
    if (!project) notFound();

    const allProjects = await getProjects();
    const currentIndex = allProjects.findIndex(p => p.id === project.id);
    const previousProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
    const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

    return (
      <main className="min-h-screen bg-[var(--background)]">
        {/* Sticky Header */}
        <div className="border-b border-[var(--hairline)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-[var(--mute)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Proyek
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Image */}
          {project.image_url && (
            <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden mb-8 border border-[var(--hairline)]">
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover"
                priority
                quality={80}
              />
            </div>
          )}

          {/* Title and Category */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--ink)]">{project.title}</h1>
              <Badge variant="accent">{project.category}</Badge>
            </div>
            <p className="text-lg text-[var(--body)] leading-relaxed">{project.description}</p>
          </div>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-8 p-6 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl">
              <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Teknologi yang Digunakan</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Tautan</h2>
            <div className="flex flex-wrap gap-3">
              {project.github_link && (
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <GitBranch className="w-4 h-4" />
                    GitHub
                  </Button>
                </a>
              )}
              {project.live_link && (
                <a
                  href={project.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </Button>
                </a>
              )}
              {project.demo_link && (
                <a
                  href={project.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Main Game
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Prev / Next Navigation */}
          <div className="border-t border-[var(--hairline)] pt-8">
            <div className="grid grid-cols-2 gap-4">
              {previousProject ? (
                <Link href={`/projects/${previousProject.id}`}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="truncate">{previousProject.title}</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              {nextProject ? (
                <Link href={`/projects/${nextProject.id}`}>
                  <Button variant="outline" className="w-full justify-end gap-2">
                    <span className="truncate">{nextProject.title}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}
