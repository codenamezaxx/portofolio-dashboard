import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Download, Github, Linkedin, MousePointer2 } from 'lucide-react';
import { PROFILE } from '../../data/portfolio';
import { fadeInUp, staggerContainer } from '../../lib/motion';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-10 overflow-hidden">
      
      {/* Background Decorative Elements for Depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-400/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Adjusted grid gap from lg:gap-20 to lg:gap-12 to bring elements closer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Text Content */}
          {/* order-2 on mobile (bottom), order-1 on lg (left) */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1 flex flex-col items-start text-left"
          >
            {/* Main Typography */}
            <motion.div variants={fadeInUp}>
              <span className="inline-block py-1 px-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                Open to work
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp} 
              className="text-4xl md:text-5xl lg:text-7xl font-display font-bold tracking-tight mb-4 leading-tight text-primary"
            >
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-600">{PROFILE.name.split(' ')[0]}</span>
            </motion.h1>

            <motion.h2
               variants={fadeInUp}
               className="text-xl md:text-2xl text-muted font-medium mb-6"
            >
              {PROFILE.role}
            </motion.h2>

            {/* Tagline */}
            <motion.p 
              variants={fadeInUp} 
              className="text-md text-muted/90 max-w-xl mb-10 leading-relaxed"
            >
              {PROFILE.tagline}
            </motion.p>

            {/* Actions */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-start items-center gap-4 mb-12">
              <Button onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}>
                Mari Berbicara <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="secondary" onClick={() => window.open('/resume.pdf', '_blank')}>
                Unduh CV <Download className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Social Proof / Links */}
            <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-8 border-t border-accent/10 w-full justify-start">
               <a href={PROFILE.socials.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">
                 <Github className="w-6 h-6" />
               </a>
               <a href={PROFILE.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">
                 <Linkedin className="w-6 h-6" />
               </a>
               <div className="h-4 w-px bg-accent/15" />
               <span className="text-sm text-muted">Based in Indonesia</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Profile Image */}
          {/* order-1 on mobile (top), order-2 on lg (right) */}
          {/* Changed lg:block to lg:flex lg:justify-end to align image to the right */}
          <motion.div 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative flex justify-center lg:justify-end mb-8 lg:mb-0"
          >
             {/* Glowing Backdrop */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/15 rounded-full blur-[80px] pointer-events-none" />
             
             {/* Glass Frame Container */}
             <motion.div 
                className="relative z-10 p-4 bg-primary/5 backdrop-blur-sm border border-accent/30 rounded-[2rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 w-full max-w-[280px] lg:max-w-sm"
             >
                {/* Inner Image Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                  
                  {/* Professional Placeholder Image */}
                  <img 
                    src="/hero.jpg"
                    alt="Zakky Ahmad El-Kholily"
                    className="w-full h-full object-cover filter grayscale-[20%] contrast-110 hover:grayscale-0 transition-all duration-700"
                  />
                </div>
             </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted hidden md:flex"
      >
        <span className="text-xs uppercase tracking-widest">Gulir</span>
        <MousePointer2 className="w-5 h-5" />
      </motion.div>
    </section>
  );
};

export default Hero;