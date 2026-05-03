import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    
    // Update CSS variables
    if (newTheme === 'dark') {
      root.style.setProperty('--color-background', '#1F1F1F');
      root.style.setProperty('--color-surface', '#2A2A2A');
      root.style.setProperty('--color-card', '#242424');
      root.style.setProperty('--color-primary', '#F5F5F5');
      root.style.setProperty('--color-muted', '#B0B0B0');
      root.style.setProperty('--color-accent', '#D4AF37');
      root.style.setProperty('--color-accent-glow', 'rgba(212, 175, 55, 0.12)');
    } else {
      root.style.setProperty('--color-background', '#FAF6F1');
      root.style.setProperty('--color-surface', '#F5EBE0');
      root.style.setProperty('--color-card', '#FFFFFF');
      root.style.setProperty('--color-primary', '#4A4A4A');
      root.style.setProperty('--color-muted', '#8B7355');
      root.style.setProperty('--color-accent', '#B8860B');
      root.style.setProperty('--color-accent-glow', 'rgba(184, 134, 11, 0.12)');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
