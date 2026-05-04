import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import BackgroundGrid from './components/shared/BackgroundGrid';
import FloatingChatButton from './components/shared/FloatingChatButton';
import Home from './pages/Home';
import CertificatesPageFull from './pages/CertificatesPageFull';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="antialiased text-primary selection:bg-accent selection:text-primary transition-colors duration-300">
          <BackgroundGrid />
          <Navbar />
          <FloatingChatButton />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/certificates" element={<CertificatesPageFull />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;