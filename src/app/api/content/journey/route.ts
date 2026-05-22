/**
 * Journey Items API Routes
 * 
 * Handles CRUD operations for journey/timeline items:
 * - GET: Fetch all journey items
 * - POST: Create a new journey item
 * - PUT: Update a journey item
 * - DELETE: Delete a journey item
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { journeyItemSchema } from '@/lib/validation';
import { z } from 'zod';

/**
 * GET /api/content/journey
 * Fetch all journey items sorted by display order
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('journey_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching journey items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch journey items' },
        { status: 500 }
      );
    }

    // Map snake_case to camelCase
    const transformedData = (data || []).map(item => ({
      id: item.id,
      year: item.year,
      title: item.title,
      description: item.description,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json({
      data: transformedData,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/content/journey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content/journey
 * Create a new journey item
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = journeyItemSchema.parse(body);

    // Get the highest display order
    const { data: existingItems } = await supabase
      .from('journey_items')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextDisplayOrder = (existingItems?.[0]?.display_order ?? -1) + 1;

    // Insert new journey item
    const { data, error } = await supabase
      .from('journey_items')
      .insert({
        year: validatedData.year,
        title: validatedData.title,
        description: validatedData.description,
        display_order: nextDisplayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journey item:', error);
      return NextResponse.json(
        { error: 'Failed to create journey item' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          id: data.id,
          year: data.year,
          title: data.title,
          description: data.description,
          displayOrder: data.display_order,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/content/journey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/content/journey
 * Update journey items (supports batch updates for reordering)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle batch update for reordering
    if (Array.isArray(body)) {
      for (const update of body) {
        const { error } = await supabase
          .from('journey_items')
          .update({ display_order: update.displayOrder })
          .eq('id', update.id);

        if (error) {
          console.error('Error updating journey item order:', error);
          return NextResponse.json(
            { error: 'Failed to update item order' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ message: 'Order updated successfully' });
    }

    // Handle single item update
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = journeyItemSchema.parse(updateData);

    const { data, error } = await supabase
      .from('journey_items')
      .update({
        year: validatedData.year,
        title: validatedData.title,
        description: validatedData.description,
        display_order: validatedData.displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating journey item:', error);
      return NextResponse.json(
        { error: 'Failed to update journey item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: data.id,
        year: data.year,
        title: data.title,
        description: data.description,
        displayOrder: data.display_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error in PUT /api/content/journey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content/journey?id=<id>
 * Delete a journey item
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('journey_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting journey item:', error);
      return NextResponse.json(
        { error: 'Failed to delete journey item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Journey item deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/content/journey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
