import type { Metadata } from 'next';
import { IBM_Plex_Sans, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { RealtimeProvider } from '@/components/providers/RealtimeProvider';
import BackgroundGrid from '@/components/shared/BackgroundGrid';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Zakky Ahmad El-Kholily | Junior Front-End Developer Portofolio',
  description:
    'Portfolio of Zakky Ahmad El-Kholily — Junior Front-End Developer and Network Engineer from East Java, Indonesia. Showcasing projects, skills, and certifications.',
  keywords: ['portfolio', 'web developer', 'it enthusiast', 'network engineer', 'front-end', 'React', 'Next.js', 'TypeScript'],
  authors: [{ name: 'Zakky Ahmad El-Kholily' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Zakky Ahmad El-Kholily | Portfolio',
    description: 'Junior Front-End Developer & Network Engineer',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Zakky Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zakky Ahmad El-Kholily | Portfolio',
    description: 'Junior Front-End Developer & Network Engineer',
    images: ['/hero.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Zakky Ahmad El-Kholily',
    url: 'https://codenamezaxx.my.id',
    jobTitle: 'Junior Front-End Developer',
    alumniOf: 'SMK Muhammadiyah 1 Surabaya',
    gender: 'Male',
    knowsAbout: ['Front-End Development', 'Network Engineering', 'React', 'Next.js', 'TypeScript'],
    sameAs: [
      'https://github.com/codenamezaxx',
      'https://linkedin.com/in/codenamezaxx',
      'https://instagram.com/codenamezaxx',
    ],
  };

  return (
    <html
      lang="id"
      className={`${ibmPlexSans.variable} ${sourceCodePro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Inline script to apply theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('portfolio-theme');
                  var theme = stored || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--body)] font-plex">
        <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
          <RealtimeProvider enableNotifications={true}>
            <BackgroundGrid />
            {children}
          </RealtimeProvider>
        </ThemeProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
