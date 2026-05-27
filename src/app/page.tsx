import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingChatButton from '@/components/shared/FloatingChatButton';
import {
  DynamicHero,
  DynamicJourney,
  DynamicTechStack,
  DynamicProjects,
  DynamicAchievements,
  DynamicContacts,
} from '@/lib/dynamic-imports';
import { getAllPortfolioData, type Project as PortfolioProject, type Achievement as PortfolioAchievement } from '@/lib/portfolio-data';
import type { Project, Achievement } from '@/types';

// ISR configuration: revalidate every 60 seconds (1 minute) for near-realtime updates
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Zakky Ahmad El-Kholily | Junior Front-End Developer Portofolio',
  description: 'Portfolio of Zakky Ahmad El-Kholily, a Junior Front-End Web Developer & Network Engineer from East Java, Indonesia. Showcasing projects, skills, and achievements.',
  keywords: ['web developer', 'front-end', 'network engineer', 'it enthusiast', 'public speaker', 'react', 'typescript', 'portfolio'],
  openGraph: {
    title: 'Zakky Ahmad El-Kholily | Junior Front-End Developer Portofolio',
    description: 'Portfolio of Zakky Ahmad El-Kholily, a Junior Front-End Developer from East Java, Indonesia.',
    type: 'website',
    url: 'https://codenamezaxx.my.id',
    images: [
      {
        url: '/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Zakky Ahmad El-Kholily'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zakky Ahmad El-Kholily | Junior Front-End Developer & Network Engineer',
    description: 'Portfolio of Zakky Ahmad El-Kholily, a Front-End Web Developer and Network Engineer from East Java, Indonesia.',
    images: ['/hero.jpg']
  }
};

export default async function Home() {
  // Fetch all portfolio data server-side
  const portfolioData = await getAllPortfolioData();

  // Transform portfolio data to match component types
  const transformedProjects: Project[] = (portfolioData.projects || []).map((p: PortfolioProject) => ({
    id: p.id || Math.random().toString(),
    title: p.title,
    description: p.description,
    category: p.category,
    image: p.image_url,
    tech: p.technologies,
    links: {
      github: p.github_link,
      live: p.live_link,
      demo: p.demo_link
    }
  }));

  const transformedAchievements: Achievement[] = (portfolioData.achievements || []).map((a: PortfolioAchievement) => ({
    id: a.id || Math.random().toString(),
    title: a.title,
    category: a.category,
    issuer: a.issuer,
    year: a.year,
    pdfUrl: a.pdf_url,
    link: a.external_link
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Zakky Ahmad El Kholily',
    alternateName: 'codenamezaxx',
    url: 'https://codenamezaxx.my.id',
    jobTitle: 'Junior Front-End Developer',
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'SMK MUDISA',
    },
    knowledgableAbout: [
      'Front-End Web Development',
      'JavaScript',
      'React',
      'Next.js',
      'Tailwind CSS',
      'TypeScript',
      'Computer Network and Telecommunications',
    ],
    sameAs: [
      'https://github.com/codenamezaxx',
      'https://www.linkedin.com/in/zakky-ahmad-el-kholily-57615b350',
      'https://www.linkedin.com/in/codenamezaxx',
      'https://id.linkedin.com/in/codenamezaxx',
      'https://www.instagram.com/codenamezaxx',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex flex-1 flex-col">
        <DynamicHero profile={portfolioData.profile} contactInfo={portfolioData.contactInfo} />
        <DynamicJourney items={portfolioData.journey} />
        <DynamicTechStack initialData={portfolioData.techStack} />
        <DynamicProjects items={transformedProjects} />
        <DynamicAchievements items={transformedAchievements} />
        <DynamicContacts contactInfo={portfolioData.contactInfo} />
      </main>
      <FloatingChatButton/>
      <Footer profile={portfolioData.profile} contactInfo={portfolioData.contactInfo} />
    </>
  );
}
