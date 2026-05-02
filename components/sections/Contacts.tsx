import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, MessageCircle, Linkedin, ExternalLink, ArrowUpRight } from 'lucide-react';
import { PROFILE } from '../../data/portfolio';
import { staggerContainer, fadeInUp } from '../../lib/motion';
import Button from '../ui/Button';
import SectionHeader from '../shared/SectionHeader';

const Contacts: React.FC = () => {
  const contactMethods = [
    {
      id: 1,
      label: 'Email',
      value: 'zakky.ahmad@protonmail.com',
      icon: Mail,
      link: PROFILE.socials.email,
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-500/50 text-blue-400',
      bgIcon: 'bg-blue-500/10 text-blue-400',
      descriptionId: 'email'
    },
    {
      id: 2,
      label: 'LinkedIn',
      value: '@zakky-el',
      icon: Linkedin,
      link: PROFILE.socials.linkedin,
      color: 'from-blue-400/20 to-cyan-500/20 border-blue-400/30 hover:border-blue-400/50 text-blue-300',
      bgIcon: 'bg-blue-400/10 text-blue-300',
      descriptionId: 'linkedin'
    },
    {
      id: 3,
      label: 'Instagram',
      value: '@codenamezaxx',
      icon: Instagram,
      link: PROFILE.socials.instagram || '#',
      color: 'from-pink-500/20 to-purple-500/20 border-pink-500/30 hover:border-pink-500/50 text-pink-400',
      bgIcon: 'bg-pink-500/10 text-pink-400',
      descriptionId: 'instagram'
    },
    {
      id: 4,
      label: 'Telegram',
      value: '@codenamezaxx',
      icon: MessageCircle,
      link: PROFILE.socials.telegram || '#',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400',
      bgIcon: 'bg-cyan-500/10 text-cyan-400',
      descriptionId: 'telegram'
    },
  ];

  return (
    <section id="contacts" className="py-20 md:py-32 relative border-t border-accent/10">
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
            <p className="text-lg text-muted leading-relaxed">
              Tertarik untuk berkolaborasi atau memiliki pertanyaan? Jangan ragu untuk menghubungi saya melalui salah satu platform di bawah ini. Saya akan senang mendengarkan dari Anda!
            </p>
          </motion.div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
            {contactMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <motion.a
                  key={method.id}
                  href={method.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className={`group relative rounded-2xl border bg-gradient-to-br ${method.color} p-6 overflow-hidden transition-all duration-300 cursor-pointer`}
                >
                  {/* Background Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full blur-2xl -mr-16 -mt-16" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full ${method.bgIcon} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Text Content */}
                    <div>
                      <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-accent transition-colors duration-300">
                        {method.label}
                      </h3>
                      <p className="text-sm text-muted/80 mb-4 group-hover:text-muted transition-colors duration-300">
                        {method.value}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-muted/60 group-hover:text-muted transition-colors duration-300">
                        Hubungi
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted/60 group-hover:text-accent transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>

                  {/* Hover Border Animation */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.a>
              );
            })}
          </div>

          {/* CTA Section */}
          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-6 p-8 rounded-2xl bg-gradient-to-br from-accent/5 to-orange-500/5 border border-accent/20">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Siap untuk memulai sesuatu yang luar biasa?
                </h3>
                <p className="text-muted">
                  Mari kita ciptakan solusi inovatif bersama-sama.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = PROFILE.socials.email}
                className="px-8 py-3 text-lg"
              >
                Mulai Percakapan
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.p 
            variants={fadeInUp}
            className="text-center text-sm text-muted/60 mt-12"
          >
            💌 Waktu respons rata-rata: 60 menit
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contacts;
