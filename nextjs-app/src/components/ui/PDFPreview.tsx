/**
 * PDFPreview Component
 * 
 * Features:
 * - Display PDF preview with page navigation
 * - Show PDF metadata (filename, page count)
 * - Download PDF functionality
 * - Error handling for PDF loading
 * - Responsive design
 * - Accessibility support
 */

'use client';

import { useState, useEffect, useRef } from 'react';

export interface PDFPreviewProps {
  url: string;
  filename?: string;
  className?: string;
  maxHeight?: string;
  showDownload?: boolean;
  showPageInfo?: boolean;
}

export function PDFPreview({
  url,
  filename = 'document.pdf',
  className = '',
  maxHeight = '600px',
  showDownload = true,
  showPageInfo = true,
}: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);
  const [pdfjs, setPdfjs] = useState<any>(null);

  // Load PDF.js library on the client only
  useEffect(() => {
    const importPdfjs = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        setPdfjs(pdfjsLib);
      } catch (err) {
        console.error('Failed to load PDF.js library:', err);
        setError('Failed to initialize PDF viewer');
      }
    };
    importPdfjs();
  }, []);

  // Load PDF and render first page
  useEffect(() => {
    if (!pdfjs) return;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch PDF
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        // Load PDF document
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);

        // Render first page
        await renderPage(pdf, 1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(errorMessage);
        console.error('PDF loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [url, pdfjs]);

  // Render specific page
  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      if (!canvasRef.current) return;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      // Set canvas dimensions
      canvasRef.current.width = viewport.width;
      canvasRef.current.height = viewport.height;

      // Render page to canvas
      const context = canvasRef.current.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      setCurrentPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render page';
      setError(errorMessage);
      console.error('Page rendering error:', err);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1 && pdfRef.current) {
      await renderPage(pdfRef.current, currentPage - 1);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages && pdfRef.current) {
      await renderPage(pdfRef.current, currentPage + 1);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <p className="text-sm text-red-700 dark:text-red-400">
          Error loading PDF: {error}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* PDF Canvas */}
      <div
        className="border border-[var(--hairline)] rounded-lg overflow-auto bg-[var(--surface-soft)] flex justify-center"
        style={{ maxHeight }}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mb-2" />
              <p className="text-sm text-[var(--mute)]">Loading PDF...</p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto"
            aria-label={`PDF page ${currentPage} of ${totalPages}`}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-card)] disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--hairline)] rounded-lg text-sm font-medium transition-colors text-[var(--foreground)]"
            aria-label="Previous page"
          >
            ← Previous
          </button>

          {showPageInfo && (
            <span className="text-sm text-[var(--mute)] min-w-fit">
              Page {currentPage} of {totalPages}
            </span>
          )}

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-card)] disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--hairline)] rounded-lg text-sm font-medium transition-colors text-[var(--foreground)]"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>

        {/* Download Button */}
        {showDownload && (
          <button
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--on-primary)] rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            aria-label={`Download ${filename}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        )}
      </div>

      {/* File Info */}
      <div className="text-xs text-[var(--mute)]">
        <p className="truncate">File: {filename}</p>
      </div>
    </div>
  );
}
