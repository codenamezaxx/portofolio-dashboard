/**
 * GET /api/portfolio/resume
 * 
 * Fetch resume/CV URL from profile
 * Public endpoint - no authentication required
 * 
 * Returns the resume URL stored in the profiles table
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Fetch profile with resume_url
    const { data, error } = await supabase
      .from('profiles')
      .select('resume_url')
      .single();

    if (error) {
      console.error('Resume fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch resume' },
        { status: 500 }
      );
    }

    if (!data?.resume_url) {
      return NextResponse.json(
        { error: 'Resume not available' },
        { status: 404 }
      );
    }

    // Check if we should download (by proxying/streaming the file) or return JSON
    const shouldDownload = request.nextUrl.searchParams.get('download') === 'true';

    if (shouldDownload) {
      try {
        const fileResponse = await fetch(data.resume_url, { cache: 'no-store' });
        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file from storage: ${fileResponse.statusText}`);
        }

        const fileBuffer = await fileResponse.arrayBuffer();

        const response = new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="CV - Zakky Ahmad El-Kholily.pdf"',
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        return response;
      } catch (streamError) {
        console.error('⚠️ Failed to stream CV download, falling back to redirect:', streamError);
        return NextResponse.redirect(data.resume_url);
      }
    }

    // Set caching headers for JSON response
    const response = NextResponse.json({
      resume_url: data.resume_url,
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error) {
    console.error('Resume API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
