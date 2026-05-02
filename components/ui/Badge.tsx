import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'accent';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    default: "bg-white/10 text-white/90 border-white/5",
    outline: "bg-transparent border-white/20 text-muted",
    accent: "bg-accent/20 text-accent border-accent/20"
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;