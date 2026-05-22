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
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfjs, setPdfjs] = useState<any>(null);
  const renderTaskRef = useRef<any>(null);

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

  // Load PDF document
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
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
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

  // Render page when pdfDoc or currentPage changes
  useEffect(() => {
    if (!pdfDoc || loading) return;

    let isCurrent = true;

    const renderCurrentPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas || !isCurrent) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Get viewport layout width/scale adjustments
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Cancel any ongoing render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        // Start new render task
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err) {
        // Ignore "Rendering cancelled" errors which happen during rapid navigation
        if (err && (err as any).name === 'RenderingCancelledException') {
          return;
        }
        console.error('Error rendering PDF page:', err);
      }
    };

    // Use requestAnimationFrame to ensure canvas is fully layout-ready
    const animationFrame = requestAnimationFrame(() => {
      renderCurrentPage();
    });

    return () => {
      isCurrent = false;
      cancelAnimationFrame(animationFrame);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, loading]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
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
