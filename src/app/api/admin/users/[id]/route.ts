/**
 * Individual Admin User API
 * 
 * DELETE /api/admin/users/[id] - Delete a user
 * PUT /api/admin/users/[id] - Update a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';
import { sanitizeHtml } from '@/lib/sanitization';

// Password strength regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const UserUpdateSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required').optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .optional(),
  isActive: z.boolean().optional(),
});

const SALT_ROUNDS = 10;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userIdToDelete } = await params;

    // Prevent self-deletion
    if (session.userId === userIdToDelete) {
      return NextResponse.json({ error: 'Cannot delete own account' }, { status: 403 });
    }

    // Get user details for audit log
    const { data: oldUser, error: fetchOldUserError } = await supabase
      .from('admin_users')
      .select('email, is_active')
      .eq('id', userIdToDelete)
      .single();

    if (fetchOldUserError && fetchOldUserError.code !== 'PGRST116') {
      console.error('Error fetching user for deletion audit:', fetchOldUserError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!oldUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userIdToDelete);

    if (error) {
      console.error('Failed to delete admin user:', error);
      return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 });
    }

    await logAudit(session.userId, 'DELETE', 'admin_users', userIdToDelete, { email: oldUser.email, isActive: oldUser.is_active }, null);

    return NextResponse.json({ message: 'Admin user deleted successfully' });
    } catch (error) {
    console.error('[API Admin User DELETE] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    }

    export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    try {
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userIdToUpdate } = await params;
    const body = await request.json();
    const validationResult = UserUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    let { email: rawEmail, password, isActive } = validationResult.data;
    const email = rawEmail ? sanitizeHtml(rawEmail) : rawEmail;

    const updateData: any = {};
    let oldValues: any = {};
    let newValues: any = {};

    // Fetch old data for audit log
    const { data: existingUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('email, password_hash, is_active')
      .eq('id', userIdToUpdate)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[API Admin User PUT] Error fetching existing user:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    oldValues = {
      email: existingUser.email,
      isActive: existingUser.is_active,
    };
    newValues = { ...oldValues };

    if (email !== undefined && email !== existingUser.email) {
      const { data: conflictingUser, error: conflictError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .neq('id', userIdToUpdate)
        .single();

      if (conflictError && conflictError.code !== 'PGRST116') {
        console.error('[API Admin User PUT] Error checking email conflict:', conflictError);
        return NextResponse.json({ error: 'Database error when checking email' }, { status: 500 });
      }
      if (conflictingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      updateData.email = email;
      newValues.email = email;
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      updateData.password_hash = passwordHash;
      newValues.password_changed = true;
    }

    if (isActive !== undefined && isActive !== existingUser.is_active) {
      updateData.is_active = isActive;
      newValues.isActive = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes provided for update' }, { status: 200 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', userIdToUpdate)
      .select()
      .single();

    if (error) {
      console.error('[API Admin User PUT] Failed to update admin user:', error);
      return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 });
    }

    await logAudit(session.userId, 'UPDATE', 'admin_users', userIdToUpdate, oldValues, newValues);

    const transformedUser = {
      id: data.id,
      email: data.email,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ data: transformedUser, message: 'Admin user updated successfully' });
    } catch (error) {
    console.error('[API Admin User PUT] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    }