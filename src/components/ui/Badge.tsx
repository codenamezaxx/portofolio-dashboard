'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'accent';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    default: "bg-white/10 text-white/90 border-white/5",
    outline: "bg-transparent border-hairline text-body dark:text-body dark:border-hairline",
    accent: "bg-primary/20 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/20"
  };

  return (
    <span className={`px-3 py-1 text-body-xs font-medium rounded-md border backdrop-blur-sm ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
