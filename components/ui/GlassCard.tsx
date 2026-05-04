import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border border-surface bg-primary/[0.02] backdrop-blur-xl
      ${hoverEffect ? 'transition-all duration-300 hover:border-accentGlow hover:bg-primary/[0.05]' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;