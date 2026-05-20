'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, Code2, Gamepad2 } from 'lucide-react';
import { GithubIcon } from '../ui/Icons';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import SectionHeader from '../shared/SectionHeader';
import type { Project } from '@/types';

interface ProjectsProps {
  items?: Project[];
}

const defaultProjects: Project[] = [
  {
    id: 1,
    title: "Online Quran",
    description: "Aplikasi pembacaan Al-Quran online dengan fitur pencarian, tafsir, dan terjemahan.",
    category: "Web App",
    image: "/images/quranjs.jpg",
    tech: ["React", "W3.CSS", "Al-Quran API"],
    links: {
      github: "https://github.com/codenamezaxx/ReactJs-Online-Quran",
      demo: "https://alquran.codenamezaxx.my.id"
    }
  },
  {
    id: 2,
    title: "SI-PORSI GERMAS",
    description: "Platform terpadu untuk mengelola pelaporan, evaluasi, dan arsip program GERMAS di tatanan tempat kerja di Provinsi Jawa Timur. Dibangun saat mengikuti program internship di Dinas Kesehatan Provinsi Jawa Timur.",
    category: "Web App",
    image: "/images/germas.png",
    tech: ["React", "Laravel", "MySQL", "PHP", "TypeScript", "Tailwind"],
    links: {
      github: "https://github.com/codenamezaxx/siporsi-germas",
      demo: "https://demo.com"
    }
  },
  {
    id: 3,
    title: "Cyberurnner",
    description: "Game platformer 2D dengan tema cyberpunk. Pemain mengendalikan karakter yang harus berlari dan melompat melewati rintangan serta serangan musuh sambil mengumpulkan koin dan gems.",
    category: "Game Dev",
    image: "https://img.itch.zone/aW1nLzkwNzYzNTEuanBn/315x250%23c/uI6egT.jpg",
    tech: ["Godot Engine", "GDScript", "Photoshop", "Aseprite"],
    links: {
      itchio: "https://codenamezaxx.itch.io/cyberunner-demo"
    }
  },
  {
    id: 4,
    title: "Diamond Hunter: The Rivals",
    description: "Kumpulkan berlian sebanyak mungkin dan hindari serangan musuh pada game 2D yang sederhana namun seru dan menantang.",
    category: "Game Dev",
    image: "https://img.itch.zone/aW1nLzkxMDI0MDgucG5n/315x250%23c/HWbGq1.png",
    tech: ["Construct 2", "Photoshop"],
    links: {
      itchio: "https://codenamezaxx.itch.io/diamond-hunter-the-rivals",
      demo: "https://diamond-hunter.netlify.app"
    }
  }
];

const Projects: React.FC<ProjectsProps> = ({ items = defaultProjects }) => {
  const router = useRouter();

  return (
    <section id="projects" className="py-20 md:py-32 relative bg-canvas dark:bg-canvas">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionHeader
            title="Projek & Aplikasi"
            subtitle="Portfolio"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
            {items.map((project) => (
              <motion.div key={project.id} variants={fadeInUp}>
                <GlassCard className="group h-[400px] md:h-[450px] flex flex-col justify-end overflow-hidden">

                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    {/* 
                      Responsive project image with srcset for different screen sizes:
                      - Mobile (100vw): Full viewport width
                      - Tablet/Desktop (50vw): Half viewport width (2-column grid)
                      
                      Next.js automatically generates srcset with:
                      - AVIF format (best compression)
                      - WebP format (fallback)
                      - Original format (final fallback)
                      
                      Lazy loading for off-screen images (default behavior)
                      Quality set to 80 for good balance between quality and file size
                    */}
                    <Image
                      src={project.image || project.imageUrl || '/images/placeholder.jpg'}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={false}
                      quality={80}
                      loading="lazy"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8 transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                    {/* Category */}
                    <div className="mb-4">
                      <span className="text-body-xs text-primary dark:text-primary font-semibold tracking-wide uppercase">
                        {project.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-heading-md md:text-heading-lg font-bold text-ink dark:text-ink mb-3">
                      {project.title}
                    </h3>

                    {/* Description (Reveals on Hover) */}
                    <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-hover:mb-6">
                      <p className="text-body-sm text-body dark:text-body leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div className={`flex gap-2 mb-6 ${(project.tech || project.technologies || []).length > 5 ? 'overflow-x-auto scrollbar-hide pb-1 mask-fade-right' : 'flex-wrap'}`}>
                      {(project.tech || project.technologies || []).map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className={`border-primary/20 bg-primary/10 ${(project.tech || project.technologies || []).length > 5 ? 'flex-shrink-0' : ''}`}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 delay-75">
                      {/* GitHub Button */}
                      {project.links?.github && (
                        <Button
                          onClick={() => window.open(project.links!.github, '_blank')}
                          variant="secondary"
                          className="!py-2 !px-3 text-sm bg-white/10 hover:bg-white/20 border-0 flex-shrink-0"
                          title="Lihat source code di GitHub"
                        >
                          <GithubIcon className="w-4 h-4 mr-1.5" /> GitHub
                        </Button>
                      )}

                      {/* Demo Langsung Button */}
                      {(project.links?.demo || project.links?.live) && (
                        <Button
                          onClick={() => window.open(project.links!.demo || project.links!.live, '_blank')}
                          className="!py-2 !px-3 text-sm flex-shrink-0"
                          title="Buka demo aplikasi"
                        >
                          <ExternalLink className="w-4 h-4 mr-1.5" /> Demo
                        </Button>
                      )}

                      {/* Itch.io Button */}
                      {project.links?.itchio && (
                        <Button
                          onClick={() => window.open(project.links!.itchio, '_blank')}
                          className="!py-2 !px-3 text-sm bg-rose-600 hover:bg-rose-600/50 text-white border border-rose-500/30 flex-shrink-0"
                          title="Mainkan di itch.io"
                        >
                          <Gamepad2 className="w-4 h-4 mr-1.5" /> itch.io
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="mt-16 text-center">
            <Button variant="outline" onClick={() => router.push('/projects')}>
              <Code2 className="w-4 h-4 mr-2" /> Lihat Semua Proyek
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
