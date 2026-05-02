import React from 'react';

const BackgroundGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Radial Gradient overlay */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(#B8860B 1px, transparent 1px), linear-gradient(90deg, #B8860B 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Ambient Blobs - Warm cream tones */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-700 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-700 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000" />
    </div>
  );
};

export default BackgroundGrid;