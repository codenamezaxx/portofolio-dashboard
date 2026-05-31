/**
 * CVPreviewSection Component
 * 
 * Displays a live preview of the currently uploaded CV/Resume using PDFPreview.
 * Integrates with /api/portfolio/resume to fetch the document.
 */

'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { RefreshCw, FileText, ExternalLink, Download, CloudCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

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
    <GlassCard className="overflow-hidden border-none shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink dark:text-ink leading-tight">
              CV / Resume Preview
            </h3>
            <p className="text-xs text-mute dark:text-mute">Live document preview from storage</p>
          </div>
        </div>
        
        {resumeUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchResumeInfo}
            disabled={isLoading}
            className="hover:bg-primary/10 text-primary gap-2"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-doc/30 dark:bg-surface-doc/5 rounded-xl border border-dashed border-hairline">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4 opacity-50" />
            <p className="text-mute dark:text-mute font-medium text-sm animate-pulse">Initializing Previewer...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-accent-red/5 border border-accent-red/20 rounded-xl text-center">
            <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-accent-red" size={24} />
            </div>
            <h4 className="text-ink font-semibold mb-1 text-sm">Preview Failed</h4>
            <p className="text-xs text-mute dark:text-mute mb-4">{error}</p>
            <Button
              onClick={fetchResumeInfo}
              variant="outline"
              size="sm"
              className="border-accent-red/30 text-accent-red hover:bg-accent-red/10"
            >
              Retry Connection
            </Button>
          </div>
        ) : !resumeUrl ? (
          <div className="p-12 border-2 border-dashed border-hairline dark:border-hairline rounded-xl text-center bg-surface-doc/20">
            <div className="w-16 h-16 bg-surface-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-hairline">
              <FileText className="text-mute" size={32} />
            </div>
            <h4 className="text-base font-bold text-ink dark:text-ink mb-2">
              No CV Document Found
            </h4>
            <p className="text-sm text-mute dark:text-mute mb-6 max-w-xs mx-auto">
              Ready to showcase your journey? Upload your professional resume in the settings panel to enable this preview.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="relative group rounded-xl overflow-hidden bg-surface-card shadow-inner">
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center h-[500px] bg-surface-doc dark:bg-surface-doc/10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    <p className="text-xs text-mute font-medium">Rendering PDF content...</p>
                  </div>
                }
              >
                <PDFPreview
                  url={`/api/portfolio/resume?view=true&v=${previewVersion}`}
                  filename="CV - Zakky Ahmad El-Kholily.pdf"
                  maxHeight="500px"
                  showDownload={false}
                  showPageInfo={true}
                  className="w-full"
                />
              </Suspense>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface-card border border-hairline shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-green/10 text-accent-green">
                  <CloudCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Synced & Secure</p>
                  <p className="text-[10px] text-mute uppercase tracking-wider">Cloud Storage Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href={resumeUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md transition-all duration-200 bg-transparent text-body hover:bg-surface-soft/50 active:bg-surface-soft/70 dark:text-body dark:hover:bg-surface-soft/20 dark:active:bg-surface-soft/30 h-9 px-4 text-xs"
                >
                  <ExternalLink size={14} />
                  View Raw
                </a>
                <a 
                  href={`/api/portfolio/resume?download=true&v=${previewVersion}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md transition-all duration-200 bg-transparent text-primary border border-primary/20 hover:bg-primary/5 active:bg-primary/10 h-9 px-4 text-xs font-medium"
                >
                  <Download size={14} />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
