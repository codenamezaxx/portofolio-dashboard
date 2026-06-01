'use client';

import React, { useState, lazy, Suspense } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import Badge from './Badge';
import { Button } from './Button';

// Lazy load PDFPreview to avoid server-side issues
const PDFPreview = lazy(() => import('./PDFPreview').then(mod => ({ default: mod.PDFPreview })));

interface Certificate {
  id: string;
  title: string;
  category: string;
  issuer: string;
  year: number;
  pdf_url?: string;
  external_link?: string;
  display_order: number;
}

interface CertificateCardProps {
  certificate: Certificate;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const [showPDF, setShowPDF] = useState(false);

  return (
    <>
      <div className="bg-surface-card dark:bg-card-dark border border-hairline/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-soft-light dark:shadow-soft-dark hover:border-primary/40 dark:hover:border-primary/40 transition-all duration-300 h-full flex flex-col group hover:scale-[1.01]">
        {/* Header with Icon */}
        <div className="bg-surface-soft/30 dark:bg-surface-soft/10 border-b border-hairline/30 dark:border-white/5 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-heading-md font-bold text-ink dark:text-ink mb-1.5 line-clamp-2 leading-tight">
              {certificate.title}
            </h3>
            <p className="text-body-sm text-mute dark:text-mute font-medium line-clamp-1">{certificate.issuer}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ml-3 group-hover:bg-primary/20 transition-colors">
            <FileText className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {/* Category and Year */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <Badge variant="accent" className="text-body-xs font-bold px-3 py-1 rounded-full bg-primary/10 border-0 text-primary">
              {certificate.category}
            </Badge>
            <span className="text-body-sm font-bold text-mute dark:text-mute">{certificate.year}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-auto pt-5 border-t border-hairline/30 dark:border-white/5">
            {certificate.pdf_url && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowPDF(true)}
                className="flex-1 rounded-xl font-bold h-10 shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Lihat PDF
              </Button>
            )}
            {certificate.external_link && (
              <a
                href={certificate.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className={certificate.pdf_url ? 'w-12' : 'flex-1'}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl h-10 border-hairline dark:border-white/10 hover:bg-surface-soft/50"
                  title="Lihat Link Eksternal"
                >
                  <ExternalLink className="w-4 h-4" />
                  {!certificate.pdf_url && <span className="ml-2">Lihat Kredensial</span>}
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPDF && certificate.pdf_url && (
        <Suspense fallback={<div>Loading PDF...</div>}>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-card dark:bg-surface-card rounded-md max-w-2xl w-full max-h-[90vh] overflow-auto border border-hairline dark:border-hairline">
              <div className="sticky top-0 bg-surface-soft dark:bg-surface-soft border-b border-hairline dark:border-hairline p-4 flex items-center justify-between">
                <h3 className="text-heading-md text-ink dark:text-ink font-semibold">{certificate.title}</h3>
                <button
                  onClick={() => setShowPDF(false)}
                  className="text-body dark:text-body hover:text-ink dark:hover:text-ink"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <PDFPreview
                  url={certificate.pdf_url}
                  filename={`${certificate.title}.pdf`}
                  maxHeight="600px"
                />
              </div>
            </div>
          </div>
        </Suspense>
      )}
    </>
  );
};

export default CertificateCard;
