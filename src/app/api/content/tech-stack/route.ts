/**
 * Tech Stack API Routes
 * 
 * Handles CRUD operations for tech stack items:
 * - GET: Fetch all tech stack items
 * - POST: Create a new tech stack item
 * - PUT: Update a tech stack item
 * - DELETE: Delete a tech stack item
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { techItemSchema } from '@/lib/validation';
import { z } from 'zod';

/**
 * GET /api/content/tech-stack
 * Fetch all tech stack items sorted by display order
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching tech stack:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tech stack items' },
        { status: 500 }
      );
    }

    // Map snake_case to camelCase
    const transformedData = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon_url,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json({
      data: transformedData,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/content/tech-stack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content/tech-stack
 * Create a new tech stack item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = techItemSchema.parse(body);

    // Get the highest display order
    const { data: existingItems } = await supabase
      .from('tech_stack')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextDisplayOrder = (existingItems?.[0]?.display_order ?? -1) + 1;

    // Insert new tech stack item
    const { data, error } = await supabase
      .from('tech_stack')
      .insert({
        name: validatedData.name,
        icon_url: validatedData.icon,
        display_order: nextDisplayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tech stack item:', error);
      return NextResponse.json(
        { error: 'Failed to create tech stack item' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          id: data.id,
          name: data.name,
          icon: data.icon_url,
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

    console.error('Unexpected error in POST /api/content/tech-stack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/content/tech-stack
 * Update tech stack items (supports batch updates for reordering)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle batch update for reordering
    if (Array.isArray(body)) {
      const updates = body.map((item) => ({
        id: item.id,
        display_order: item.displayOrder,
      }));

      // Update all items
      for (const update of updates) {
        const { error } = await supabase
          .from('tech_stack')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) {
          console.error('Error updating tech stack item:', error);
          return NextResponse.json(
            { error: 'Failed to update tech stack items' },
            { status: 500 }
          );
        }
      }

      // Fetch updated items
      const { data } = await supabase
        .from('tech_stack')
        .select('*')
        .order('display_order', { ascending: true });

      return NextResponse.json({
        data: data || [],
      });
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
    const validatedData = techItemSchema.parse(updateData);

    const { data, error } = await supabase
      .from('tech_stack')
      .update({
        name: validatedData.name,
        icon_url: validatedData.icon,
        display_order: validatedData.displayOrder,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tech stack item:', error);
      return NextResponse.json(
        { error: 'Failed to update tech stack item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: data.id,
        name: data.name,
        icon: data.icon_url,
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

    console.error('Unexpected error in PUT /api/content/tech-stack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content/tech-stack?id=<id>
 * Delete a tech stack item
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tech_stack')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tech stack item:', error);
      return NextResponse.json(
        { error: 'Failed to delete tech stack item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Tech stack item deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/content/tech-stack:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
