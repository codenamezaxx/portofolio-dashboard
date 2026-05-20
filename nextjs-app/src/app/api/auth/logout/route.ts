/**
 * POST /api/auth/logout
 * 
 * Logout the current admin user by clearing the session cookie.
 * 
 * Response:
 *   - 200: { message: string }
 *   - 401: { error: string }
 *   - 500: { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders, SESSION_COOKIE_NAME } from '@/lib/auth';
import { createAuditLog } from '@/lib/db';
import type { ApiError } from '@/types';

/**
 * Get client IP address from request.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get session from headers
    const headers = Object.fromEntries(request.headers.entries());
    const session = getSessionFromHeaders(headers);

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' } as ApiError,
        { status: 401 }
      );
    }

    // Get client IP and user agent for audit logging
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create audit log entry
    await createAuditLog({
      adminUserId: session.userId,
      action: 'LOGOUT',
      entityType: 'admin_user',
      entityId: session.userId,
      ipAddress: clientIp,
      userAgent,
    });

    // Create response and clear session cookie using Next.js cookies API
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiError,
      { status: 500 }
    );
  }
}
