'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Send, 
  Mail, 
  MapPin, 
  Code2, 
  Zap, 
  Database, 
  Cpu,
  Server 
} from 'lucide-react';
import { LinkedinIcon, InstagramIcon, GithubIcon } from '@/components/ui/Icons';
import type { Profile, ContactInfo } from '@/types';

interface FooterProps {
  profile?: Profile | null;
  contactInfo?: ContactInfo | null;
}

const Footer: React.FC<FooterProps> = ({ profile, contactInfo }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Beranda', href: '/#hero' },
    { label: 'Perjalanan', href: '/#journey' },
    { label: 'Proyek', href: '/#projects' },
    { label: 'Sertifikat', href: '/#achievements' },
    { label: 'Kontak', href: '/#contacts' },
  ];

  const socialLinks = [
    { 
      label: 'GitHub', 
      href: contactInfo?.githubUrl || 'https://github.com/codenamezaxx', 
      icon: GithubIcon 
    },
    { 
      label: 'LinkedIn', 
      href: contactInfo?.linkedinUrl || 'https://linkedin.com/in/zakky-el', 
      icon: LinkedinIcon 
    },
    { 
      label: 'Instagram', 
      href: contactInfo?.instagramUrl || 'https://instagram.com/codenamezaxx', 
      icon: InstagramIcon 
    },
    { 
      label: 'Telegram', 
      href: contactInfo?.telegramUrl || 'https://t.me/codenamezaxx', 
      icon: Send 
    },
  ];

  return (
    <footer className="relative  bg-[var(--surface-doc)] text-[var(--foreground)] pt-20 pb-10 overflow-hidden border-t border-zinc-900">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          
          {/* Column 1: Branding & About */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-var(--foreground)] tracking-tight mb-2">
                {profile?.name || 'Zakky Ahmad El-Kholily'}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--charcoal)] font-medium">
                {profile?.role || 'Junior Front-End Developer | Network Engineer'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-[var([--canvas)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Surabaya, Jawa Timur, Indonesia</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/90">
              Pintasan
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm hover:text-[var(--primary)] transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-amber-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/90">
              Terhubung
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.label}>
                    <a 
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-[var(--foreground)]  transition-colors duration-200 flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline)] flex items-center justify-center group-hover:border-[var(--primary)] group-hover:bg-[var(--surface-card)] transition-all duration-300">
                        <Icon className="w-4 h-4 text-[var(--canvas)] group-hover:text-[var(--primary)]" />
                      </div>
                      {social.label}
                    </a>
                  </li>
                );
              })}
              <li>
                <a 
                  href={`mailto:${contactInfo?.email || 'zakky.ahmad@protonmail.com'}`}
                  className="text-sm hover:text-[var(--foreground)] transition-colors duration-200 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline)] flex items-center justify-center group-hover:border-[var(--primary)] group-hover:bg-[var(--surface-card) transition-all duration-300">
                    <Mail className="w-4 h-4 text-[var(--canvas)] group-hover:text-[var(--primary)]" />
                  </div>
                  Email
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Technology Stack */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">
              Dibangun Dengan
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Zap, label: 'Next.js' },
                  { icon: Code2, label: 'Tailwind' },
                  { icon: Cpu, label: 'Motion' },
                  { icon: Database, label: 'Supabase' },
                  { icon: Server, label: 'Vercel' }
                ].map((tech) => (
                  <div 
                    key={tech.label}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--surface-soft)] border border-[var(--hairline)] text-[10px] font-bold text-[var(--canvas)]"
                  >
                    <tech.icon className="w-3 h-3 text-amber-500/70" />
                    {tech.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col justify-between items-center gap-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] uppercase tracking-[0.2em] text-[var(--canvas)]) font-bold"
          >
            © {currentYear} codenamezaxx • All Rights Reserved
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
