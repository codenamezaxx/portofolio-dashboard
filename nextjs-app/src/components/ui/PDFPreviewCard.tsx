'use client';

import React, { useState, lazy, Suspense } from 'react';
import { FileText, Download, ExternalLink, Eye } from 'lucide-react';
import GlassCard from './GlassCard';

// Lazy load PDFPreview to avoid server-side issues
const PDFPreview = lazy(() => import('./PDFPreview').then(mod => ({ default: mod.PDFPreview })));

interface PDFPreviewCardProps {
  title: string;
  category: string;
  year: string;
  pdfPath?: string;
  link?: string;
  issuer?: string;
  onView?: () => void;
}

const PDFPreviewCard: React.FC<PDFPreviewCardProps> = ({
  title,
  category,
  year,
  pdfPath,
  link,
  issuer,
  onView,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (pdfPath) {
      const a = document.createElement('a');
      a.href = pdfPath;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleViewPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onView) onView();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={pdfPath ? handleViewPDF : undefined}
      className={`group relative h-full overflow-hidden transition-all duration-300 ${pdfPath ? 'cursor-pointer' : ''}`}
    >
      <GlassCard
        className="h-full hover:border-primary/30 dark:hover:border-primary/30"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-surface-soft dark:bg-surface-soft opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative p-6 h-full flex flex-col justify-between">
          {/* Icon */}
          <div className="mb-4">
            <div className="w-12 h-12 rounded-md bg-primary/10 dark:bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/20 transition-colors duration-300">
              <FileText className="w-6 h-6 text-primary dark:text-primary" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <p className="text-body-xs uppercase tracking-widest text-primary dark:text-primary font-semibold mb-2">
              {category}
            </p>
            <h3 className="text-heading-md font-bold text-ink dark:text-ink mb-2 line-clamp-3 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            {issuer && (
              <p className="text-body-sm text-body dark:text-body mb-3">
                {issuer}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-hairline dark:border-hairline">
            <span className="text-body-sm font-medium text-body dark:text-body">
              {year}
            </span>
            <div className="flex gap-2 relative z-10">
              {pdfPath && (
                <>
                  <button
                    onClick={handleViewPDF}
                    className="p-2 rounded-md bg-primary/10 dark:bg-primary/10 hover:bg-primary/20 dark:hover:bg-primary/20 text-primary dark:text-primary transition-colors duration-300"
                    title="View PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-md bg-primary/10 dark:bg-primary/10 hover:bg-primary/20 dark:hover:bg-primary/20 text-primary dark:text-primary transition-colors duration-300"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-md bg-primary/10 dark:bg-primary/10 hover:bg-primary/20 dark:hover:bg-primary/20 text-primary dark:text-primary transition-colors duration-300"
                  title="View certificate"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PDFPreviewCard;
