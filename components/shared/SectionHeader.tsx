import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/motion';

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
        className="block text-accent font-semibold tracking-wider text-sm mb-2 uppercase"
      >
        {subtitle}
      </motion.span>
      <motion.h2 
        variants={fadeInUp}
        className="text-3xl md:text-4xl font-display font-bold text-primary"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p 
          variants={fadeInUp}
          className="text-lg text-muted mt-4"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;