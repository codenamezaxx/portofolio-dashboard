'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Typewriter from 'typewriter-effect';
import { FileSearchCorner, MousePointer2, ArrowRight } from 'lucide-react';
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
 * Features:
 * - Optimized for both desktop (hover) and mobile (tap toggle)
 * - Uses Framer Motion for smooth animations
 * - Responsive layout for all screen sizes
 */
const Hero: React.FC<HeroProps> = ({ profile, contactInfo }) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [liveResumeUrl, setLiveResumeUrl] = useState<string | null>(null);
  const [isHeroActive, setIsHeroActive] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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

  // Dynamically split roles for typewriter effect
  const rolesArray = profileData.role 
    ? profileData.role.split(' | ').map(role => role.trim()) 
    : ['Front-End Developer', 'Network Engineer'];

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

  const handleProjectClick = () => {
    const projectSection = document.getElementById('projects');
    if (projectSection) {
      projectSection.scrollIntoView({ behavior: 'smooth'} )
    }
  }

  const handleViewResume = async () => {
    if (!resumeUrl) {
      alert('Resume tidak tersedia. Silakan hubungi admin.');
      return;
    }

    setIsActionLoading(true);
    try {
      const viewUrl = `/api/portfolio/resume?view=true&t=${Date.now()}`;
      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Failed to view resume:', error);
      alert('Gagal menampilkan resume. Silakan coba lagi.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-10 overflow-hidden">

      {/* Background Decorative Elements for Depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-[200px] opacity-[0.05] dark:opacity-[0.04] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[120px] opacity-[0.04] dark:opacity-[0.03] pointer-events-none" />

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

            <motion.div
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 leading-[1.1] min-h-[1.2em] flex flex-wrap gap-x-3"
            >
              <h1>Hi, I'm</h1>
              <h1 className="text-gradient">
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString(profileData.name)
                      .start();
                  }}
                  options={{
                    delay: 75,
                    cursor: ''
                  }}
                />
              </h1>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="text-xl md:text-2xl font-normal font-mono mb-6 leading-snug h-[1.5em]"
              style={{ color: 'var(--color-mute)' }}
            >
              <Typewriter
                key={profileData.role} // Key ensures re-run if data changes
                options={{
                  strings: rolesArray,
                  autoStart: true,
                  loop: true,
                  delay: 75,
                  cursor: "_"
                }}
              />
            </motion.div>

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
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-start items-center gap-5 mb-12 relative z-10">
              <Button
                variant='primary'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleProjectClick();
                }}
                className='py-6 px-7 text-md md:text-lg dark:shadow-primary/20 shadow-lg cursor-pointer'
                >
                  Lihat Proyek <ArrowRight className='w-4 h-4' />
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewResume();
                }}
                disabled={isActionLoading || !resumeUrl}
                className="py-6 px-7 text-md md:text-lg dark:shadow-primary/10 shadow-lg cursor-pointer"
              >
                {isActionLoading ? 'Memuat...' : 'Lihat CV'} <FileSearchCorner className="w-4 h-4" />
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[var(--color-accent)]/10 opacity-[0.07] dark:opacity-[0.1] rounded-full blur-[80px] pointer-events-none" />

            {/* Glass Frame Container */}
            <motion.div
              className="relative z-10 p-3 backdrop-blur-xl rounded-[2.5rem] shadow-soft-light dark:shadow-primary/10 shadow-2xl backdrop-blur-md w-full max-w-[320px] lg:max-w-md mx-auto lg:ml-auto lg:mr-0 cursor-pointer overflow-hidden group"
              style={{
                border: '1px solid rgba(184, 134, 11, 0.08)',
              }}
              initial={{ rotate: 2 }}
              animate={{ rotate: isHeroActive ? 0 : 2 }}
              onMouseEnter={() => setIsHeroActive(true)}
              onMouseLeave={() => setIsHeroActive(false)}
              onClick={() => setIsHeroActive(!isHeroActive)}
              transition={{ duration: 0.5 }}
            >
              {/* Inner Image Container */}
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Shimmer Skeleton Placeholder */}
                {!isImageLoaded && (
                  <div className="absolute inset-0 z-20 animate-pulse bg-zinc-800/85">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer-effect" />
                  </div>
                )}

                {/* Image Component with Next.js Image for optimization */}
                <Image
                  src={profileData.hero_image_url || '/hero.jpg'}
                  alt={profileData.name}
                  fill
                  className={`object-cover transition-all duration-700 ${
                    isHeroActive ? 'scale-105' : 'scale-100'
                  }`}
                  onLoadingComplete={() => setIsImageLoaded(true)}
                  priority
                  quality={90}
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
