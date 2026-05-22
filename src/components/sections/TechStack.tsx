'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../shared/SectionHeader';
import type { TechStackItem } from '@/lib/portfolio-data';

interface TechStackProps {
  initialData?: TechStackItem[];
}

const TechStack: React.FC<TechStackProps> = ({ initialData = [] }) => {
  const [techStack, setTechStack] = useState<TechStackItem[]>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData || initialData.length === 0);

  useEffect(() => {
    // Only fetch if no initial data provided
    if (!initialData || initialData.length === 0) {
      const fetchTechStack = async () => {
        try {
          const response = await fetch('/api/content/tech-stack');
          if (response.ok) {
            const data = await response.json();
            setTechStack(data.data || []);
          }
        } catch (error) {
          console.error('Error fetching tech stack:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTechStack();
    } else {
      setIsLoading(false);
    }
  }, [initialData]);

  // Use initial data if provided, otherwise use fetched data
  const displayData = initialData && initialData.length > 0 ? initialData : techStack;

  return (
    <section id="tech" className="py-20 relative bg-canvas dark:bg-canvas">
      <div className="container mx-auto px-6">
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

          {isLoading ? (
            <motion.div variants={fadeInUp} className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </motion.div>
          ) : displayData.length === 0 ? (
            <motion.div variants={fadeInUp} className="text-center py-12">
              <p className="text-body">No tech stack items available</p>
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp} className="relative w-full overflow-hidden mask-fade-sides py-8">
              {/* Gradient masks for smooth fade edges */}
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-canvas dark:from-canvas to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-canvas dark:from-canvas to-transparent z-10 pointer-events-none" />

              {/* 
                Infinite marquee: renders items twice.
                CSS animates translateX(0) → translateX(-50%), which lands 
                exactly at the start of the second copy — creating a seamless loop.
              */}
              <div className="flex gap-5 w-max animate-marquee">
                {[...displayData, ...displayData].map((skill, index) => (
                  <GlassCard 
                    key={`${skill.id || skill.name}-${index}`} 
                    className="px-6 py-4 flex items-center gap-3 bg-surface-card dark:bg-surface-card border-hairline dark:border-hairline hover:border-primary/30 dark:hover:border-primary/30 transition-colors min-w-[160px] justify-center group"
                  >
                    <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0">
                      <Image 
                        src={skill.icon_url} 
                        alt={skill.name} 
                        width={32}
                        height={32}
                        className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 ${skill.name === 'Next.js' ? 'dark:invert' : ''}`}
                        loading="lazy"
                        quality={80}
                      />
                    </div>
                    <span className="font-body-strong text-body-md text-body dark:text-body group-hover:text-primary transition-colors whitespace-nowrap">
                      {skill.name}
                    </span>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;
