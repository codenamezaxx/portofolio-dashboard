/**
 * useSession Hook
 * 
 * Client-side hook for managing user session state.
 * Fetches session from /api/auth/session endpoint.
 * Provides session data and loading/error states.
 * Includes retry logic for race conditions during login.
 */

import { useEffect, useState } from 'react';
import type { AdminUser } from '@/types';

export interface SessionState {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useSession(): SessionState {
  const [session, setSession] = useState<SessionState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const fetchSession = async (retryCount = 0) => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include', // Include cookies
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setSession({
            user: data.data.user,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } else if (response.status === 401) {
          // Not authenticated - this is expected for unauthenticated users
          setSession({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
        } else {
          // Other errors - retry once after a short delay
          if (retryCount < 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return fetchSession(retryCount + 1);
          }
          
          setSession({
            user: null,
            isLoading: false,
            error: 'Failed to fetch session',
            isAuthenticated: false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
        
        // Retry once on network errors
        if (retryCount < 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
          return fetchSession(retryCount + 1);
        }
        
        setSession({
          user: null,
          isLoading: false,
          error: 'Failed to fetch session',
          isAuthenticated: false,
        });
      }
    };

    fetchSession();
  }, []);

  return session;
}
