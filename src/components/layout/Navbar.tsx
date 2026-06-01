'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Terminal, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeProvider';

const NAV_ITEMS = [
  { label: "Beranda", href: "#hero" },
  { label: "Perjalanan", href: "#journey" },
  { label: "Tech Stack", href: "#tech" },
  { label: "Proyek", href: "#projects" },
  { label: "Sertifikat", href: "#achievements" },
  { label: "Kontak", href: "#contacts" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    // Smooth scroll to section
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-full border border-white/5 dark:border-white/5 backdrop-blur-md w-[95%] max-w-7xl ${scrolled ? 'bg-background/80 dark:bg-background/80 h-16 shadow-soft-light dark:shadow-soft-dark' : 'bg-background/40 dark:bg-background/40 h-20'}`}>
      <div className="container mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-[var(--foreground)] font-bold text-xl hover:text-[var(--primary)] transition-colors">
          <Terminal className="w-6 h-6 text-[var(--primary)]" />
          <span className='font-mono'>codenamezaxx</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              className="text-sm font-medium text-[var(--mute)] hover:text-[var(--primary)] transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 w-10 h-10 flex items-center justify-center cursor-pointer"
            title="Switch mode"
            aria-label="Switch mode"
          >
            {mounted && (theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
          </button>

          {/* Admin Link */}
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full bg-primary text-on-primary text-sm font-medium hover:bg-primary-pressed transition-all duration-300 shadow-soft-light dark:shadow-soft-dark hover:scale-105 active:scale-95"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-4">
          {/* Theme Toggle Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] transition-all duration-300 w-9 h-9 flex items-center justify-center"
            title="Switch mode"
            aria-label="Switch mode"
          >
            {mounted && (theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
          </button>
          
          {/* Menu Button */}
          <button 
            className="text-[var(--primary)] p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--hairline)] overflow-hidden align-center justify-center text-center rounded-b-lg shadow-soft-light dark:shadow-soft-dark"
          >
            <div className="flex flex-col p-6 gap-4">
              {NAV_ITEMS.map((item) => (
                <a 
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="text-lg font-medium text-[var(--primary)] hover:text-[var(--primary-pressed)] py-2 transition-colors"
                >
                  {item.label}
                </a>
              ))}
               {/* Admin Link */}
              <Link 
                href="/login" 
                className="px-6 py-2 w-full rounded-lg bg-primary text-on-primary font-medium hover:bg-primary-pressed transition-all duration-300 shadow-soft-light dark:shadow-soft-dark hover:scale-105 active:scale-95"
              >
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
