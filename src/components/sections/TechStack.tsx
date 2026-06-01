'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { staggerContainer } from '@/lib/motion';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../shared/SectionHeader';
import type { TechStackItem } from '@/lib/portfolio-data';

interface TechStackProps {
  initialData?: TechStackItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TechStack: React.FC<TechStackProps> = ({ initialData = [] }) => {
  const { data, error } = useSWR('/api/content/tech-stack', fetcher, {
    fallbackData: initialData && initialData.length > 0 ? { data: initialData } : undefined,
    revalidateOnFocus: false,
  });

  const techStack = data?.data || [];
  const isLoading = !data && !error;

  // Split tech stack into two rows for animation
  const row1 = techStack.slice(0, Math.ceil(techStack.length / 2));
  const row2 = techStack.slice(Math.ceil(techStack.length / 2));

  // Duplicating items for seamless infinite scroll
  // We repeat items multiple times to ensure enough width for any screen size
  const duplicatedRow1 = [...row1, ...row1, ...row1, ...row1];
  const duplicatedRow2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <section id="tech" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionHeader 
            title="Tech Stack" 
            subtitle="Alat & teknologi yang saya gunakan" 
            center={true}
          />
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : techStack.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-body">No tech stack items available</p>
        </div>
      ) : (
        <div className="space-y-12 py-4">
          {/* Row 1: Scrolling Left */}
          <div className="flex overflow-hidden group">
            <motion.div 
              className="flex gap-6 whitespace-nowrap"
              animate={{
                x: [0, -1000], 
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
              style={{ width: 'max-content' }}
            >
              {duplicatedRow1.map((skill: TechStackItem, idx: number) => (
                <div key={`${skill.id || skill.name}-${idx}`} className="w-[180px] md:w-[220px] shrink-0">
                  <GlassCard 
                    className="p-6 h-full flex flex-col items-center gap-4 text-center group/card transition-all duration-300 border-white/5 dark:border-white/5 shadow-soft-light dark:shadow-soft-dark"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover/card:bg-primary/20">
                      {skill.icon ? (
                        <div className="relative w-10 h-10">
                          <Image 
                            src={skill.icon} 
                            alt={skill.name} 
                            fill
                            className={`object-contain transition-transform duration-500 group-hover/card:scale-110 ${skill.name === 'Next.js' ? 'dark:invert' : ''}`}
                            loading="lazy"
                            quality={80}
                          />
                        </div>
                      ) : (
                        <span className="text-primary text-2xl font-bold">
                          {skill.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-body-strong text-body-md text-body dark:text-body group-hover/card:text-primary transition-colors">
                      {skill.name}
                    </h3>
                  </GlassCard>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2: Scrolling Right */}
          <div className="flex overflow-hidden group">
            <motion.div 
              className="flex gap-6 whitespace-nowrap"
              initial={{ x: -1000 }}
              animate={{
                x: [-1000, 0], 
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
              style={{ width: 'max-content' }}
            >
              {duplicatedRow2.map((skill: TechStackItem, idx: number) => (
                <div key={`${skill.id || skill.name}-${idx}`} className="w-[180px] md:w-[220px] shrink-0">
                  <GlassCard 
                    className="p-6 h-full flex flex-col items-center gap-4 text-center group/card transition-all duration-300 border-white/5 dark:border-white/5 shadow-soft-light dark:shadow-soft-dark"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover/card:bg-primary/20">
                      {skill.icon ? (
                        <div className="relative w-10 h-10">
                          <Image 
                            src={skill.icon} 
                            alt={skill.name} 
                            fill
                            className={`object-contain transition-transform duration-500 group-hover/card:scale-110 ${skill.name === 'Next.js' ? 'dark:invert' : ''}`}
                            loading="lazy"
                            quality={80}
                          />
                        </div>
                      ) : (
                        <span className="text-primary text-2xl font-bold">
                          {skill.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-body-strong text-body-md text-body dark:text-body group-hover/card:text-primary transition-colors">
                      {skill.name}
                    </h3>
                  </GlassCard>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TechStack;
