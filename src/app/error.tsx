'use client';

/**
 * Error Boundary for Next.js App Router
 * Displayed when an unhandled error occurs during rendering
 */

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-primary mb-3">
          Terjadi Kesalahan
        </h1>
        <p className="text-body mb-2">
          Maaf, terjadi kesalahan saat memuat halaman ini.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-400 mb-6 font-mono bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            {error.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-pressed transition-colors"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors border border-primary/20"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
