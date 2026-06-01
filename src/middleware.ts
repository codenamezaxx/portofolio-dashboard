import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Standard rate limit: 100 requests per minute per IP
    const rl = await rateLimit(request, {
      limit: 100,
      windowMs: 60 * 1000,
      keyPrefix: 'api'
    });

    if (!rl.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: 'Please wait a moment before trying again.' 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rl.limit.toString(),
            'X-RateLimit-Remaining': rl.remaining.toString(),
            'X-RateLimit-Reset': rl.reset.toString()
          }
        }
      );
    }

    // Specific rate limit for login endpoint (extra protection)
    if (request.nextUrl.pathname === '/api/auth/login') {
      const loginRl = await rateLimit(request, {
        limit: 10,
        windowMs: 15 * 60 * 1000, // 10 attempts per 15 mins
        keyPrefix: 'login'
      });

      if (!loginRl.success) {
        return NextResponse.json(
          { error: 'Too many login attempts. Please try again in 15 minutes.' },
          { status: 429 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};