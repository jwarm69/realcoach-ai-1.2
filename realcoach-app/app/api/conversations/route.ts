import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordInteraction } from '@/lib/services/contacts';
import type { InputType } from '@/lib/database.types';

// GET /api/conversations - List conversations with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const contactId = searchParams.get('contactId') || undefined;
    const inputType = searchParams.get('inputType') as InputType | undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query - only get conversations for user's contacts
    let query = supabase
      .from('conversations')
      .select(`
        *,
        contacts!inner(user_id)
      `, { count: 'exact' })
      .eq('contacts.user_id', user.id);

    // Apply filters
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (inputType) {
      query = query.eq('input_type', inputType);
    }

    // Sort by most recent first
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove the nested contacts object from results
    const conversations = data?.map((item) => {
      const { contacts: _, ...conv } = item as Record<string, unknown>;
      return conv;
    }) || [];

    return NextResponse.json({
      conversations,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.contact_id || !body.input_type || !body.content) {
      return NextResponse.json(
        { error: 'contact_id, input_type, and content are required' },
        { status: 400 }
      );
    }

    // Verify contact belongs to user
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', body.contact_id)
      .eq('user_id', user.id)
      .single();

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare conversation data
    const conversationData = {
      contact_id: body.contact_id,
      input_type: body.input_type,
      content: body.content,
      raw_url: body.raw_url || null,
      ai_detected_stage: body.ai_detected_stage || null,
      ai_stage_confidence: body.ai_stage_confidence || 0,
      ai_detected_motivation: body.ai_detected_motivation || null,
      ai_motivation_confidence: body.ai_motivation_confidence || 0,
      ai_detected_timeframe: body.ai_detected_timeframe || null,
      ai_timeframe_confidence: body.ai_timeframe_confidence || 0,
      ai_extracted_entities: body.ai_extracted_entities || {},
      ai_suggested_next_action: body.ai_suggested_next_action || null,
      ai_suggested_reply: body.ai_suggested_reply || null,
      triggers_buying_intent: body.triggers_buying_intent || false,
      triggers_selling_intent: body.triggers_selling_intent || false,
      triggers_urgency: body.triggers_urgency || false,
      triggers_specific_property: body.triggers_specific_property || false,
      triggers_preapproval: body.triggers_preapproval || false,
      triggers_showings: body.triggers_showings || false,
      triggers_offer_accepted: body.triggers_offer_accepted || false,
      triggers_closing: body.triggers_closing || false,
    };

    // Insert conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update contact's last interaction date
    const touchTypeMap: Record<string, string> = {
      'text': 'Text',
      'voice': 'Voice Note',
      'screenshot': 'Screenshot',
    };

    try {
      const touchType = touchTypeMap[body.input_type as string];
      if (touchType) {
        await recordInteraction(body.contact_id, touchType as never);
      }
    } catch (err) {
      console.error('Failed to update contact interaction:', err);
      // Don't fail the request if this fails
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
