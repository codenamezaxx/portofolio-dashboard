import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ACHIEVEMENTS } from '../data/portfolio';
import SectionHeader from '../components/shared/SectionHeader';
import CertificateCard from '../components/shared/CertificateCard';
import { fadeInUp, staggerContainer } from '../lib/motion';

type SortOption = 'newest' | 'oldest' | 'a-z';

const CertificatesPageFull: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Get unique categories and years
  const categories = useMemo(() => {
    const unique = Array.from(new Set(ACHIEVEMENTS.map(a => a.category)));
    return unique.sort();
  }, []);

  const years = useMemo(() => {
    const unique = Array.from(new Set(ACHIEVEMENTS.map(a => a.year))).map(Number);
    return unique.sort((a, b) => b - a); // Descending order
  }, []);

  // Filtered and sorted certificates
  const filteredCerts = useMemo(() => {
    let results = ACHIEVEMENTS.filter(cert => {
      // Search filter (title, issuer, category)
      const matchSearch = searchTerm === '' || 
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchCategory = selectedCategory === 'all' || cert.category === selectedCategory;

      // Year filter
      const matchYear = selectedYear === 'all' || cert.year === selectedYear;

      return matchSearch && matchCategory && matchYear;
    });

    // Sorting
    if (sortOption === 'newest') {
      results.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    } else if (sortOption === 'oldest') {
      results.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    } else if (sortOption === 'a-z') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    return results;
  }, [searchTerm, selectedCategory, selectedYear, sortOption]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedYear('all');
    setSortOption('newest');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedYear !== 'all';

  return (
    <>
      <main className="flex flex-col min-h-screen mt-24">
        {/* Header with Back Button */}
        <motion.div
          className="bg-gradient-to-b from-accent/5 to-transparent "
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-6 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Beranda
            </button>
            <SectionHeader 
              title="Semua Sertifikat & Penghargaan" 
              subtitle="Pencapaian"
              description='Koleksi lengkap sertifikat dari berbagai program pelatihan dan seminar' 
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.section 
          className="flex-1 mt-0"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-6">
            {/* Filters Section */}
            <motion.div 
              className="bg-card rounded-2xl p-6 mb-8"
              variants={fadeInUp}
            >
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    placeholder="Cari sertifikat berdasarkan judul, penerbit, atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background rounded-xl text-primary placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-background rounded-lg text-primary focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Tahun</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-2 bg-background rounded-lg text-primary focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="all">Semua Tahun</option>
                    {years.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Sorting */}
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Urutan</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full px-4 py-2 bg-background rounded-lg text-primary focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Tertua</option>
                    <option value="a-z">A - Z</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors font-medium"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted">
                Menampilkan <span className="font-semibold text-accent">{filteredCerts.length}</span> dari <span className="font-semibold">{ACHIEVEMENTS.length}</span> sertifikat
              </div>
            </motion.div>

            {/* Certificates Grid */}
            {filteredCerts.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredCerts.map((cert) => (
                  <CertificateCard key={cert.id} cert={cert} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-12"
                variants={fadeInUp}
              >
                <FileText className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                <p className="text-muted text-lg">Tidak ada sertifikat yang sesuai dengan filter</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  Reset Filter
                </button>
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>

      <footer className="py-8 mt-12 border-t border-accent text-center text-muted text-sm bg-background">
        <p>© {new Date().getFullYear()} | Made by codenamezaxx.</p>
      </footer>
    </>
  );
};

export default CertificatesPageFull;
