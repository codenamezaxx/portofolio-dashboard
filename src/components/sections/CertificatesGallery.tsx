'use client';

import { useState, useMemo, useCallback } from 'react';
import { Achievement } from '@/lib/portfolio-data';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Modal } from '@/components/ui/Modal';
import { PDFPreview } from '@/components/ui/PDFPreview';
import { Search, X, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Medal } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface CertificatesGalleryProps {
  achievements: Achievement[];
}

interface CertificateFilters {
  category: string | null;
  searchQuery: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 12;

export default function CertificatesGallery({ achievements }: CertificatesGalleryProps) {
  const [filters, setFilters] = useState<CertificateFilters>({
    category: null,
    searchQuery: ''
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1
  });
  const [selectedCertificate, setSelectedCertificate] = useState<Achievement | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(achievements.map(a => a.category))).sort();
  }, [achievements]);

  // Filter and search achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      // Category filter
      if (filters.category && achievement.category !== filters.category) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          achievement.title.toLowerCase().includes(query) ||
          achievement.issuer.toLowerCase().includes(query) ||
          achievement.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [achievements, filters]);

  // Paginate results
  const paginatedAchievements = useMemo(() => {
    const totalPages = Math.ceil(filteredAchievements.length / ITEMS_PER_PAGE);
    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    setPagination(prev => ({
      ...prev,
      totalPages: Math.max(1, totalPages)
    }));

    return filteredAchievements.slice(startIndex, endIndex);
  }, [filteredAchievements, pagination.currentPage]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  // Handle category filter
  const handleCategoryFilter = useCallback((category: string | null) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? null : category
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  // Handle PDF preview
  const handleViewPDF = useCallback((certificate: Achievement) => {
    setSelectedCertificate(certificate);
    setShowPDFModal(true);
  }, []);

  // Handle PDF download
  const handleDownloadPDF = useCallback((certificate: Achievement) => {
    if (certificate.pdf_url) {
      const link = document.createElement('a');
      link.href = certificate.pdf_url;
      link.download = `${certificate.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  // Handle pagination
  const handlePreviousPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1)
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.min(prev.totalPages, prev.currentPage + 1)
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(prev.totalPages, page))
    }));
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      category: null,
      searchQuery: ''
    });
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  return (
    <>
      {/* Filters and Search */}
      <div className="mb-12 p-8 bg-surface-card/30 backdrop-blur-md rounded-3xl border border-hairline/50 space-y-8 shadow-soft-light dark:shadow-soft-dark">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mute group-focus-within:text-primary transition-colors" />
          <TextInput
            type="text"
            placeholder="Cari berdasarkan judul, penerbit, atau kategori..."
            value={filters.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 h-14 bg-surface-soft/50 border-hairline hover:border-primary/30 focus:border-primary transition-all duration-300 rounded-2xl"
            aria-label="Search certificates"
          />
        </div>

        {/* Category Filters */}
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-mute/60 ml-1">Filter Kategori</p>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  filters.category === category
                    ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-soft/80 text-body border-hairline hover:border-primary/40 hover:bg-surface-soft hover:text-ink'
                }`}
                aria-pressed={filters.category === category}
              >
                {category}
                <span className={`ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded-md ${
                  filters.category === category ? 'bg-white/20' : 'bg-mute/10 text-mute'
                }`}>
                  {achievements.filter(a => a.category === category).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.category || filters.searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[var(--mute)]">Filter aktif:</span>
            {filters.category && (
              <Badge variant="accent" className="flex items-center gap-2">
                {filters.category}
                <button
                  onClick={() => handleCategoryFilter(filters.category)}
                  className="hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${filters.category} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="accent" className="flex items-center gap-2">
                Pencarian: {filters.searchQuery}
                <button
                  onClick={() => handleSearch('')}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={handleClearFilters}
              className="text-sm text-[var(--primary)] hover:text-[var(--primary-pressed)] transition-colors"
            >
              Hapus semua
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-[var(--mute)]">
        Menampilkan {paginatedAchievements.length > 0 ? (pagination.currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{' '}
        {Math.min(pagination.currentPage * ITEMS_PER_PAGE, filteredAchievements.length)} dari{' '}
        {filteredAchievements.length} sertifikat
      </div>

      {/* Certificates Grid */}
      {paginatedAchievements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {paginatedAchievements.map((certificate) => (
            <GlassCard
              key={certificate.id}
              className="group/cert h-full flex flex-col overflow-hidden border-white/5 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 rounded-3xl animate-fadeIn"
            >
              {/* Top Banner / Icon Area */}
              <div className="relative h-24 bg-surface-soft/30 border-b border-hairline/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 group-hover/cert:opacity-20 transition-opacity">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent" />
                </div>
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/cert:scale-110 group-hover/cert:rotate-3 transition-all duration-500 shadow-lg shadow-primary/5">
                  <Medal className="w-6 h-6" />
                </div>
              </div>

              {/* Header Content */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <Badge variant="accent" className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                      {certificate.category}
                    </Badge>
                    <h3 className="text-xl font-black text-ink line-clamp-2 group-hover/cert:text-primary transition-colors leading-tight tracking-tight">
                      {certificate.title}
                    </h3>
                  </div>
                  <span className="flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg bg-surface-soft text-mute border border-hairline shadow-sm">
                    {certificate.year}
                  </span>
                </div>
                
                <p className="text-sm font-bold text-mute/80 mb-8 line-clamp-1 italic">
                  {certificate.issuer}
                </p>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-3 pt-6 border-t border-hairline/30">
                  <Button
                    onClick={() => handleViewPDF(certificate)}
                    variant="primary"
                    size="sm"
                    className="flex-1 rounded-xl h-11 font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    aria-label={`View ${certificate.title} PDF`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadPDF(certificate)}
                      variant="secondary"
                      size="sm"
                      className="w-11 h-11 p-0 rounded-xl hover:bg-surface-soft transition-colors"
                      aria-label={`Download ${certificate.title} PDF`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    {certificate.external_link && (
                      <a
                        href={certificate.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-11 h-11 p-0 rounded-xl hover:bg-surface-soft transition-colors"
                          aria-label={`View ${certificate.title} external link`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[var(--mute)] text-lg mb-4">
            {filters.category || filters.searchQuery
              ? 'Tidak ada sertifikat yang sesuai dengan filter Anda.'
              : 'Belum ada sertifikat tersedia.'}
          </p>
          {(filters.category || filters.searchQuery) && (
            <Button onClick={handleClearFilters} variant="secondary">
              Hapus Filter
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-16 p-4 bg-surface-card/20 backdrop-blur-md rounded-2xl border border-hairline/30 w-fit mx-auto shadow-soft-light dark:shadow-soft-dark">
          <Button
            onClick={handlePreviousPage}
            disabled={pagination.currentPage === 1}
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Page Numbers */}
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  pagination.currentPage === page
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-soft/50 text-body border border-hairline hover:border-primary/40 hover:text-ink'
                }`}
                aria-current={pagination.currentPage === page ? 'page' : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNextPage}
            disabled={pagination.currentPage === pagination.totalPages}
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPDFModal && selectedCertificate && (
        <Modal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          title={`${selectedCertificate.title} — Pratinjau PDF`}
          size="lg"
        >
          <div className="space-y-4">
            <PDFPreview
              url={selectedCertificate.pdf_url}
              filename={`${selectedCertificate.title}.pdf`}
              showDownload={false}
              showPageInfo={true}
            />
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => handleDownloadPDF(selectedCertificate)}
                variant="secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh PDF
              </Button>
              {selectedCertificate.external_link && (
                <a
                  href={selectedCertificate.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">Lihat Sertifikat</Button>
                </a>
              )}
              <Button
                onClick={() => setShowPDFModal(false)}
                variant="ghost"
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
