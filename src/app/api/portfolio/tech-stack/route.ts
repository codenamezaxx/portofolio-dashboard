/**
 * GET /api/portfolio/tech-stack
 * 
 * Fetch all tech stack items.
 * Public endpoint - no authentication required.
 * 
 * Returns tech stack items sorted by display order with caching headers for ISR.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch tech stack items
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Tech stack fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tech stack' },
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
    console.error('Tech stack API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
