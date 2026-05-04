import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ACHIEVEMENTS } from '../../data/portfolio';
import { staggerContainer, fadeInUp } from '../../lib/motion';
import PDFPreviewCard from '../ui/PDFPreviewCard';
import SectionHeader from '../shared/SectionHeader';
import Button from '../ui/Button';

const Achievements: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="achievements" className="py-20 relative border-t border-accent/10">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionHeader 
            title="Pelatihan & Penghargaan" 
            subtitle="Sertifikat & highlights" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ACHIEVEMENTS.map((item) => (
              <motion.div key={item.id} variants={fadeInUp}>
                <PDFPreviewCard 
                  title={item.title}
                  category={item.category}
                  year={item.year}
                  pdfPath={item.pdfPath}
                />
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="text-center">
             <Button 
               variant="outline" 
               className="text-sm cursor-pointer"
               onClick={() => navigate('/certificates')}
             >
                Lihat Semua Sertifikat
             </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Achievements;