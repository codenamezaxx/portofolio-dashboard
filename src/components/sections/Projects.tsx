'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import Button from '../ui/Button';
import SectionHeader from '../shared/SectionHeader';
import ProjectCard from '../ui/ProjectCard';
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
            center={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {featuredProjects.map((project) => (
              <motion.div 
                key={project.id} 
                variants={fadeInUp}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="mt-16 text-center">
            <Button 
              variant="primary" 
              className='py-6 px-7 text-md font-medium dark:shadow-primary/20 shadow-xl hover:scale-[1.05] transition-transform duration-300 cursor-pointer'
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
