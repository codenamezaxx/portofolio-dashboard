import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
}

/**
 * Basic in-memory rate limiting.
 * Note: In serverless environments (Vercel), this is per-instance.
 * For production, a Redis-based store is recommended.
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  
  const key = `${config.keyPrefix || 'rl'}:${ip}`;
  const now = Date.now();
  
  let record = memoryStore.get(key);
  
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }
  
  record.count++;
  memoryStore.set(key, record);
  
  const remaining = Math.max(0, config.limit - record.count);
  const success = record.count <= config.limit;
  
  return {
    success,
    limit: config.limit,
    remaining,
    reset: record.resetTime
  };
}

/**
 * Exponential backoff helper for login failures.
 */
export function getLoginBackoff(attempts: number): number {
  if (attempts <= 3) return 0;
  // 30s, 60s, 120s, 240s, etc.
  return Math.min(15 * 60 * 1000, Math.pow(2, attempts - 4) * 30 * 1000);
}