import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import BackgroundGrid from './components/shared/BackgroundGrid';
import FloatingChatButton from './components/shared/FloatingChatButton';
import Home from './pages/Home';
import CertificatesPageFull from './pages/CertificatesPageFull';

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <BrowserRouter>
      <div
        className="antialiased transition-colors duration-300"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-primary)',
        }}
        data-theme={theme}
      >
        <BackgroundGrid />
        <Navbar />
        <FloatingChatButton />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/certificates" element={<CertificatesPageFull />} />
        </Routes>
      </div>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;