'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  description?: string;
  center?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, subtitle, center = false }) => {
  return (
    <div className={`mb-16 ${center ? 'text-center' : ''}`}>
      <motion.span 
        variants={fadeInUp}
        className="block text-primary font-bold tracking-[0.2em] text-xs md:text-sm mb-3 uppercase opacity-90"
      >
        {subtitle}
      </motion.span>
      <motion.h2 
        variants={fadeInUp}
        className="text-4xl md:text-5xl font-black text-ink dark:text-ink tracking-tight"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p 
          variants={fadeInUp}
          className="text-body-sm md:text-body-md text-body dark:text-body mt-4"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;
