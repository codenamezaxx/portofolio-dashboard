/**
 * Query Result Caching Layer
 * Simple in-memory cache with TTL for database queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    // Default TTL: 60 seconds
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Cache expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache data with optional custom TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const queryCache = new QueryCache(60000); // 60 second TTL

// Cache key generators
export const cacheKeys = {
  profile: () => 'profile',
  techStack: () => 'tech_stack',
  journeyItems: () => 'journey_items',
  projects: () => 'projects',
  projectById: (id: string) => `project:${id}`,
  projectsByCategory: (category: string) => `projects:category:${category}`,
  achievements: () => 'achievements',
  achievementsByCategory: (category: string) => `achievements:category:${category}`,
  contactInfo: () => 'contact_info',
  allPortfolioData: () => 'all_portfolio_data',
};