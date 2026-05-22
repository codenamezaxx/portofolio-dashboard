/**
 * Custom hook for fetching dashboard statistics.
 * Provides real-time statistics with automatic refresh capability.
 */

'use client';

import { useEffect, useState } from 'react';

export interface Statistics {
  projects: number;
  achievements: number;
  techStack: number;
  lastUpdated: string;
}

interface UseStatisticsReturn {
  statistics: Statistics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage dashboard statistics.
 * @returns Statistics data, loading state, error, and refetch function
 */
export function useStatistics(): UseStatisticsReturn {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/statistics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - please log in again');
        } else {
          setError('Failed to fetch statistics');
        }
        setStatistics(null);
        return;
      }

      const result = await response.json();
      setStatistics(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to fetch statistics');
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics,
  };
}
