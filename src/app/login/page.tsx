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

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/validation';
import type { ApiError } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });

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
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Admin Login</h1>
          <p className="text-[var(--muted)]">Sign in to manage your portfolio</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="admin@example.com"
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                fieldErrors.email
                  ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[var(--border)] bg-[var(--input-bg)] focus:border-blue-500 focus:ring-blue-500/20'
              } focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs">{fieldErrors.email[0]}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="••••••••"
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                fieldErrors.password
                  ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[var(--border)] bg-[var(--input-bg)] focus:border-blue-500 focus:ring-blue-500/20'
              } focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {fieldErrors.password && (
              <p className="text-red-400 text-xs">{fieldErrors.password[0]}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-[var(--muted)] text-center">
            This is a secure admin area. Only authorized users can access the portfolio management dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}
