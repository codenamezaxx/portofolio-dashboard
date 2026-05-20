'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Download, Heart, GitBranch, Share2, MousePointer2 } from 'lucide-react';
import { LinkedinIcon, InstagramIcon, GithubIcon } from '@/components/ui/Icons';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import Button from '../ui/Button';
import type { Profile, ContactInfo } from '@/lib/portfolio-data';

interface HeroProps {
  profile?: Profile | null;
  contactInfo?: ContactInfo | null;
}

/**
 * Hero Component
 * Main landing section with introduction, call-to-action buttons, and profile image
 * Migrated from Vite React portfolio to Next.js with optimizations:
 * - Uses Next.js Image component for automatic optimization
 * - Server-side rendering compatible
 * - Maintains all original styling and animations
 * - TypeScript types properly defined
 */
const Hero: React.FC<HeroProps> = ({ profile, contactInfo }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [liveResumeUrl, setLiveResumeUrl] = useState<string | null>(null);

  const defaultProfile: Profile = {
    name: 'Zakky Ahmad El-Kholily',
    role: 'Front-End Web Developer | Public Speaker',
    tagline: 'IT Enthusiast dari jurusan Teknik Jaringan Komputer dan Telekomunikasi yang senang memecahkan masalah, membangun sistem yang berjalan dengan baik, terus belajar teknologi baru, serta senang berbagi pengetahuan dan pengalaman.',
    hero_image_url: '/hero.jpg'
  };

  const defaultContactInfo: ContactInfo = {
    github_url: 'https://github.com/codenamezaxx',
    linkedin_url: 'https://linkedin.com/in/zakky-el',
    instagram_url: 'https://instagram.com/codenamezaxx',
    telegram_url: 'https://t.me/codenamezaxx',
    email: 'zakky.ahmad@protonmail.com'
  };

  const profileData = profile || defaultProfile;
  const contactData = contactInfo || defaultContactInfo;

  // Use prop value initially, but we'll fetch a fresh one to avoid ISR cache issues
  const resumeUrl = liveResumeUrl || profileData.resume_url;

  useEffect(() => {
    const fetchResumeUrl = async () => {
      try {
        const response = await fetch(`/api/portfolio/resume?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.resume_url) {
            setLiveResumeUrl(data.resume_url);
          }
        }
      } catch (error) {
        console.error('Failed to fetch live resume URL:', error);
      }
    };

    fetchResumeUrl();
  }, []);

  const handleContactClick = () => {
    const contactSection = document.getElementById('contacts');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadResume = async () => {
    if (!resumeUrl) {
      alert('Resume tidak tersedia. Silakan hubungi admin.');
      return;
    }

    setIsDownloading(true);
    try {
      // Use the stable API endpoint for download to ensure we always get the latest
      // This also avoids issues with Supabase public URLs if they change
      const downloadUrl = `/api/portfolio/resume?download=true&t=${Date.now()}`;

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = `CV - Zakky Ahmad El-Kholily.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download resume:', error);
      alert('Gagal mengunduh resume. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-10 overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Background Decorative Elements for Depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-400/15 dark:bg-orange-400/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* Left Column: Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1 flex flex-col items-start text-left w-full"
          >
            {/* Main Typography */}
            <motion.div variants={fadeInUp}>
              <span
                className="inline-block py-1 px-3 rounded-full text-sm font-medium mb-6"
                style={{
                  backgroundColor: 'var(--color-accent-glow, rgba(184, 134, 11, 0.12))',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)'
                }}
              >
                Open to work
              </span>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight"
            >
              Hi, I'm <span className="text-gradient">{profileData.name}</span>
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl font-medium font-mono mb-6 leading-snug"
              style={{ color: 'var(--color-mute)' }}
            >
              {profileData.role}
            </motion.p>

            {/* Tagline */}
            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base mb-10 leading-relaxed w-full max-w-[100%]"
              style={{
                color: 'var(--color-mute)',
                wordBreak: 'normal',
                overflowWrap: 'anywhere'
              }}
            >
              {profileData.tagline}
            </motion.p>

            {/* Actions */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-start items-center gap-4 mb-12 relative z-10">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContactClick();
                }}
                className="cursor-pointer"
              >
                Ngobrol Yuk! <MessageCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownloadResume();
                }}
                disabled={isDownloading || !resumeUrl}
                className="cursor-pointer"
              >
                {isDownloading ? 'Mengunduh...' : 'Unduh CV'} <Download className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Social Proof / Links */}
            <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-8 w-full justify-start" style={{ borderTop: '1px solid var(--color-mute)' }}>
              <a href={contactData.instagram_url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] transition-colors duration-200" style={{ color: 'var(--color-mute)' }}>
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href={contactData.github_url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] transition-colors duration-200" style={{ color: 'var(--color-mute)' }}>
                <GithubIcon className="w-5 h-5" />
              </a>
              <a href={contactData.linkedin_url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] transition-colors duration-200" style={{ color: 'var(--color-mute)' }}>
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <div className="h-4 w-px" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.3 }} />
              <span className="text-sm" style={{ color: 'var(--color-mute)' }}>Jawa Timur, Indonesia</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 0.90 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative flex w-auto justify-center lg:justify-end mb-8 lg:mb-0"
          >
            {/* Glowing Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/15 rounded-full blur-[80px] pointer-events-none" />

            {/* Glass Frame Container */}
            <motion.div
              className="relative z-10 p-4 backdrop-blur-md rounded-[2rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 w-full max-w-[320px] lg:max-w-md mx-auto lg:ml-auto lg:mr-0"
              style={{
                border: '1px solid rgba(184, 134, 11, 0.12)',
              }}
            >
              {/* Inner Image Container */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                {/* Original Image Component to avoid Next.js Image optimizer issues */}
                <img
                  src={profileData.hero_image_url || '/hero.jpg'}
                  alt={profileData.name}
                  className="w-full h-full object-cover filter grayscale-[20%] contrast-110 hover:grayscale-0 hover:scale-105 transition-all duration-700"
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
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden md:flex"
        style={{ color: 'var(--color-mute)' }}
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <MousePointer2 className="w-5 h-5" />
      </motion.div>
    </section>
  );
};

export default Hero;
