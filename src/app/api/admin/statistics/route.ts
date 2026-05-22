/**
 * GET /api/admin/statistics
 * 
 * Fetch dashboard statistics for the admin panel.
 * Returns counts of projects, achievements, and tech stack items.
 * 
 * Authentication: Required (admin user)
 * Response: { projects: number, achievements: number, techStack: number, lastUpdated: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch statistics in parallel
    const [projectsResult, achievementsResult, techStackResult] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('achievements').select('id', { count: 'exact', head: true }),
      supabase.from('tech_stack').select('id', { count: 'exact', head: true }),
    ]);

    // Handle errors
    if (projectsResult.error || achievementsResult.error || techStackResult.error) {
      console.error('Statistics fetch error:', {
        projects: projectsResult.error,
        achievements: achievementsResult.error,
        techStack: techStackResult.error,
      });
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Return statistics
    return NextResponse.json({
      data: {
        projects: projectsResult.count || 0,
        achievements: achievementsResult.count || 0,
        techStack: techStackResult.count || 0,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
