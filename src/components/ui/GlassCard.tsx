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
      relative overflow-hidden rounded-md border border-hairline bg-surface-card
      dark:bg-surface-card dark:border-hairline
      ${hoverEffect ? 'transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/30' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;
