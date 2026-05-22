/**
 * POST /api/content/contact-info/restore
 * 
 * Restore contact information from a previous version.
 * 
 * Request Body:
 * - versionId: UUID of the version to restore
 * 
 * Authentication: Required (admin user)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

const RestoreSchema = z.object({
  versionId: z.string().uuid('Invalid version ID'),
});

export async function POST(request: NextRequest) {
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
    const validationResult = RestoreSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { versionId } = validationResult.data;

    // Fetch the version to restore
    const { data: versionData, error: versionError } = await supabase
      .from('contact_info_history')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError || !versionData) {
      console.error('Version fetch error:', versionError);
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Update contact info with restored values
    const { data: updatedData, error: updateError } = await supabase
      .from('contact_info')
      .update({
        github_url: versionData.github_url,
        linkedin_url: versionData.linkedin_url,
        instagram_url: versionData.instagram_url,
        telegram_url: versionData.telegram_url,
        email: versionData.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', versionData.contact_info_id)
      .select()
      .single();

    if (updateError) {
      console.error('Contact info update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to restore version' },
        { status: 500 }
      );
    }

    // Create a new history entry for the restore action
    const { error: historyError } = await supabase
      .from('contact_info_history')
      .insert({
        contact_info_id: versionData.contact_info_id,
        admin_user_id: session.userId || null,
        github_url: versionData.github_url,
        linkedin_url: versionData.linkedin_url,
        instagram_url: versionData.instagram_url,
        telegram_url: versionData.telegram_url,
        email: versionData.email,
      });

    if (historyError) {
      console.error('History entry creation error:', historyError);
      // Don't fail the request if history creation fails
    }

    return NextResponse.json({
      data: updatedData,
      message: 'Version restored successfully',
    });
  } catch (error) {
    console.error('Restore API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
