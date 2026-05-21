'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../shared/SectionHeader';
import type { JourneyItem } from '@/lib/portfolio-data';

interface JourneyProps {
  items?: JourneyItem[] | null;
}

const Journey: React.FC<JourneyProps> = ({ items = null }) => {
  const constraintsRef = React.useRef<HTMLDivElement>(null);

  // Default journey items for fallback
  const defaultJourneyItems: JourneyItem[] = [
    {
      year: '2020',
      title: 'Memulai Perjalanan',
      description: 'Memulai belajar web development dan menjadi passionate tentang teknologi.',
      display_order: 1
    },
    {
      year: '2021',
      title: 'Pertama Kali Berbicara',
      description: 'Memberikan talk pertama saya tentang web development di komunitas lokal.',
      display_order: 2
    },
    {
      year: '2022',
      title: 'Pengalaman Profesional',
      description: 'Memulai karir profesional sebagai Front-End Developer di perusahaan teknologi.',
      display_order: 3
    },
    {
      year: '2024',
      title: 'Terus Berkembang',
      description: 'Terus belajar teknologi baru dan berbagi pengetahuan dengan komunitas.',
      display_order: 4
    }
  ];

  const journeyItems = items && items.length > 0 ? items : defaultJourneyItems;

  return (
    <section id="journey" className="py-20 relative bg-canvas dark:bg-canvas">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto"
        >
          <SectionHeader
            title="Tentang & Timeline"
            subtitle="Perjalanan pembelajaran saya"
          />

          <div ref={constraintsRef} className="relative overflow-hidden">
            {/* Carousel Inner Track */}
            <motion.div 
              className="flex gap-6 pb-8 pt-4 cursor-grab active:cursor-grabbing w-max"
              drag="x"
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragMomentum={true}
              whileTap={{ cursor: 'grabbing' }}
            >
              {journeyItems.map((item, index) => (
                <motion.div 
                  key={item.id || index} 
                  variants={fadeInUp} 
                  className="flex-shrink-0 w-[280px] md:w-[320px]"
                >
                  <GlassCard className="p-6 h-[250px] flex flex-col bg-surface-card dark:bg-surface-card border-hairline dark:border-hairline hover:border-primary/30 dark:hover:border-primary/30 transition-colors">
                    <span className="text-xl font-bold text-primary dark:text-primary mb-4 block">
                      {item.year}
                    </span>
                    <div className="relative">
                      {/* Decorative line for timeline feel */}
                      <div className="absolute -left-6 top-1 w-1 h-8 bg-primary/50 dark:bg-primary/50 rounded-r-full" />
                      <h3 className="text-display-lg font-bold text-ink dark:text-ink mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-body-sm text-body/70 dark:text-body/70 leading-relaxed line-clamp-4">
                        {item.description}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Hint for scrolling */}
            <div className="mt-4 flex justify-center md:justify-start">
              <div className="flex items-center gap-2 text-xs text-mute/50 uppercase tracking-widest">
                <span>Geser untuk melihat lebih banyak</span>
                <div className="w-12 h-px bg-mute/30" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Journey;
