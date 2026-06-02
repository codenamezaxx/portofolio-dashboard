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
import { ArrowLeft, ExternalLink, Gamepad2 } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import BackgroundGrid from '@/components/shared/BackgroundGrid';
import GlassCard from '@/components/ui/GlassCard';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

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
      <main className="relative min-h-screen bg-background pb-20 overflow-hidden">
        <BackgroundGrid />

        {/* Hero Section */}
        {project.image_url && (
          <div className="relative h-[60vh] flex items-end">
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              className="object-cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex items-center justify-between mb-6">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-2 text-mute hover:text-primary transition-all duration-300 text-sm font-bold bg-surface-soft/50 backdrop-blur-sm px-4 py-2 rounded-full border border-hairline hover:border-primary/30"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Kembali ke Proyek
                </Link>
                <ThemeToggleButton />
              </div>
              <Badge variant="accent" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-3">
                {project.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold text-ink mb-4 tracking-tight leading-tight">
                {project.title}
              </h1>
              <p className="text-body text-lg max-w-2xl leading-relaxed opacity-90">
                {project.description}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <GlassCard className="mb-12 p-8 border-white/5 shadow-xl">
              <h2 className="text-lg font-black text-ink mb-6 tracking-tight">Teknologi yang Digunakan</h2>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech) => (
                  <Badge 
                    key={tech} 
                    variant="outline" 
                    className="text-[10px] font-bold rounded-lg border-hairline bg-surface-soft/50 px-2.5 py-1 text-ink/80"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Links */}
          <GlassCard className="mb-12 p-8 border-white/5 shadow-xl">
            <h2 className="text-lg font-black text-ink mb-6 tracking-tight">Tautan Proyek</h2>
            <div className="flex flex-wrap gap-4">
              {project.github_link && (
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn"
                >
                  <Button variant="secondary" size="lg" className="rounded-xl h-12 px-6 font-bold hover:bg-surface-soft">
                    <GithubIcon className="w-5 h-5 mr-2 group-hover/btn:rotate-12 transition-transform" />
                    GitHub
                  </Button>
                </a>
              )}
              {project.live_link && (
                <a
                  href={project.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn"
                >
                  <Button variant="primary" size="lg" className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Live Demo
                  </Button>
                </a>
              )}
              {project.demo_link && (
                <a
                  href={project.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn"
                >
                  <Button variant="secondary" size="lg" className="rounded-xl h-12 px-6 font-bold hover:bg-surface-soft">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Main Game
                  </Button>
                </a>
              )}
            </div>
          </GlassCard>

          {/* Prev / Next Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t border-hairline/30">
            {previousProject ? (
              <Link href={`/projects/${previousProject.id}`}>
                <Button variant="secondary" className="w-full justify-start gap-2 h-12 rounded-xl px-6 font-bold hover:bg-surface-soft">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="truncate">Prev: {previousProject.title}</span>
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextProject ? (
              <Link href={`/projects/${nextProject.id}`}>
                <Button variant="secondary" className="w-full justify-end gap-2 h-12 rounded-xl px-6 font-bold hover:bg-surface-soft">
                  <span className="truncate">Next: {nextProject.title}</span>
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}
