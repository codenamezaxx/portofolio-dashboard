/**
 * useLogout Hook
 * 
 * Client-side hook for handling logout functionality.
 * Calls the logout API endpoint and redirects to login page.
 * 
 * Features:
 * - Clears session token from HTTP-only cookie
 * - Handles logout errors gracefully
 * - Shows loading state during logout
 * - Redirects to login page after successful logout
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies to send session token
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Logout failed');
      }

      // Clear error state on success
      setError(null);
      
      // Redirect to login page after successful logout
      // Use a small delay to ensure cookie is cleared
      setTimeout(() => {
        router.push('/login');
      }, 100);
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return { logout, isLoading, error };
}
