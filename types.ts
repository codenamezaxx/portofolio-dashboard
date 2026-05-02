import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  socials: {
    github: string;
    linkedin: string;
    instagram?: string;
    telegram?: string;
    email: string;
  };
}

export interface Achievement {
  id: number;
  title: string;
  category: string;
  year: string;
  pdfPath: string;
}

export interface JourneyItem {
  id: number;
  year: string;
  title: string;
  description: string;
}

export interface TechItem {
  name: string;
  icon: string; // URL to the logo image
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  tech: string[];
  links: {
    github?: string;
    demo?: string;
    itchio?: string;
    download?: string;
  };
}