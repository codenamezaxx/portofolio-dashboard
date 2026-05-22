/**
 * Certificates Gallery Page
 * Displays a collection of certificates and achievements with filtering and search.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getAchievements } from '@/lib/portfolio-data';
import CertificatesGallery from '@/components/sections/CertificatesGallery';

interface CertificatesPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    q?: string;
  }>;
}

/**
 * Generate dynamic metadata for the certificates page
 */
export async function generateMetadata({ searchParams }: CertificatesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category;
  
  const title = category 
    ? `${category} Certificates | Zakky Ahmad El-Kholily`
    : 'Certificates & Achievements | Zakky Ahmad El-Kholily';
    
  const description = category
    ? `View my certifications and achievements in ${category}.`
    : 'A collection of certifications, courses, and achievements I have completed showcasing my expertise.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://codenamezaxx.my.id/certificates',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function CertificatesPage() {
  try {
    const achievements = await getAchievements();

    return (
      <main className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <div className="border-b border-[var(--hairline)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/#achievements"
              className="inline-flex items-center gap-2 text-[var(--mute)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[var(--ink)] mb-4">Sertifikat & Pencapaian</h1>
            <p className="text-lg text-[var(--body)]">
              Kumpulan sertifikasi, kursus, dan pencapaian yang telah saya selesaikan.
            </p>
          </div>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
              <p className="text-[var(--mute)]">Memuat sertifikat...</p>
            </div>
          }>
            <CertificatesGallery achievements={achievements} />
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading certificates page:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Terjadi kesalahan saat memuat data</h1>
          <Link href="/">
            <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg">Kembali ke Beranda</button>
          </Link>
        </div>
      </div>
    );
  }
}
