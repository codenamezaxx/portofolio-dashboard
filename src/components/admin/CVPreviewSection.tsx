/**
 * CVPreviewSection Component
 * 
 * Displays a live preview of the currently uploaded CV/Resume using PDFPreview.
 * Integrates with /api/portfolio/resume to fetch the document.
 */

'use client';

import { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load PDFPreview to avoid server-side rendering issues
const PDFPreview = lazy(() =>
  import('@/components/ui/PDFPreview').then((mod) => ({ default: mod.PDFPreview }))
);

export function CVPreviewSection() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResumeInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/portfolio/resume');
      
      if (response.ok) {
        const data = await response.json();
        if (data.resume_url) {
          setResumeUrl(data.resume_url);
          setPreviewVersion(Date.now()); // Update version to force cache bust and re-render
        } else {
          setResumeUrl(null);
        }
      } else {
        if (response.status === 404) {
          setResumeUrl(null);
        } else {
          throw new Error('Failed to fetch CV info');
        }
      }
    } catch (err) {
      console.error('Error fetching CV:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading CV');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeInfo();

    // Listen for custom events to reload CV when upload is successful
    const handleCVUploaded = () => {
      console.log('🔄 CV upload event detected, refreshing preview...');
      fetchResumeInfo();
    };

    window.addEventListener('cv-uploaded', handleCVUploaded);
    return () => {
      window.removeEventListener('cv-uploaded', handleCVUploaded);
    };
  }, []);

  return (
    <div className="bg-surface-card dark:bg-surface-card border border-hairline dark:border-hairline rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-ink dark:text-ink flex items-center gap-3">
          CV / Resume Preview
        </h3>
        {resumeUrl && (
          <button
            onClick={fetchResumeInfo}
            className="text-xs text-primary hover:text-primary-pressed transition-colors font-medium animate-pulse"
            title="Refresh Preview"
          >
            Refresh
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-surface-soft dark:border-surface-soft border-t-primary dark:border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-mute dark:text-mute text-sm">Loading CV Preview...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-accent-red-soft border border-accent-red/20 rounded-md text-center">
          <p className="text-sm text-accent-red font-medium mb-2">Error: {error}</p>
          <button
            onClick={fetchResumeInfo}
            className="px-3 py-1.5 bg-accent-red hover:bg-accent-red/80 text-white rounded text-xs font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : !resumeUrl ? (
        <div className="p-8 border-2 border-dashed border-hairline dark:border-hairline rounded-md text-center bg-surface-doc dark:bg-surface-doc">
          <h4 className="text-sm font-semibold text-ink dark:text-ink mb-1">
            Belum ada CV yang diunggah
          </h4>
          <p className="text-xs text-mute dark:text-mute mb-4 max-w-xs mx-auto">
            Silakan unggah resume/CV Anda melalui menu "Upload Resume/CV" di panel Settings sebelah kanan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-96 bg-surface-doc dark:bg-surface-doc border border-hairline dark:border-hairline rounded-md">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
                  <p className="text-sm text-mute dark:text-mute">Loading PDF Viewer...</p>
                </div>
              </div>
            }
          >
            <PDFPreview
              url={`/api/portfolio/resume?view=true&v=${previewVersion}`}
              filename="CV - Zakky Ahmad El-Kholily.pdf"
              maxHeight="500px"
              showDownload={true}
              showPageInfo={true}
              className="w-full"
            />
          </Suspense>

          <div className="text-xs text-mute dark:text-mute flex items-center justify-between px-1">
            <span>Status: Terunggah di Cloud Storage</span>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline hover:text-primary-pressed flex items-center gap-1 font-medium"
            >
              Direct Link
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
