'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border border-white/5 bg-surface-card/40
      dark:bg-surface-card/20 dark:border-white/5 backdrop-blur-md dark:shadow-primary/10
      ${hoverEffect ? 'transition-all duration-300 hover:scale-[1.01] hover:border-primary/20 dark:hover:border-primary/20' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;
