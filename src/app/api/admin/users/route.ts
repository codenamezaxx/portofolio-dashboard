/**
 * GET /api/admin/users
 * POST /api/admin/users
 * DELETE /api/admin/users/:id
 * PUT /api/admin/users/:id
 * 
 * Manage admin user accounts.
 * 
 * Authentication: Admin only
 * 
 * Features:
 * - List all admin users
 * - Create new admin user
 * - Update admin user (email, password, active status)
 * - Delete admin user (revokes session)
 * - Email uniqueness validation
 * - Password strength requirements
 * - Audit logging for all actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';
import { sanitizeHtml } from '@/lib/sanitization';

// Password strength regex: at least one uppercase, one lowercase, one number, one special character, min 8 chars
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const UserSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  isActive: z.boolean().optional(),
});

const SALT_ROUNDS = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, email, is_active, last_login, created_at, updated_at');

    if (error) {
      console.error('Failed to fetch admin users:', error);
      return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
    }

    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      isActive: user.is_active,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    return NextResponse.json({ data: transformedUsers });
  } catch (error) {
    console.error('Admin users GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = UserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email: rawEmail, password, isActive } = validationResult.data;
    const email = sanitizeHtml(rawEmail); // Sanitize email

    // Check for unique email
    const { data: existingUser, error: findError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking for existing user:', findError);
      return NextResponse.json({ error: 'Database error when checking user' }, { status: 500 });
    }
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email,
        password_hash: passwordHash,
        is_active: isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create admin user:', error);
      return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
    }

    await logAudit(session.userId, 'CREATE', 'admin_users', data.id, null, { email, isActive });

    const transformedUser = {
      id: data.id,
      email: data.email,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ data: transformedUser, message: 'Admin user created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Admin users POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

