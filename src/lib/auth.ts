/**
 * Authentication utilities for password hashing, JWT token generation, and session management.
 * Implements secure password hashing with bcrypt and JWT-based session tokens.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/env';

// ============================================================
// Constants
// ============================================================

const BCRYPT_SALT_ROUNDS = 10;
const SESSION_EXPIRATION_HOURS = 24;
const SESSION_EXPIRATION_SECONDS = SESSION_EXPIRATION_HOURS * 60 * 60;

// ============================================================
// Password Hashing
// ============================================================

/**
 * Hash a password using bcrypt with secure salt rounds.
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password.
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// JWT Token Management
// ============================================================

export interface SessionPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT session token.
 * @param userId - Admin user ID
 * @param email - Admin user email
 * @returns JWT token string
 */
export function generateSessionToken(userId: string, email: string): string {
  const payload: SessionPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${SESSION_EXPIRATION_HOURS}h`,
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode a JWT session token.
 * @param token - JWT token to verify
 * @returns Decoded session payload if valid, null if invalid or expired
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as SessionPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get session expiration time in seconds from now.
 * @returns Number of seconds until session expires
 */
export function getSessionExpirationSeconds(): number {
  return SESSION_EXPIRATION_SECONDS;
}

/**
 * Get session expiration time as a Date object.
 * @returns Date object representing when session expires
 */
export function getSessionExpirationDate(): Date {
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + SESSION_EXPIRATION_SECONDS);
  return expirationDate;
}

// ============================================================
// Cookie Configuration
// ============================================================

export const SESSION_COOKIE_NAME = 'session_token';

/**
 * Get secure cookie options for session token.
 * @returns Cookie options object for Set-Cookie header
 */
export function getSessionCookieOptions() {
  const expirationDate = getSessionExpirationDate();

  return {
    name: SESSION_COOKIE_NAME,
    options: {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict' as const, // CSRF protection
      maxAge: SESSION_EXPIRATION_SECONDS, // 24 hours in seconds
      path: '/',
      expires: expirationDate,
    },
  };
}

/**
 * Format cookie string for Set-Cookie header.
 * @param token - Session token to set
 * @returns Formatted cookie string
 */
export function formatSessionCookie(token: string): string {
  const { name, options } = getSessionCookieOptions();
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production';
  
  const cookieParts = [
    `${name}=${token}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `Expires=${options.expires.toUTCString()}`,
    'HttpOnly',
  ];

  if (isProduction) {
    cookieParts.push('Secure');
    // Using Lax for production/preview to ensure better reliability across redirects if needed, 
    // but Strict is generally safer for CSRF. Vercel previews sometimes struggle with Strict.
    cookieParts.push('SameSite=Lax');
  } else {
    cookieParts.push('SameSite=Lax');
  }

  return cookieParts.join('; ');
}

/**
 * Format cookie string for clearing session (logout).
 * @returns Formatted cookie string with Max-Age=0
 */
export function formatClearSessionCookie(): string {
  const { name, options } = getSessionCookieOptions();
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production';
  
  const cookieParts = [
    `${name}=`,
    `Path=${options.path}`,
    'Max-Age=0',
    `Expires=${new Date(0).toUTCString()}`,
    'HttpOnly',
  ];

  if (isProduction) {
    cookieParts.push('Secure');
    cookieParts.push('SameSite=Lax');
  } else {
    cookieParts.push('SameSite=Lax');
  }

  return cookieParts.join('; ');
}

// ============================================================
// Session Extraction from Request
// ============================================================

/**
 * Extract session token from request cookies.
 * @param cookieHeader - Cookie header string from request
 * @returns Session token if found, null otherwise
 */
export function extractSessionToken(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name.trim() === SESSION_COOKIE_NAME && value) {
      return value.trim();
    }
  }

  return null;
}

/**
 * Extract and verify session from request headers.
 * @param headers - Request headers object
 * @returns Session payload if valid, null otherwise
 */
export function getSessionFromHeaders(headers: Record<string, string | string[] | undefined>): SessionPayload | null {
  const cookieHeader = headers.cookie;
  if (!cookieHeader) return null;

  const token = extractSessionToken(
    typeof cookieHeader === 'string' ? cookieHeader : cookieHeader[0]
  );
  if (!token) return null;

  return verifySessionToken(token);
}

// ============================================================
// Request-based Session Verification
// ============================================================

/**
 * Verify session from a Next.js Request object.
 * @param request - Next.js Request object
 * @returns Session payload if valid, null otherwise
 */
export function verifySession(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const token = extractSessionToken(cookieHeader);
  if (!token) return null;

  return verifySessionToken(token);
}
