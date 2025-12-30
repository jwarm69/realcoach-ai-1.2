import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/conversations/[id] - Get a single conversation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversation with contact ownership check
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        contacts!inner(user_id)
      `)
      .eq('id', id)
      .eq('contacts.user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove nested contacts object by copying properties
    const conversation = data as Record<string, unknown>;
    const { contacts: _, ...cleanConversation } = conversation;

    return NextResponse.json(cleanConversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Update a conversation
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Verify conversation belongs to user's contact
    const { data: existing } = await supabase
      .from('conversations')
      .select(`
        id,
        contacts!inner(user_id)
      `)
      .eq('id', id)
      .eq('contacts.user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Only allow updating specific fields
    if (body.user_confirmed_stage !== undefined) {
      updateData.user_confirmed_stage = body.user_confirmed_stage;
    }
    if (body.user_edited_stage !== undefined) {
      updateData.user_edited_stage = body.user_edited_stage;
    }
    if (body.user_edited_next_action !== undefined) {
      updateData.user_edited_next_action = body.user_edited_next_action;
    }
    if (body.action_completed !== undefined) {
      updateData.action_completed = body.action_completed;
    }

    // Update conversation
    const { data, error } = await supabase
      .from('conversations')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete a conversation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify conversation belongs to user's contact
    const { data: existing } = await supabase
      .from('conversations')
      .select(`
        id,
        contacts!inner(user_id)
      `)
      .eq('id', id)
      .eq('contacts.user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Delete conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
