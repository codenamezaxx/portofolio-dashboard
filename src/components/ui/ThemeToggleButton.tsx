'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';
import { Button } from './Button';

const ThemeToggleButton: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="secondary"
      size="sm"
      className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-surface-soft/50 hover:bg-surface-soft border border-hairline hover:border-primary/40 transition-all cursor-pointer backdrop-blur-sm"
      title="Switch theme"
      aria-label="Switch theme"
    >
      {theme === 'light' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
    </Button>
  );
};

export default ThemeToggleButton;