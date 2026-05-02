import React from 'react';
import { motion } from 'framer-motion';
import { TECH_STACK } from '../../data/portfolio';
import { staggerContainer, fadeInUp } from '../../lib/motion';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../shared/SectionHeader';

const TechStack: React.FC = () => {
  return (
    <section id="tech" className="py-20 relative">
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

          <motion.div variants={fadeInUp} className="relative w-full overflow-hidden mask-fade-sides py-8">
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex gap-8 w-max animate-marquee hover:[animation-play-state:paused]">
              {/* First Set */}
              {[...TECH_STACK, ...TECH_STACK].map((skill, index) => (
                <GlassCard 
                  key={`${skill.name}-${index}`} 
                  className="px-6 py-4 flex items-center gap-3 bg-primary/[0.05] hover:bg-primary/[0.10] transition-colors border-accent/10 min-w-[160px] justify-center group"
                >
                  <div className="w-8 h-8 relative flex items-center justify-center">
                    <img 
                      src={skill.icon} 
                      alt={skill.name} 
                      className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 ${skill.name === 'Next.js' ? 'invert' : ''}`}
                    />
                  </div>
                  <span className="font-medium text-lg text-muted group-hover:text-primary transition-colors">
                    {skill.name}
                  </span>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;