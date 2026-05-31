/**
 * Query Performance Test Script
 * Tests database query performance with and without caching
 */

import {
  getProfile,
  getTechStack,
  getJourneyItems,
  getProjects,
  getAchievements,
  getContactInfo,
  getAllPortfolioData,
} from '../src/lib/portfolio-data';
import { queryCache } from '../src/lib/query-cache';

interface PerformanceResult {
  operation: string;
  duration: number;
  cached: boolean;
}

async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  cached: boolean = false
): Promise<PerformanceResult> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;

  return {
    operation,
    duration: Math.round(duration * 100) / 100,
    cached,
  };
}

async function runPerformanceTests() {
  console.log('🚀 Starting Query Performance Tests\n');
  console.log('=' .repeat(60));

  const results: PerformanceResult[] = [];

  // Clear cache before starting
  queryCache.clear();
  console.log('✓ Cache cleared\n');

  // Test 1: First fetch (no cache)
  console.log('📊 Test 1: First Fetch (No Cache)');
  console.log('-'.repeat(60));

  results.push(await measurePerformance('getProfile', getProfile, false));
  results.push(await measurePerformance('getTechStack', getTechStack, false));
  results.push(await measurePerformance('getJourneyItems', getJourneyItems, false));
  results.push(await measurePerformance('getProjects', getProjects, false));
  results.push(await measurePerformance('getAchievements', getAchievements, false));
  results.push(await measurePerformance('getContactInfo', getContactInfo, false));
  results.push(await measurePerformance('getAllPortfolioData', getAllPortfolioData, false));

  console.log('\n📊 Test 2: Second Fetch (With Cache)');
  console.log('-'.repeat(60));

  // Test 2: Second fetch (with cache)
  results.push(await measurePerformance('getProfile', getProfile, true));
  results.push(await measurePerformance('getTechStack', getTechStack, true));
  results.push(await measurePerformance('getJourneyItems', getJourneyItems, true));
  results.push(await measurePerformance('getProjects', getProjects, true));
  results.push(await measurePerformance('getAchievements', getAchievements, true));
  results.push(await measurePerformance('getContactInfo', getContactInfo, true));
  results.push(await measurePerformance('getAllPortfolioData', getAllPortfolioData, true));

  // Display results
  console.log('\n📈 Performance Results');
  console.log('='.repeat(60));
  console.log(
    `${'Operation'.padEnd(25)} | ${'No Cache'.padEnd(12)} | ${'With Cache'.padEnd(12)} | ${'Speedup'.padEnd(10)}`
  );
  console.log('-'.repeat(60));

  const operations = [
    'getProfile',
    'getTechStack',
    'getJourneyItems',
    'getProjects',
    'getAchievements',
    'getContactInfo',
    'getAllPortfolioData',
  ];

  operations.forEach((op) => {
    const noCache = results.find((r) => r.operation === op && !r.cached);
    const withCache = results.find((r) => r.operation === op && r.cached);

    if (noCache && withCache) {
      const speedup = (noCache.duration / withCache.duration).toFixed(2);
      console.log(
        `${op.padEnd(25)} | ${(noCache.duration + 'ms').padEnd(12)} | ${(withCache.duration + 'ms').padEnd(12)} | ${(speedup + 'x').padEnd(10)}`
      );
    }
  });

  // Calculate averages
  const noCacheResults = results.filter((r) => !r.cached);
  const cachedResults = results.filter((r) => r.cached);

  const avgNoCache =
    noCacheResults.reduce((sum, r) => sum + r.duration, 0) / noCacheResults.length;
  const avgCached =
    cachedResults.reduce((sum, r) => sum + r.duration, 0) / cachedResults.length;
  const avgSpeedup = avgNoCache / avgCached;

  console.log('-'.repeat(60));
  console.log(
    `${'Average'.padEnd(25)} | ${(Math.round(avgNoCache * 100) / 100 + 'ms').padEnd(12)} | ${(Math.round(avgCached * 100) / 100 + 'ms').padEnd(12)} | ${(avgSpeedup.toFixed(2) + 'x').padEnd(10)}`
  );

  // Performance targets
  console.log('\n🎯 Performance Targets');
  console.log('='.repeat(60));
  console.log(`Target: All queries < 200ms`);
  console.log(`Status: ${noCacheResults.every((r) => r.duration < 200) ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`\nCache speedup: ${avgSpeedup.toFixed(2)}x`);
  console.log(`Status: ${avgSpeedup > 5 ? '✅ EXCELLENT' : avgSpeedup > 2 ? '✅ GOOD' : '⚠️  NEEDS IMPROVEMENT'}`);

  // Cache statistics
  console.log('\n📦 Cache Statistics');
  console.log('='.repeat(60));
  const stats = queryCache.getStats();
  console.log(`Cache size: ${stats.size} entries`);
  console.log(`Cached keys: ${stats.keys.join(', ')}`);

  console.log('\n✅ Performance tests completed!\n');
}

// Run tests
runPerformanceTests().catch((error) => {
  console.error('❌ Error running performance tests:', error);
  process.exit(1);
});