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
  const [activeProjectId, setActiveProjectId] = React.useState<number | string | null>(null);

  // Sort by displayOrder and take top 4 for landing page
  const featuredProjects = [...items]
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .slice(0, 4);

  return (
    <section id="projects" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionHeader
            title="Projek Pilihan"
            subtitle="Portfolio"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {featuredProjects.map((project) => (
              <motion.div 
                key={project.id} 
                variants={fadeInUp}
                animate={activeProjectId === project.id ? "hover" : "initial"}
                onMouseEnter={() => setActiveProjectId(project.id)}
                onMouseLeave={() => setActiveProjectId(null)}
                onClick={() => setActiveProjectId(activeProjectId === project.id ? null : project.id)}
                initial="initial"
                className="cursor-pointer"
              >
                <GlassCard className="h-[450px] md:h-[500px] flex flex-col justify-end overflow-hidden group/card border-white/5 dark:shadow-primary/10 shadow-xl backdrop-blur-md rounded-3xl">

                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <motion.div
                      variants={{
                        initial: { scale: 1 },
                        hover: { scale: 1.05 }
                      }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={project.image || project.imageUrl || '/images/placeholder.jpg'}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={false}
                        quality={90}
                        loading="lazy"
                      />
                    </motion.div>
                    {/* Gradient Overlay - Refined for depth */}
                    <motion.div 
                      variants={{
                        initial: { opacity: 0.85 },
                        hover: { opacity: 0.9 }
                      }}
                      className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent transition-opacity duration-500" 
                    />
                  </div>

                  {/* Content */}
                  <motion.div 
                    variants={{
                      initial: { y: 10 },
                      hover: { y: 0 }
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative z-10 p-10"
                  >
                    {/* Category */}
                    <div className="mb-4">
                      <span className="text-body-xs text-primary font-bold tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">
                        {project.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                      {project.title}
                    </h3>

                    {/* Description (Reveals on Hover) */}
                    <motion.div 
                      variants={{
                        initial: { height: 0, opacity: 0, marginBottom: 0 },
                        hover: { height: 'auto', opacity: 1, marginBottom: 28 }
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-body-sm text-gray-300 leading-relaxed max-w-md">
                        {project.description}
                      </p>
                    </motion.div>

                    {/* Tech Stack */}
                    <div className={`flex gap-2.5 mb-8 ${(project.tech || project.technologies || []).length > 5 ? 'overflow-x-auto scrollbar-hide pb-1 mask-fade-right' : 'flex-wrap'}`}>
                      {(project.tech || project.technologies || []).map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className={`border-white/10 bg-white/5 text-white/80 rounded-lg py-1 px-3 ${(project.tech || project.technologies || []).length > 5 ? 'flex-shrink-0' : ''}`}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <motion.div 
                      variants={{
                        initial: { opacity: 0, y: 10 },
                        hover: { opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="flex flex-wrap items-center gap-4"
                    >
                      {/* GitHub Button */}
                      {project.links?.github && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.links!.github, '_blank');
                          }}
                          variant="secondary"
                          className="!py-2 !px-3 text-sm bg-white/10 hover:bg-white/20 border-0 flex-shrink-0 cursor-pointer"
                          title="Lihat source code di GitHub"
                        >
                          <GithubIcon className="w-4 h-4 mr-1.5" /> GitHub
                        </Button>
                      )}

                      {/* Demo Langsung Button (Live Link) */}
                      {project.links?.live && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.links!.live, '_blank');
                          }}
                          className="!py-2 !px-3 text-sm flex-shrink-0 cursor-pointer"
                          title="Buka demo aplikasi"
                        >
                          <ExternalLink className="w-4 h-4 mr-1.5" /> Demo
                        </Button>
                      )}

                      {/* Itch.io Button (Demo Link in Backend) */}
                      {(project.links?.demo || project.links?.itchio) && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.links!.demo || project.links!.itchio, '_blank');
                          }}
                          className="!py-2 !px-3 text-sm bg-rose-600 hover:bg-rose-600/50 text-white border border-rose-500/30 flex-shrink-0 cursor-pointer"
                          title="Mainkan di itch.io"
                        >
                          <Gamepad2 className="w-4 h-4 mr-1.5" /> itch.io
                        </Button>
                      )}
                    </motion.div>
                  </motion.div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="mt-16 text-center">
            <Button 
              variant="primary" 
              className='cursor-pointer'
              onClick={() => router.push('/projects')}
              >
              <Code2 className="w-4 h-4 mr-2" /> Lihat Semua Proyek
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
