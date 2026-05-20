/**
 * POST /api/auth/login
 * 
 * Authenticate admin user with email and password.
 * Returns session token in HTTP-only cookie and user data in response.
 * 
 * Request body:
 *   - email: string (required)
 *   - password: string (required)
 * 
 * Response:
 *   - 200: { user: AdminUser, expiresIn: number }
 *   - 400: { error: string, details?: Record<string, string[]> }
 *   - 401: { error: string }
 *   - 500: { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { verifyPassword, generateSessionToken, getSessionExpirationSeconds, SESSION_COOKIE_NAME } from '@/lib/auth';
import { findAdminUserByEmail, updateAdminUserLastLogin, createAuditLog } from '@/lib/db';
import type { AdminUser, ApiError } from '@/types';

// Rate limiting map: email -> { attempts: number, resetTime: number }
export const loginAttempts = new Map<string, { attempts: number; resetTime: number }>();
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if login is rate limited for this email.
 */
export function isRateLimited(email: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (!record) {
    return false;
  }

  if (now > record.resetTime) {
    loginAttempts.delete(email);
    return false;
  }

  return record.attempts >= RATE_LIMIT_ATTEMPTS;
}

/**
 * Record a failed login attempt.
 */
export function recordFailedAttempt(email: string): void {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (!record || now > record.resetTime) {
    loginAttempts.set(email, {
      attempts: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    record.attempts += 1;
  }
}

/**
 * Clear login attempts for successful login.
 */
export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

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
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' } as ApiError,
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const details = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details } as ApiError,
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Check rate limiting
    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' } as ApiError,
        { status: 429 }
      );
    }

    // Find admin user
    const adminUser = await findAdminUserByEmail(email);
    if (!adminUser) {
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: 'Invalid email or password' } as ApiError,
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, adminUser.passwordHash);
    if (!passwordValid) {
      console.log(`❌ Password verification failed for ${email}`);
      console.log(`   Provided password: ${password}`);
      console.log(`   Stored hash: ${adminUser.passwordHash.substring(0, 20)}...`);
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: 'Invalid email or password' } as ApiError,
        { status: 401 }
      );
    }

    // Clear rate limiting on successful login
    clearLoginAttempts(email);

    // Update last login timestamp
    const updatedUser = await updateAdminUserLastLogin(adminUser.id);

    // Generate session token
    const sessionToken = generateSessionToken(adminUser.id, adminUser.email);
    const expiresIn = getSessionExpirationSeconds();

    // Get client IP and user agent for audit logging
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create audit log entry
    await createAuditLog({
      adminUserId: adminUser.id,
      action: 'LOGIN',
      entityType: 'admin_user',
      entityId: adminUser.id,
      ipAddress: clientIp,
      userAgent,
    });

    // Create response with session cookie
    const response = NextResponse.json(
      {
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            isActive: updatedUser.isActive,
            lastLogin: updatedUser.lastLogin,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
          } as AdminUser,
          expiresIn,
        },
      },
      { status: 200 }
    );

    // Set session cookie using Next.js cookies API (more reliable on Vercel)
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL_ENV === 'preview' ||
      process.env.VERCEL_ENV === 'production';

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    console.log('🍪 Session cookie set via cookies API');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiError,
      { status: 500 }
    );
  }
}
