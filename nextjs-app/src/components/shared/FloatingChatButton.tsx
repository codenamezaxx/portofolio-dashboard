'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, MessageCircleMore } from 'lucide-react';
import { LinkedinIcon, InstagramIcon } from '@/components/ui/Icons';
import { useTheme } from '@/hooks/useTheme';

interface ContactOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  url: string;
  bgColor: string;
  hoverColor: string;
}

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { theme } = useTheme();
  const pathname = usePathname();

  // Hide on admin routes and login page
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  const contactOptions: ContactOption[] = [
    {
      id: 'email',
      icon: <Mail className="w-6 h-6" />,
      label: 'Email',
      url: 'mailto:zakky.ahmad@protonmail.com',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      id: 'linkedin',
      icon: <LinkedinIcon className="w-6 h-6" />,
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/zakky-el',
      bgColor: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
    },
    {
      id: 'instagram',
      icon: <InstagramIcon className="w-6 h-6" />,
      label: 'Instagram',
      url: 'https://instagram.com/codenamezaxx',
      bgColor: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
    },
    {
      id: 'telegram',
      icon: <Send className="w-6 h-6" />,
      label: 'Telegram',
      url: 'https://t.me/codenamezaxx',
      bgColor: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      scale: 0.9,
      opacity: 1,
      transition: { duration: 0.2, ease: 'linear' },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: 'linear' },
    },
  } as const;

  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 0.9,
      opacity: 1,
      transition: { duration: 0.2, ease: 'linear' },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: 'linear' },
    },
  } as const;

  return (
    <div className="fixed bottom-10 right-6 md:right-10 z-40">
      {/* Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-20 right-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="flex flex-col gap-4">
              {contactOptions.map((option) => (
                <motion.a
                  key={option.id}
                  href={option.url}
                  target={option.id !== 'email' ? '_blank' : undefined}
                  rel={option.id !== 'email' ? 'noopener noreferrer' : undefined}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredId(option.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className={`w-16 h-16 ${option.bgColor} ${option.hoverColor} rounded-full flex items-center justify-center text-white shadow-lg relative`}
                >
                  {option.icon}
                  
                  {/* Tooltip */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === option.id ? 1 : 0 }}
                    transition={{ duration: 0.2, ease: 'linear' }}
                    className="absolute -left-20 top-1/2 -translate-y-1/2 bg-[var(--background)] text-[var(--foreground)] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none shadow-md"
                  >
                    {option.label}
                  </motion.span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-primary hover:bg-primary-pressed transition-all duration-200 cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
        transition={{ duration: 0.3, ease: 'linear' }}
      >
        <motion.div
          className="flex items-center justify-center"
          animate={isOpen ? { rotate: -45 } : { rotate: 0 }}
          transition={{ duration: 0.3, ease: 'linear' }}
        >
          <MessageCircleMore className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}
