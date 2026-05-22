/**
 * GET /api/content/contact-info
 * PUT /api/content/contact-info
 * 
 * Manage contact information (social links).
 * 
 * GET: Fetch contact info (public read)
 * PUT: Update contact info (admin only) - also creates version history
 * 
 * Authentication: Required for PUT (admin user)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

// URL validation helper
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validation schema for contact info updates
const ContactInfoUpdateSchema = z.object({
  githubUrl: z.string().url('Invalid GitHub URL').optional().nullable(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().nullable(),
  instagramUrl: z.string().url('Invalid Instagram URL').optional().nullable(),
  telegramUrl: z.string().url('Invalid Telegram URL').optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
}).refine(
  (data) => {
    // At least one field should be provided
    return Object.values(data).some(value => value !== null && value !== undefined);
  },
  { message: 'At least one contact information field is required' }
);

// Helper to transform snake_case database object to camelCase frontend object
const transformContactInfo = (info: any) => {
  if (!info) return null;
  return {
    id: info.id,
    githubUrl: info.github_url,
    linkedinUrl: info.linkedin_url,
    instagramUrl: info.instagram_url,
    telegramUrl: info.telegram_url,
    email: info.email,
    createdAt: info.created_at,
    updatedAt: info.updated_at,
  };
};

export async function GET(request: NextRequest) {
  try {
    // Fetch contact info (public read)
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Contact info fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact information' },
        { status: 500 }
      );
    }

    // Map snake_case to camelCase
    const transformedData = (data || []).map(transformContactInfo);

    return NextResponse.json({
      data: transformedData,
    });
  } catch (error) {
    console.error('Contact info API error:', error);
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
    const validationResult = ContactInfoUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { githubUrl, linkedinUrl, instagramUrl, telegramUrl, email } = validationResult.data;

    // Find existing contact info record
    const { data: existingInfo, error: fetchError } = await supabase
      .from('contact_info')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.error('Contact info fetch error before update:', fetchError);
    }

    const infoId = existingInfo?.[0]?.id;

    // Update contact info (upsert - update if exists, insert if not)
    const contactData: any = {
      github_url: githubUrl || null,
      linkedin_url: linkedinUrl || null,
      instagram_url: instagramUrl || null,
      telegram_url: telegramUrl || null,
      email: email || null,
      updated_at: new Date().toISOString(),
    };

    if (infoId) {
      contactData.id = infoId;
    }

    const { data, error } = await supabase
      .from('contact_info')
      .upsert(contactData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Contact info update error:', error);
      return NextResponse.json(
        { error: `Failed to update contact information: ${error.message}` },
        { status: 500 }
      );
    }

    // Create version history entry
    const { error: historyError } = await supabase
      .from('contact_info_history')
      .insert({
        contact_info_id: data.id,
        admin_user_id: session.userId || null,
        github_url: githubUrl || null,
        linkedin_url: linkedinUrl || null,
        instagram_url: instagramUrl || null,
        telegram_url: telegramUrl || null,
        email: email || null,
      });

    if (historyError) {
      console.error('Version history creation error:', historyError);
      // Don't fail the request if history creation fails, just log it
    }

    return NextResponse.json({
      data: transformContactInfo(data),
      message: 'Contact information updated successfully',
    });
  } catch (error) {
    console.error('Contact info API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
