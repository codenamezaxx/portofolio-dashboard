/**
 * GET /api/auth/session
 * 
 * Get the current session information.
 * Returns the authenticated user's information and session expiration time.
 * 
 * Response:
 *   - 200: { user: AdminUser, expiresAt: Date }
 *   - 401: { error: string }
 *   - 500: { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders, getSessionExpirationDate } from '@/lib/auth';
import { findAdminUserById } from '@/lib/db';
import type { AdminUser, ApiError } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get session from headers or request cookies
    const cookieHeader = request.headers.get('cookie');
    const token = request.cookies.get('session_token')?.value || (cookieHeader ? getSessionFromHeaders({ cookie: cookieHeader }) : null);
        
    const session = typeof token === 'string' ? getSessionFromHeaders({ cookie: `session_token=${token}` }) : getSessionFromHeaders(Object.fromEntries(request.headers.entries()));
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' } as ApiError,
        { status: 401 }
      );
    }

    // Fetch user details from database
    const user = await findAdminUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' } as ApiError,
        { status: 401 }
      );
    }

    // Get session expiration time
    const expiresAt = getSessionExpirationDate();

    const response = NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            email: user.email,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          } as AdminUser,
          expiresAt,
        },
      },
      { status: 200 }
    );

    // Disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiError,
      { status: 500 }
    );
  }
}
