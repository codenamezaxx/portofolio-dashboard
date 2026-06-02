/**
 * Projects Listing Page
 * Displays all projects with filtering and search
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { getProjects } from '@/lib/portfolio-data';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import SectionHeader from '@/components/shared/SectionHeader';
import BackgroundGrid from '@/components/shared/BackgroundGrid';
import { GithubIcon } from '@/components/ui/Icons';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import ProjectCard from '@/components/ui/ProjectCard';

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
                      <ProjectCard project={project} />
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
