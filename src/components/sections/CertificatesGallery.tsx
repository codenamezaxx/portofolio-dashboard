'use client';

import { useState, useMemo, useCallback } from 'react';
import { Achievement } from '@/lib/portfolio-data';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Modal } from '@/components/ui/Modal';
import { PDFPreview } from '@/components/ui/PDFPreview';
import { Search, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

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
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--mute)]" />
          <TextInput
            type="text"
            placeholder="Cari berdasarkan judul, penerbit, atau kategori..."
            value={filters.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            aria-label="Search certificates"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                filters.category === category
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                  : 'bg-[var(--surface-soft)] text-[var(--body)] border-[var(--hairline)] hover:border-[var(--primary)]/40 hover:text-[var(--ink)]'
              }`}
              aria-pressed={filters.category === category}
            >
              {category}
              <span className="ml-1.5 text-xs opacity-70">
                ({achievements.filter(a => a.category === category).length})
              </span>
            </button>
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {paginatedAchievements.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl overflow-hidden hover:border-[var(--primary)]/40 hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--hairline)]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-base font-semibold text-[var(--ink)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                    {certificate.title}
                  </h3>
                  <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                    {certificate.year}
                  </span>
                </div>
                <p className="text-sm text-[var(--mute)]">{certificate.issuer}</p>
              </div>

              {/* Category */}
              <div className="px-6 pt-4">
                <Badge variant="outline" className="text-xs">
                  {certificate.category}
                </Badge>
              </div>

              {/* Actions */}
              <div className="p-6 flex gap-2 mt-auto">
                <Button
                  onClick={() => handleViewPDF(certificate)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  aria-label={`View ${certificate.title} PDF`}
                >
                  Lihat PDF
                </Button>
                <Button
                  onClick={() => handleDownloadPDF(certificate)}
                  variant="ghost"
                  size="sm"
                  aria-label={`Download ${certificate.title} PDF`}
                >
                  <Download className="w-4 h-4" />
                </Button>
                {certificate.external_link && (
                  <a
                    href={certificate.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      aria-label={`View ${certificate.title} external link`}
                    >
                      Tautan Eksternal
                    </Button>
                  </a>
                )}
              </div>
            </div>
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
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            onClick={handlePreviousPage}
            disabled={pagination.currentPage === 1}
            variant="ghost"
            size="sm"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pagination.currentPage === page
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'bg-[var(--surface-soft)] text-[var(--body)] border border-[var(--hairline)] hover:border-[var(--primary)]/40 hover:text-[var(--ink)]'
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
            variant="ghost"
            size="sm"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
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
