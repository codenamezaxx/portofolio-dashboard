/**
 * Custom hook for fetching dashboard statistics.
 * Provides real-time statistics with automatic refresh capability and SWR caching.
 */

'use client';

import useSWR from 'swr';

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

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in again');
    }
    throw new Error('Failed to fetch statistics');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Hook to fetch and manage dashboard statistics with SWR caching.
 * @returns Statistics data, loading state, error, and refetch function
 */
export function useStatistics(): UseStatisticsReturn {
  const { data, error, isLoading, mutate } = useSWR<Statistics>(
    '/api/admin/statistics',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const refetch = async () => {
    await mutate();
  };

  return {
    statistics: data || null,
    isLoading,
    error: error ? error.message : null,
    refetch,
  };
}