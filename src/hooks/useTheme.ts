/**
 * useTheme Hook
 * Provides access to theme context with type safety
 */

'use client';

import { useTheme as useThemeContext } from '@/contexts/ThemeProvider';

export { useTheme as default };

export const useTheme = useThemeContext;
