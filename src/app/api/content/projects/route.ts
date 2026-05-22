/**
 * Projects API Routes
 * 
 * Handles CRUD operations for portfolio projects.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { projectSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Map snake_case to camelCase
    const transformedData = (data || []).map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      imageUrl: project.image_url,
      technologies: project.technologies,
      githubLink: project.github_link,
      liveLink: project.live_link,
      demoLink: project.demo_link,
      displayOrder: project.display_order,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    return NextResponse.json({ data: transformedData });
  } catch (error) {
    console.error('Unexpected error in GET /api/content/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = verifySession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const { data: existingItems } = await supabase
      .from('projects')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextDisplayOrder = (existingItems?.[0]?.display_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        image_url: validatedData.imageUrl,
        technologies: validatedData.technologies,
        github_link: validatedData.githubLink,
        live_link: validatedData.liveLink,
        demo_link: validatedData.demoLink,
        display_order: nextDisplayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
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
          .from('projects')
          .update({ display_order: update.displayOrder })
          .eq('id', update.id);
      }
      return NextResponse.json({ message: 'Order updated successfully' });
    }

    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

    const validatedData = projectSchema.parse(updateData);

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        image_url: validatedData.imageUrl,
        technologies: validatedData.technologies,
        github_link: validatedData.githubLink,
        live_link: validatedData.liveLink,
        demo_link: validatedData.demoLink,
        display_order: validatedData.displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });

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
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
      return NextResponse.json({ message: 'Project deleted successfully' });
    }

    // Handle bulk delete via request body
    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Project ID(s) required' }, { status: 400 });
    }

    const { error } = await supabase.from('projects').delete().in('id', ids);
    if (error) return NextResponse.json({ error: 'Failed to delete projects' }, { status: 500 });

    return NextResponse.json({ message: `${ids.length} projects deleted successfully` });
  } catch (error) {
    console.error('DELETE /api/content/projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
