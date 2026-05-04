import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Linkedin, Instagram, Send, MessageCircleMore } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ContactOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  url: string;
  bgColor: string;
  hoverColor: string;
}

const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

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
      icon: <Linkedin className="w-6 h-6" />,
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/zakky-el',
      bgColor: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
    },
    {
      id: 'instagram',
      icon: <Instagram className="w-6 h-6" />,
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
    },
  };

  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 0.9,
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

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
              {contactOptions.map((option, index) => (
                <motion.a
                  key={option.id}
                  href={option.url}
                  target={option.id !== 'email' ? '_blank' : undefined}
                  rel={option.id !== 'email' ? 'noopener noreferrer' : undefined}
                  variants={itemVariants}
                  className={`w-16 h-16 ${option.bgColor} ${option.hoverColor} rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 group relative`}
                  title={option.label}
                  onClick={() => {
                    // Close menu after clicking
                    setTimeout(() => setIsOpen(false), 300);
                  }}
                >
                  {option.icon}
                  
                  {/* Tooltip */}
                  <span className="absolute -left-20 top-1/2 -translate-y-1/2 bg-primary text-background px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {option.label}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-accent hover:bg-accent/90'
            : 'bg-accent hover:bg-accent/90'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
      >
        <motion.div
          animate={isOpen ? { rotate: -45 } : { rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <MessageCircleMore className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingChatButton;
