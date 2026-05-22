/**
 * GET /api/portfolio/hero
 * 
 * Fetch hero section content (profile information).
 * Public endpoint - no authentication required.
 * 
 * Returns profile data with caching headers for ISR.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch profile data (hero section)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Hero fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch hero section' },
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
    console.error('Hero API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
