export const lightTheme = {
  colors: {
    background: '#FAF6F1',
    surface: '#F5EBE0',
    card: '#FFFFFF',
    primary: '#4A4A4A',
    muted: '#8B7355',
    accent: '#B8860B',
    accentGlow: 'rgba(184, 134, 11, 0.12)',
  },
  name: 'light' as const,
};

export const darkTheme = {
  colors: {
    background: '#1F1F1F',
    surface: '#2A2A2A',
    card: '#242424',
    primary: '#F5F5F5',
    muted: '#B0B0B0',
    accent: '#D4AF37',
    accentGlow: 'rgba(212, 175, 55, 0.12)',
  },
  name: 'dark' as const,
};

export type ThemeName = typeof lightTheme.name | typeof darkTheme.name;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
