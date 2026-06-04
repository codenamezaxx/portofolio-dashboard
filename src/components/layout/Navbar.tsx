'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Terminal, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeProvider';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

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

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const isMobileMenuOpen = isOpen; // Capture current state
    setIsOpen(false); // Close menu immediately

    const performScroll = () => {
      if (href.startsWith('#')) {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    if (isMobileMenuOpen) {
      // Delay scroll to allow mobile menu exit animation to complete
      setTimeout(performScroll, 300); // 300ms matches AnimatePresence exit duration
    } else {
      performScroll();
    }
  };

  return (
    <nav className={`fixed top-1 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-2xl border border-white/5 dark:border-white/5 backdrop-blur-md w-[97%] max-w-7xl ${scrolled ? 'bg-background/80 dark:bg-background/80 h-16 shadow-soft-light dark:shadow-soft-dark' : 'bg-background/40 dark:bg-background/40 h-20'}`}>
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
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-sm font-medium text-[var(--mute)] hover:text-[var(--primary)] transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          
          {/* Theme Toggle Button */}
          <ThemeToggleButton />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-4">
          {/* Theme Toggle Mobile */}
          <ThemeToggleButton />
          
          {/* Menu Button */}
          <button 
            className="text-[var(--primary)] p-2 relative z-[60]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
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
            className="md:hidden bg-[var(--background)] backdrop-blur-md border-t border-[var(--hairline)] overflow-hidden flex flex-col items-center justify-center text-center rounded-b-lg"
          >
            <div className="flex flex-col p-6 gap-4">
              {NAV_ITEMS.map((item) => (
                <a 
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-lg font-medium text-[var(--primary)] hover:text-[var(--primary-pressed)] py-2 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
