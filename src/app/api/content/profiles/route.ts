/**
 * GET /api/content/profiles
 * PUT /api/content/profiles
 * 
 * Manage profile/hero section content.
 * 
 * GET: Fetch profile data (public read)
 * PUT: Update profile data (admin only)
 * 
 * Authentication: Required for PUT (admin user)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for profile updates
const ProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  role: z.string().min(1, 'Role is required').max(255, 'Role must be less than 255 characters'),
  tagline: z.string().min(1, 'Tagline is required').max(500, 'Tagline must be less than 500 characters'),
  heroImageUrl: z.string().url('Invalid image URL').optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    // Fetch profile data (public read)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    // Map snake_case to camelCase
    const transformedData = (data || []).map(profile => ({
      id: profile.id,
      name: profile.name,
      role: profile.role,
      tagline: profile.tagline,
      heroImageUrl: profile.hero_image_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }));

    return NextResponse.json({
      data: transformedData,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = ProfileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, role, tagline, heroImageUrl } = validationResult.data;

    // Get the existing profile record to find its ID
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.error('Profile fetch error before update:', fetchError);
    }

    const profileId = existingProfiles?.[0]?.id;

    // Update profile (upsert - update if exists, insert if not)
    // Map camelCase to snake_case for database
    const profileData: any = {
      name,
      role,
      tagline,
      hero_image_url: heroImageUrl,
      updated_at: new Date().toISOString(),
    };

    if (profileId) {
      profileData.id = profileId;
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: `Failed to update profile: ${error.message}` },
        { status: 500 }
      );
    }

    // Map back to camelCase for response
    const transformedResponse = {
      id: data.id,
      name: data.name,
      role: data.role,
      tagline: data.tagline,
      heroImageUrl: data.hero_image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({
      data: transformedResponse,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
