import React from 'react';

const BackgroundGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Radial Gradient overlay */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Grid Pattern - uses CSS variable for color */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Ambient Blobs - Theme-aware colors */}
      {/* Light mode: warm amber/orange/yellow */}
      {/* Dark mode: warm gold/amber tones */}
      <div 
        className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"
        style={{
          backgroundColor: 'var(--color-accent)',
          opacity: 0.12
        }}
      />
      <div 
        className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"
        style={{
          backgroundColor: 'var(--color-accent)',
          opacity: 0.1
        }}
      />
      <div 
        className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"
        style={{
          backgroundColor: 'var(--color-accent)',
          opacity: 0.08
        }}
      />
    </div>
  );
};

export default BackgroundGrid;