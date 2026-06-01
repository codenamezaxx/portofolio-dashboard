/**
 * Next.js Proxy (previously Middleware)
 *
 * Handles:
 * - Authentication checks for protected routes (/admin/*)
 * - Redirect unauthenticated users to /login
 * - Security headers on all responses
 * - Rate limiting for API endpoints
 *
 * Note: In Next.js 16+, this file is named proxy.ts and exports a `proxy` function.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

// Routes that require authentication
const PROTECTED_ROUTES = ['/admin'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
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
    if (pathname === '/api/auth/login') {
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

  // Check for session token in cookies
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionToken);

  // Protect admin routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - api routes (handled separately for security/auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|js|css)$).*)',
    '/api/:path*', // Include API routes for rate limiting
  ],
};