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
        className="block text-primary font-semibold tracking-wider text-body-xs mb-2 uppercase"
      >
        {subtitle}
      </motion.span>
      <motion.h2 
        variants={fadeInUp}
        className="text-display-lg md:text-display-xl font-bold text-ink dark:text-ink"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p 
          variants={fadeInUp}
          className="text-body-md text-body dark:text-body mt-4"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;
