'use client';

/**
 * Login Page Component
 * 
 * Provides admin authentication interface with email/password form.
 * Handles form validation, submission, and error display.
 * Redirects to admin dashboard on successful login.
 * 
 * Acceptance Criteria:
 * - Login/logout flow works
 * - Sessions persist
 * - Protected routes redirect
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validation';
import type { ApiError } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import { Mail, Lock, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      // Client-side validation
      const validationResult = loginSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        setFieldErrors(errors);
        setIsLoading(false);
        return;
      }

      // Submit to login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include', // Include cookies in request
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = data as ApiError;
        if (apiError.details) {
          setFieldErrors(apiError.details);
        } else {
          setError(apiError.error || 'Login failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Successful login - use window.location for full page reload
      // This ensures the session cookie is properly available before the admin page loads
      console.log('✅ Login successful, redirecting to /admin...');
      
      // Small delay to ensure cookie is persisted in some environments
      setTimeout(() => {
        window.location.href = '/admin';
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen p-6 relative">
      <div className="absolute inset-0 z-0 radial-gradient-mask"></div>
      
      {/* Navigation and Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-mute hover:text-primary transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium hidden sm:inline">Kembali ke Beranda</span>
          <span className="font-medium sm:hidden">Kembali</span>
        </Link>
        
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-surface-soft border border-hairline text-primary hover:bg-surface-muted transition-all duration-300 flex items-center justify-center shadow-sm"
          title="Switch mode"
          aria-label="Switch mode"
        >
          {mounted && (theme === 'light' ? <Moon size={20} /> : <Sun size={20} />)}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <GlassCard className="p-8 shadow-2xl backdrop-blur-md border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ink mb-2">Admin Login</h1>
            <p className="text-sm text-mute">Sign in to manage your portfolio</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="admin@example.com"
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    fieldErrors.email
                      ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-hairline bg-surface-soft focus:border-primary focus:ring-primary/20'
                  } focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-ink`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    fieldErrors.password
                      ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-hairline bg-surface-soft focus:border-primary focus:ring-primary/20'
                  } focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-ink`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary hover:bg-primary-dark disabled:bg-gray-500 disabled:cursor-not-allowed text-on-primary font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </main>
  );
}
