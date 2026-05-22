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
      <div className="bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md overflow-hidden hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
        {/* Header with Icon */}
        <div className="bg-surface-soft dark:bg-surface-soft border-b border-hairline dark:border-hairline p-6 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-heading-md font-semibold text-ink dark:text-ink mb-1 line-clamp-2">
              {certificate.title}
            </h3>
            <p className="text-body-sm text-body dark:text-body line-clamp-1">{certificate.issuer}</p>
          </div>
          <FileText className="w-6 h-6 text-primary flex-shrink-0 ml-2" />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {/* Category and Year */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <Badge variant="accent" className="text-body-xs">
              {certificate.category}
            </Badge>
            <span className="text-body-sm text-body dark:text-body">{certificate.year}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-4 border-t border-hairline dark:border-hairline">
            {certificate.pdf_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPDF(true)}
                className="text-primary hover:text-primary/80 flex-1 dark:text-primary dark:hover:text-primary/80"
              >
                <FileText className="w-4 h-4 mr-1" />
                View PDF
              </Button>
            )}
            {certificate.external_link && (
              <a
                href={certificate.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80">
                  <ExternalLink className="w-4 h-4" />
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
