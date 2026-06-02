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
import SectionHeader from '@/components/shared/SectionHeader';
import BackgroundGrid from '@/components/shared/BackgroundGrid';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

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
      <main className="relative min-h-screen bg-background pt-20 pb-32 overflow-hidden">
        <BackgroundGrid />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <Link
              href="/#achievements"
              className="group inline-flex items-center gap-2 text-mute hover:text-primary transition-all duration-300 text-sm font-bold bg-surface-soft/50 backdrop-blur-sm px-4 py-2 rounded-full border border-hairline hover:border-primary/30"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
            <ThemeToggleButton />
          </div>

          <SectionHeader
            title="Sertifikat & Pencapaian"
            subtitle="ACHIEVEMENTS GALLERY"
            description="Kumpulan sertifikasi, kursus, dan pencapaian yang telah saya selesaikan."
          />

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
