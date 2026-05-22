'use client';

import dynamic from 'next/dynamic';
import { Achievement } from '@/lib/portfolio-data';

// Dynamically import the gallery component to avoid server-side rendering issues with PDFPreview
const CertificatesGallery = dynamic(
  () => import('@/components/sections/CertificatesGallery'),
  { ssr: false }
);

interface CertificatesGalleryWrapperProps {
  achievements: Achievement[];
}

export default function CertificatesGalleryWrapper({ achievements }: CertificatesGalleryWrapperProps) {
  return <CertificatesGallery achievements={achievements} />;
}
