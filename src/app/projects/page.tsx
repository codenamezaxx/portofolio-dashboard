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
import { ArrowLeft, ExternalLink, Code2 } from 'lucide-react';
import SectionHeader from '@/components/shared/SectionHeader';
import BackgroundGrid from '@/components/shared/BackgroundGrid';
import GlassCard from '@/components/ui/GlassCard';
import { GithubIcon } from '@/components/ui/Icons';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

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
      <main className="relative min-h-screen bg-background pt-20 pb-32 overflow-hidden">
        <BackgroundGrid />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <Link
              href="/#projects"
              className="group inline-flex items-center gap-2 text-mute hover:text-primary transition-all duration-300 text-sm font-bold bg-surface-soft/50 backdrop-blur-sm px-4 py-2 rounded-full border border-hairline hover:border-primary/30"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
            <ThemeToggleButton />
          </div>

          <SectionHeader
            title="Proyek Pilihan"
            subtitle="PROJECT GALLERY"
            description="Eksplorasi karya digital dan solusi teknis yang telah saya bangun."
          />

          {/* Projects by Category */}
          {categories.map((category) => {
            const categoryProjects = projects.filter(p => p.category === category);
            return (
              <div key={category} className="mb-20 last:mb-0">
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-2xl font-black text-ink tracking-tight">
                    {category}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-hairline to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {categoryProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group/card animate-fadeIn"
                    >
                      <GlassCard className="h-full flex flex-col overflow-hidden border-white/5 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 rounded-3xl">
                        {/* Image wrapped in Link */}
                        {project.image_url && (
                          <Link
                            href={`/projects/${project.id}`}
                            className="relative w-full h-64 overflow-hidden block"
                          >
                            <Image
                              src={project.image_url}
                              alt={project.title}
                              fill
                              className="object-cover group-hover/card:scale-110 transition-transform duration-700"
                              quality={90}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                               <div className="bg-primary text-on-primary p-4 rounded-full scale-50 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100 transition-all duration-500 delay-100 shadow-xl shadow-primary/20">
                                  <Code2 className="w-6 h-6" />
                               </div>
                            </div>
                          </Link>
                        )}

                        {/* Content */}
                        <div className="p-8 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="space-y-1">
                                <Badge variant="accent" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                  {project.category}
                                </Badge>
                                <Link 
                                  href={`/projects/${project.id}`} 
                                  className="block pt-2 group/title"
                                >
                                  <h3 className="text-2xl font-black text-ink group-hover/title:text-primary transition-colors leading-tight tracking-tight">
                                    {project.title}
                                  </h3>
                                </Link>
                            </div>
                          </div>

                          <p className="text-body text-sm mb-8 flex-1 leading-relaxed line-clamp-3 opacity-80">
                            {project.description}
                          </p>

                          {/* Technologies */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                              {project.technologies.slice(0, 4).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-[10px] font-bold rounded-lg border-hairline bg-surface-soft/50 px-2.5 py-1">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 4 && (
                                <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-hairline bg-surface-soft/30 px-2.5 py-1">
                                  +{project.technologies.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex items-center gap-4 pt-6 border-t border-hairline/30">
                            {project.github_link && (
                              <a
                                href={project.github_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/btn"
                              >
                                <Button variant="secondary" size="sm" className="rounded-xl h-11 px-5 font-bold hover:bg-surface-soft">
                                  <GithubIcon className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                                  Code
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
                                <Button variant="primary" size="sm" className="rounded-xl h-11 w-11 p-0 flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            <div className="flex-1" />
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary font-black cursor-pointer hover:bg-primary/5 rounded-xl px-5 transition-all group/detail">
                                Detail <span className="inline-block group-hover/detail:translate-x-1 transition-transform ml-1">→</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </GlassCard>
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
