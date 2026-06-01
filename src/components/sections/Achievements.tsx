'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileCheck } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion';
import PDFPreviewCard from '../ui/PDFPreviewCard';
import { PDFPreview } from '../ui/PDFPreview';
import SectionHeader from '../shared/SectionHeader';
import Button from '../ui/Button';
import type { Achievement } from '@/types';

interface AchievementsProps {
  items?: Achievement[];
  onViewAll?: () => void;
}

const defaultAchievements: Achievement[] = [
  { 
    id: 1, 
    title: "Memulai Pemrograman dengan Python", 
    category: "Kursus Online", 
    issuer: "Dicoding Indonesia",
    year: "2025", 
    pdfPath: "/certificates/cert-1.pdf",
    link: "https://www.dicoding.com/certificates/98XWOL0DLZM3"
  },
  { 
    id: 2, 
    title: "Belajar Dasar AI", 
    category: "Kursus Online", 
    issuer: "Dicoding Indonesia",
    year: "2025", 
    pdfPath: "/certificates/cert-2.pdf",
    link: "https://www.dicoding.com/certificates/98XWOL0DLZM3"
  },
  { 
    id: 3, 
    title: "Participant of Mercu Buana Yogyakarta International Youth Forum (MIYF) 2024", 
    category: "International Forum", 
    issuer: "Mercu Buana University Yogyakarta",
    year: "2024", 
    pdfPath: "/certificates/cert-3.pdf"
  },
  { 
    id: 4, 
    title: "Public Speaking With Trainer", 
    category: "Webinar Online", 
    issuer: "KT&G SangSang University",
    year: "2024", 
    pdfPath: "/certificates/cert-4.pdf",
  },
  { 
    id: 5, 
    title: "Building Persona and Image", 
    category: "Webinar Online", 
    issuer: "KT&G SangSang University",
    year: "2024", 
    pdfPath: "/certificates/cert-5.pdf"
  },
  { 
    id: 6, 
    title: "Youth Leadership Camps", 
    category: "Webinar Online", 
    issuer: "PT. Seasia Intelektual Akademis",
    year: "2024", 
    pdfPath: "/certificates/cert-6.pdf",
  },
];

const Achievements: React.FC<AchievementsProps> = ({ items = defaultAchievements, onViewAll }) => {
  const router = useRouter();
  const constraintsRef = React.useRef<HTMLDivElement>(null);
  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null);

  // Sort by displayOrder and take top 6 for landing page
  const featuredAchievements = [...items]
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .slice(0, 6);

  return (
    <section id="achievements" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto"
        >
          <SectionHeader 
            title="Pelatihan & Penghargaan" 
            subtitle="Sertifikat & highlights" 
          />

          <div ref={constraintsRef} className="relative mb-12 overflow-hidden">
            {/* Carousel Inner Track */}
            <motion.div 
              className="flex gap-6 pb-8 pt-4 cursor-grab active:cursor-grabbing mask-fade-sides w-max"
              drag="x"
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragMomentum={true}
              whileTap={{ cursor: 'grabbing' }}
            >
              {featuredAchievements.map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={fadeInUp}
                  className="flex-shrink-0 w-[300px] md:w-[350px]"
                >
                  <PDFPreviewCard 
                    title={item.title}
                    category={item.category}
                    year={String(item.year)}
                    pdfPath={item.pdfPath || item.pdfUrl}
                    issuer={item.issuer}
                    link={item.link}
                    onView={() => setSelectedAchievement(item)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Hint for scrolling */}
            <div className="mt-2 flex justify-center md:justify-start">
              <div className="flex items-center gap-2 text-xs text-mute/50 uppercase tracking-widest">
                <span>Geser untuk melihat sertifikat</span>
                <div className="w-12 h-px bg-mute/30" />
              </div>
            </div>
          </div>

          <motion.div variants={fadeInUp} className="text-center">
             <Button 
               variant="primary" 
               className="text-sm cursor-pointer relative z-10"
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 onViewAll ? onViewAll() : router.push('/certificates');
               }}
             >
              <FileCheck className='w-4 h-4 mr-2' /> Lihat Semua Sertifikat
             </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Global PDF Preview Modal - Rendered outside the draggable container */}
      {selectedAchievement && (
        <AchievementModal 
          achievement={selectedAchievement} 
          onClose={() => setSelectedAchievement(null)} 
        />
      )}
    </section>
  );
};

// Internal Modal Component for clean hierarchy
const AchievementModal: React.FC<{ achievement: Achievement, onClose: () => void }> = ({ achievement, onClose }) => {
  const pdfPath = achievement.pdfPath || achievement.pdfUrl;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-zinc-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-zinc-900/50 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold">{achievement.category}</span>
            <h3 className="text-heading-md text-white font-bold line-clamp-1">{achievement.title}</h3>
            {achievement.issuer && <p className="text-xs text-zinc-400">{achievement.issuer}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Modal Content - PDF Viewer Area */}
        <div className="flex-1 overflow-auto bg-black relative p-2 md:p-4">
          {pdfPath ? (
            <div className="w-full h-full min-h-[500px]">
              <PDFPreview
                url={pdfPath}
                filename={`${achievement.title}.pdf`}
                maxHeight="100%"
                className="w-full h-full"
                showDownload={false}
                showPageInfo={true}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500">
              <span className="text-4xl mb-4">📄</span>
              <p>Pratinjau sertifikat tidak tersedia.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-900 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
           <div className="text-xs text-zinc-500">
             Tahun: {achievement.year}
           </div>
           <div className="flex gap-3">
             <Button variant="secondary" onClick={onClose} className="!bg-zinc-800 !text-white !border-zinc-700 hover:!bg-zinc-700">Tutup</Button>
             {achievement.link && (
               <Button onClick={() => window.open(achievement.link, '_blank')}>Lihat Asli</Button>
             )}
             {pdfPath && (
               <Button 
                 onClick={() => {
                   const a = document.createElement('a');
                   a.href = pdfPath;
                   a.download = `${achievement.title}.pdf`;
                   a.click();
                 }}
               >
                 Unduh PDF
               </Button>
             )}
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Achievements;
