/**
 * POST /api/auth/change-password
 * 
 * Change the current user's password.
 * Requires valid session and current password verification.
 * 
 * Request body:
 *   - currentPassword: string (current password for verification)
 *   - newPassword: string (new password, min 8 characters)
 * 
 * Response:
 *   - 200: { message: string }
 *   - 400: { error: string } (validation error)
 *   - 401: { error: string } (not authenticated or invalid current password)
 *   - 500: { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, hashPassword, verifyPassword } from '@/lib/auth';
import { findAdminUserByEmail, supabase, createAuditLog } from '@/lib/db';
import type { ApiError } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify session
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' } as ApiError,
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { error: 'Current password is required' } as ApiError,
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'New password is required' } as ApiError,
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' } as ApiError,
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' } as ApiError,
        { status: 400 }
      );
    }

    // Fetch user with password hash
    const user = await findAdminUserByEmail(session.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' } as ApiError,
        { status: 401 }
      );
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' } as ApiError,
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' } as ApiError,
        { status: 500 }
      );
    }

    // Log the password change
    await createAuditLog({
      adminUserId: user.id,
      action: 'UPDATE',
      entityType: 'admin_users',
      entityId: user.id,
      newValues: { passwordChanged: true },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiError,
      { status: 500 }
    );
  }
}
