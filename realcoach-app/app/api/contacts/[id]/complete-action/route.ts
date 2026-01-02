import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recalculatePriorityScore } from '@/lib/services/contacts';
import type { Contact } from '@/lib/database.types';

interface CompleteActionRequest {
  actionType: string;
  notes?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const contactId = params.id;
    const body = await request.json() as CompleteActionRequest;

    if (!body.actionType) {
      return NextResponse.json(
        { error: 'actionType is required' },
        { status: 400 }
      );
    }

    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single();

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const typedContact = contact as Contact;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { error: actionError } = await supabase
      .from('daily_actions')
      .insert({
        user_id: user.id,
        contact_id: contactId,
        action_date: today,
        action_type: body.actionType,
        priority_level: typedContact.priority_score,
        reason: 'Completed action from dashboard',
        suggested_script: null,
        urgency_factor: null,
        behavioral_rationale: null,
        completed: true,
        completed_at: now,
      } as never);

    if (actionError) {
      console.error('Error creating daily action:', actionError);
    }

    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        last_interaction_date: today,
        last_touch_type: body.actionType,
        days_since_contact: 0,
        seven_day_rule_flag: false,
        inactive_days: 0,
        updated_at: now,
      } as never)
      .eq('id', contactId);

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    try {
      await recalculatePriorityScore(contactId);
    } catch (err) {
      console.error('Failed to recalculate priority:', err);
    }

    const { error: conversationError } = await supabase
      .from('conversations')
      .insert({
        contact_id: contactId,
        input_type: 'text',
        content: `Action completed: ${body.actionType}${body.notes ? ` - ${body.notes}` : ''}`,
        ai_detected_stage: typedContact.pipeline_stage,
        ai_stage_confidence: 100,
        ai_detected_motivation: typedContact.motivation_level,
        ai_motivation_confidence: typedContact.motivation_level ? 100 : 0,
        ai_detected_timeframe: typedContact.timeframe,
        ai_timeframe_confidence: typedContact.timeframe ? 100 : 0,
        ai_extracted_entities: {},
        ai_suggested_next_action: null,
        ai_suggested_reply: null,
        triggers_buying_intent: false,
        triggers_selling_intent: false,
        triggers_urgency: false,
        triggers_specific_property: false,
        triggers_preapproval: false,
        triggers_showings: false,
        triggers_offer_accepted: false,
        triggers_closing: false,
        user_confirmed_stage: true,
        user_edited_stage: null,
        user_edited_next_action: null,
        action_completed: true,
      } as never);

    if (conversationError) {
      console.error('Error creating conversation log:', conversationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Action completed successfully',
      contactId,
      actionType: body.actionType,
      completedAt: now,
    });
  } catch (error) {
    console.error('Error completing action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
