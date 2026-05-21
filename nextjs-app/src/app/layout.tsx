import type { Metadata } from 'next';
import { IBM_Plex_Sans, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { RealtimeProvider } from '@/components/providers/RealtimeProvider';
import FloatingChatButton from '@/components/shared/FloatingChatButton';
import BackgroundGrid from '@/components/shared/BackgroundGrid';

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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${ibmPlexSans.variable} ${sourceCodePro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to apply theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('portfolio-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
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
            <FloatingChatButton/>
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
