'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Gamepad2 } from 'lucide-react';
import { GithubIcon } from './Icons';
import Button from './Button';

interface ProjectCardProps {
  project: {
    id: string | number;
    title: string;
    description: string;
    category: string;
    image?: string;
    image_url?: string;
    imageUrl?: string;
    tech?: string[];
    technologies?: string[];
    links?: {
      github?: string;
      live?: string;
      demo?: string;
      itchio?: string;
    };
    github_link?: string;
    live_link?: string;
    demo_link?: string;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const imageUrl = project.image || project.image_url || project.imageUrl || '/images/placeholder.jpg';
  const technologies = project.tech || project.technologies || [];
  const githubLink = project.links?.github || project.github_link;
  const liveLink = project.links?.live || project.live_link;
  
  // Itch.io link can be in links.itchio, or hidden in demo_link/links.demo
  const itchioLink = project.links?.itchio || 
                    (project.links?.demo?.includes('itch.io') ? project.links.demo : undefined) ||
                    (project.demo_link?.includes('itch.io') ? project.demo_link : undefined);
                    
  const demoLink = project.links?.demo || project.demo_link || project.links?.itchio;
  const finalDemoLink = liveLink || demoLink;

  return (
    <div className="group overflow-hidden rounded-2xl border border-hairline bg-surface-card/10 dark:bg-surface-card/10 backdrop-blur-md shadow-xl hover:shadow-lg dark:shadow-primary/10 transition-all duration-300 flex flex-col h-full">
      {/* Top Section: Clean Image Preview */}
      <Link 
        href={`/projects/${project.id}`}
        className="relative aspect-video w-full overflow-hidden bg-surface-card dark:bg-surface-card block"
      >
        <Image
          src={imageUrl}
          alt={project.title}
          fill
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={90}
        />
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-surface-card dark:bg-surface-card dark:text-primary shadow-sm backdrop-blur-sm">
            {project.category}
          </span>
        </div>
      </Link>

      {/* Bottom Section: Plain Background Content Area */}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="space-y-2">
          <Link href={`/projects/${project.id}`}>
            <h3 className="py-2 text-2xl font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {project.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tags & Metadata Alignment */}
        <div className="flex flex-wrap gap-2 pt-1">
          {technologies.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-card dark:bg-surface-card dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-surface-card dark:bg-surface-card dark:text-slate-400">
              +{technologies.length - 5}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 mt-auto border-t border-hairline">
          {githubLink && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                window.open(githubLink, '_blank');
              }}
              variant="outline"
              className="!p-2 h-10 w-10 rounded-xl text-foreground hover:text-primary hover:bg-primary/5 cursor-pointer"
              title="Lihat source code di GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </Button>
          )}

          {itchioLink && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                window.open(itchioLink, '_blank');
              }}
              variant="outline"
              className="!p-2 h-10 w-10 rounded-xl text-foreground hover:text-rose-500 hover:bg-rose-500/5 cursor-pointer"
              title="Mainkan di itch.io"
            >
              <Gamepad2 className="w-5 h-5" />
            </Button>
          )}

          <div className="flex-1" />

          {finalDemoLink && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                window.open(finalDemoLink, '_blank');
              }}
              className="rounded-xl px-5 py-2 font-medium shadow-lg shadow-primary/10 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              title="Buka demo aplikasi"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Demo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
