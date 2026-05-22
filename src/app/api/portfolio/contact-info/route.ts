/**
 * GET /api/portfolio/contact-info
 * 
 * Fetch contact information (social links).
 * Public endpoint - no authentication required.
 * 
 * Returns contact info with caching headers for ISR.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch contact info
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Contact info fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact information' },
        { status: 500 }
      );
    }

    // Set caching headers for ISR
    const response = NextResponse.json({
      data,
    });

    // Cache for 1 hour, revalidate in background
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  } catch (error) {
    console.error('Contact info API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
