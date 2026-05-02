import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Code2, Download, Gamepad2 } from 'lucide-react';
import { PROJECTS } from '../../data/portfolio';
import { staggerContainer, fadeInUp } from '../../lib/motion';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import SectionHeader from '../shared/SectionHeader';

const Projects: React.FC = () => {
  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            title="Projek & Aplikasi" 
            subtitle="Portfolio" 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PROJECTS.map((project) => (
              <motion.div key={project.id} variants={fadeInUp}>
                <GlassCard className="group h-[400px] md:h-[450px] flex flex-col justify-end overflow-hidden">
                  
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8 transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                    {/* Category */}
                    <div className="mb-4">
                      <span className="text-accent text-sm font-medium tracking-wide">
                        {project.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-primary mb-3">
                      {project.title}
                    </h3>

                    {/* Description (Reveals on Hover) */}
                    <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-hover:mb-6">
                      <p className="text-muted text-sm md:text-base leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    <div className={`flex gap-2 mb-6 ${project.tech.length > 5 ? 'overflow-x-auto scrollbar-hide pb-1 mask-fade-right' : 'flex-wrap'}`}>
                      {project.tech.map((tech) => (
                        <Badge 
                          key={tech} 
                          variant="outline" 
                          className={`border-accent/20 bg-primary/10 ${project.tech.length > 5 ? 'flex-shrink-0' : ''}`}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 delay-75">
                      {/* GitHub Button */}
                      {project.links.github && (
                        <Button 
                          onClick={() => window.open(project.links.github, '_blank')}
                          variant="secondary"
                          className="!py-2 !px-3 text-sm bg-white/10 hover:bg-white/20 border-0 flex-shrink-0"
                          title="Lihat source code di GitHub"
                        >
                          <Github className="w-4 h-4 mr-1.5" /> GitHub
                        </Button>
                      )}
                      
                      {/* Demo Langsung Button */}
                      {project.links.demo && (
                        <Button 
                          onClick={() => window.open(project.links.demo, '_blank')}
                          className="!py-2 !px-3 text-sm flex-shrink-0"
                          title="Buka demo aplikasi"
                        >
                          <ExternalLink className="w-4 h-4 mr-1.5" /> Demo
                        </Button>
                      )}

                      {/* Itch.io Button */}
                      {project.links.itchio && (
                        <Button 
                          onClick={() => window.open(project.links.itchio, '_blank')}
                          className="!py-2 !px-3 text-sm bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 flex-shrink-0"
                          title="Mainkan di itch.io"
                        >
                          <Gamepad2 className="w-4 h-4 mr-1.5" /> itch.io
                        </Button>
                      )}

                      {/* Download Button */}
                      {project.links.download && (
                        <Button 
                          onClick={() => handleDownload(project.links.download!)}
                          variant="secondary"
                          className="!py-2 !px-3 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 flex-shrink-0"
                          title="Download project"
                        >
                          <Download className="w-4 h-4 mr-1.5" /> Download
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="mt-16 text-center">
            <Button variant="outline" onClick={() => window.open('https://github.com', '_blank')}>
              <Code2 className="w-4 h-4 mr-2" /> Lihat Semua Proyek di GitHub
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;