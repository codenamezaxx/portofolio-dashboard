'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, ArrowUpRight } from 'lucide-react';
import { LinkedinIcon, InstagramIcon } from '@/components/ui/Icons';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import SectionHeader from '../shared/SectionHeader';
import type { ContactInfo } from '@/lib/portfolio-data';

interface ContactsProps {
  contactInfo?: ContactInfo | null;
}

/**
 * Contacts Component (Footer)
 * Displays contact methods with custom colored cards, icon circles, and handles matching design specifications
 */
const Contacts: React.FC<ContactsProps> = ({ contactInfo }) => {
  const defaultContactInfo: ContactInfo = {
    email: 'zakky.ahmad@protonmail.com',
    github_url: 'https://github.com/codenamezaxx',
    linkedin_url: 'https://linkedin.com/in/zakky-el',
    instagram_url: 'https://instagram.com/codenamezaxx',
    telegram_url: 'https://t.me/codenamezaxx'
  };

  const contact = contactInfo || defaultContactInfo;
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getHandleFromUrl = (url: string | undefined, defaultValue: string) => {
    if (!url) return defaultValue;
    try {
      const cleanUrl = url.split('?')[0].replace(/\/$/, '');
      const parts = cleanUrl.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart ? `@${lastPart}` : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const contactMethods = [
    {
      id: 1,
      label: 'Email',
      value: contact.email || 'zakky.ahmad@protonmail.com',
      icon: Mail,
      link: `mailto:${contact.email || 'zakky.ahmad@protonmail.com'}`,
      descriptionId: 'email',
      colors: {
        bg: 'bg-blue-900/10 dark:bg-blue-900/15',
        bgHover: 'bg-blue-900/20 dark:bg-blue-900/30',
        border: 'border-blue-500/20',
        borderHover: 'border-blue-500/50',
        iconBg: 'bg-blue-500/15',
        text: 'text-blue-600 dark:text-blue-400',
      }
    },
    {
      id: 2,
      label: 'LinkedIn',
      value: getHandleFromUrl(contact.linkedin_url, '@zakky-el'),
      icon: LinkedinIcon,
      link: contact.linkedin_url || 'https://linkedin.com/in/zakky-el',
      descriptionId: 'linkedin',
      colors: {
        bg: 'bg-teal-900/10 dark:bg-teal-900/20',
        bgHover: 'bg-teal-900/20 dark:bg-teal-900/35',
        border: 'border-teal-500/20',
        borderHover: 'border-teal-500/50',
        iconBg: 'bg-teal-500/15',
        text: 'text-teal-700 dark:text-teal-400',
      }
    },
    {
      id: 3,
      label: 'Instagram',
      value: getHandleFromUrl(contact.instagram_url, '@codenamezaxx'),
      icon: InstagramIcon,
      link: contact.instagram_url || 'https://instagram.com/codenamezaxx',
      descriptionId: 'instagram',
      colors: {
        bg: 'bg-pink-900/10 dark:bg-pink-900/20',
        bgHover: 'bg-pink-900/20 dark:bg-pink-900/35',
        border: 'border-pink-500/20',
        borderHover: 'border-pink-500/50',
        iconBg: 'bg-pink-500/15',
        text: 'text-pink-600 dark:text-pink-400',
      }
    },
    {
      id: 4,
      label: 'Telegram',
      value: getHandleFromUrl(contact.telegram_url, '@codenamezaxx'),
      icon: Send,
      link: contact.telegram_url || 'https://t.me/codenamezaxx',
      descriptionId: 'telegram',
      colors: {
        bg: 'bg-sky-900/10 dark:bg-sky-900/20',
        bgHover: 'bg-sky-900/20 dark:bg-sky-900/35',
        border: 'border-sky-500/20',
        borderHover: 'border-sky-500/50',
        iconBg: 'bg-sky-500/15',
        text: 'text-sky-600 dark:text-sky-400',
      }
    },
  ];

  return (
    <section id="contacts" className="py-20 md:py-32 relative border-t border-white/5">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionHeader
            title="Hubungi Saya"
            subtitle="Kontak"
          />

          {/* Intro Text */}
          <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm md:text-lg text-body dark:text-body leading-relaxed">
              Tertarik untuk berkolaborasi atau memiliki pertanyaan? Jangan ragu untuk menghubungi saya melalui salah satu platform di bawah ini.
            </p>
          </motion.div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
            {contactMethods.map((method) => {
              const IconComponent = method.icon;
              const isHovered = hoveredId === method.id;
              
              return (
                <motion.a
                  key={method.id}
                  href={method.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  onMouseEnter={() => setHoveredId(method.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group relative rounded-2xl border p-7 overflow-hidden transition-all duration-300 cursor-pointer backdrop-blur-md shadow-soft-light dark:shadow-soft-dark ${isHovered ? `${method.colors.bgHover} ${method.colors.borderHover}` : `${method.colors.bg} ${method.colors.border}`}`}
                  aria-label={`Contact via ${method.label}`}
                  aria-describedby={method.descriptionId}
                >
                  {/* Background Accent Glow */}
                  <div 
                    className={`absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-2xl -mr-16 -mt-16 bg-current ${method.colors.text}`}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Circle Icon Container */}
                    <div 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 ${method.colors.iconBg} ${method.colors.text}`}
                    >
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    </div>

                    {/* Text Content */}
                    <div>
                      <h3 className="text-xl font-extrabold text-ink dark:text-ink mb-2 tracking-tight">
                        {method.label}
                      </h3>
                      <p 
                        className={`text-body-sm mb-4 transition-colors duration-300 font-medium ${method.colors.text}`}
                        id={method.descriptionId}
                      >
                        {method.value}
                      </p>
                    </div>

                    {/* Arrow Icon & Button Text */}
                    <div className="flex items-center justify-between">
                      <span 
                        className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${method.colors.text}`}
                      >
                        Hubungi
                      </span>
                      <ArrowUpRight 
                        className={`w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${method.colors.text}`}
                        aria-hidden="true" 
                      />
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {/* Footer Note */}
          <motion.p
            variants={fadeInUp}
            className="text-center text-sm md:text-lg dark:text-body mt-12"
          >
            Terima kasih atas kunjungan Anda! Saya menantikan kesempatan untuk terhubung dan bekerja sama dengan Anda.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contacts;
