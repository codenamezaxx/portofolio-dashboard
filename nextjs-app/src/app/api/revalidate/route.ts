/**
 * ISR Revalidation Endpoint
 * Handles on-demand ISR revalidation for portfolio content
 */

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

/**
 * POST /api/revalidate
 * Revalidate ISR cache — callable from admin panel after content updates.
 * Requires valid admin session OR internal revalidate secret.
 */
export async function POST(request: NextRequest) {
  try {
    // Allow if valid admin session OR internal secret header
    const internalSecret = request.headers.get('x-revalidate-secret');
    const isInternalCall = internalSecret === (process.env.REVALIDATE_SECRET || 'internal-revalidate');

    if (!isInternalCall) {
      const session = verifySession(request);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Revalidate all public pages
    revalidatePath('/', 'layout');
    revalidatePath('/');

    console.log('✅ ISR cache revalidated');

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'ISR revalidation endpoint is running',
    timestamp: new Date().toISOString(),
  });
}
