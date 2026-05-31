'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const BackgroundGrid: React.FC = () => {
  const pathname = usePathname();
  
  // Default to hidden if pathname is not yet available to avoid flickering on refresh
  if (pathname === null) return null;

  // Hide background grid on admin dashboard and login pages
  const isAdminOrLogin = pathname?.startsWith('/admin') || pathname?.startsWith('/login');
  if (isAdminOrLogin) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
      {/* Base Background Overlay to ensure contrast */}
      <div className="absolute inset-0 bg-[var(--background)] transition-colors duration-500" />
      
      {/* 
        Grid Pattern 
        - Increased opacity for better visibility (0.07 in light, 0.14 in dark)
        - Radial mask for a softer focus effect
        - Uses the theme's accent color (Gold)
      */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]" 
        style={{
          backgroundImage: `
            linear-gradient(var(--color-accent) 1px, transparent 1px), 
            linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 90%)'
        }}
      />

      {/* 
        Ambient Glowing Blobs
        These create a subtle, moving background effect with theme-aware colors
      */}
      <div 
        className="absolute top-[-10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-[0.05] dark:opacity-[0.03] animate-blob"
        style={{ 
          backgroundColor: 'var(--color-accent)'
        }}
      />
      <div 
        className="absolute bottom-[-10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-[0.05] dark:opacity-[0.04] animate-blob animation-delay-2000"
        style={{ 
          backgroundColor: 'var(--color-accent)'
        }}
      />
      <div 
        className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-[0.1] dark:opacity-[0.1] animate-blob animation-delay-4000"
        style={{ 
          backgroundColor: 'var(--color-accent)'
        }}
      />

      {/* Secondary Radial Glow for Depth */}
      <div 
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--color-accent) 0%, transparent 70%)'
        }}
      />
    </div>
  );
};

export default BackgroundGrid;
