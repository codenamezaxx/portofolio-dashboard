/**
 * Achievements API Routes
 * 
 * Handles CRUD operations for certifications and achievements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { achievementSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }

    // Map snake_case to camelCase
    const transformedData = (data || []).map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      category: achievement.category,
      issuer: achievement.issuer,
      year: achievement.year,
      pdfUrl: achievement.pdf_url,
      externalLink: achievement.external_link,
      displayOrder: achievement.display_order,
      createdAt: achievement.created_at,
      updatedAt: achievement.updated_at,
    }));

    return NextResponse.json({ data: transformedData });
  } catch (error) {
    console.error('Unexpected error in GET /api/content/achievements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = verifySession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = achievementSchema.parse(body);

    const { data: existingItems } = await supabase
      .from('achievements')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextDisplayOrder = (existingItems?.[0]?.display_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('achievements')
      .insert({
        title: validatedData.title,
        category: validatedData.category,
        issuer: validatedData.issuer,
        year: validatedData.year,
        pdf_url: validatedData.pdfUrl,
        external_link: validatedData.externalLink,
        display_order: nextDisplayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating achievement:', error);
      return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = verifySession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (Array.isArray(body)) {
      for (const update of body) {
        await supabase
          .from('achievements')
          .update({ display_order: update.displayOrder })
          .eq('id', update.id);
      }
      return NextResponse.json({ message: 'Order updated successfully' });
    }

    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });

    const validatedData = achievementSchema.parse(updateData);

    const { data, error } = await supabase
      .from('achievements')
      .update({
        title: validatedData.title,
        category: validatedData.category,
        issuer: validatedData.issuer,
        year: validatedData.year,
        pdf_url: validatedData.pdfUrl,
        external_link: validatedData.externalLink,
        display_order: validatedData.displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 });

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = verifySession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Handle single delete via query param
    if (id) {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) return NextResponse.json({ error: 'Failed to delete achievement' }, { status: 500 });
      return NextResponse.json({ message: 'Achievement deleted successfully' });
    }

    // Handle bulk delete via request body
    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Achievement ID(s) required' }, { status: 400 });
    }

    const { error } = await supabase.from('achievements').delete().in('id', ids);
    if (error) return NextResponse.json({ error: 'Failed to delete achievements' }, { status: 500 });

    return NextResponse.json({ message: `${ids.length} achievements deleted successfully` });
  } catch (error) {
    console.error('DELETE /api/content/achievements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
