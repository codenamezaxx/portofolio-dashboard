/**
 * GET /api/portfolio/achievements
 * 
 * Fetch all achievements and certifications.
 * Public endpoint - no authentication required.
 * 
 * Returns achievements sorted by display order with caching headers for ISR.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch achievements
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Achievements fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      );
    }

    // Set caching headers for ISR
    const response = NextResponse.json({
      data: data || [],
    });

    // Cache for 1 hour, revalidate in background
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
