import React from 'react';
import { motion } from 'framer-motion';
import { JOURNEY } from '../../data/portfolio';
import { staggerContainer, fadeInUp } from '../../lib/motion';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../shared/SectionHeader';

const Journey: React.FC = () => {
  return (
    <section id="journey" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionHeader 
            title="Tentang & Timeline" 
            subtitle="Perjalanan pembelajaran saya" 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNEY.map((item, index) => (
              <motion.div key={item.id} variants={fadeInUp} className="h-full">
                <GlassCard className="p-6 h-full flex flex-col hover:bg-primary/[0.03] transition-colors">
                  <span className="text-4xl font-display font-bold text-primary/10 mb-4 block">
                    {item.year}
                  </span>
                  <div className="relative">
                    {/* Decorative line for timeline feel */}
                    <div className="absolute -left-6 top-1 w-1 h-8 bg-accent/50 rounded-r-full" />
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Journey;