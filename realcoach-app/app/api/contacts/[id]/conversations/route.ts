import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordInteraction } from '@/lib/services/contacts';
import { detectConversationPatterns } from '@/lib/ai/pattern-detection';
import { determinePipelineStage } from '@/lib/ai/pipeline-engine';
import { recordPipelineStageChange } from '@/lib/services/pipeline';
import type { InputType, PipelineStage, Contact } from '@/lib/database.types';

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
    const body = await request.json();

    if (!body.input_type || !body.content) {
      return NextResponse.json(
        { error: 'input_type and content are required' },
        { status: 400 }
      );
    }

    const { data: contact } = await supabase
      .from('contacts')
      .select('id, pipeline_stage, motivation_level, timeframe, property_preferences, days_since_contact, last_interaction_date')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single();

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      );
    }

    const typedContact = contact as Pick<Contact, 'id' | 'pipeline_stage' | 'motivation_level' | 'timeframe' | 'property_preferences' | 'days_since_contact' | 'last_interaction_date'>;

    const hasPropertyPreferences = (preferences: Record<string, unknown> | null) => {
      if (!preferences) return false;
      return Object.values(preferences).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return value > 0;
        return Boolean(value);
      });
    };

    const patterns = detectConversationPatterns(body.content as string);
    const pipelineResult = determinePipelineStage({
      currentStage: typedContact.pipeline_stage,
      hasTimeframe: Boolean(typedContact.timeframe),
      hasSpecificProperty:
        patterns.specificProperty ||
        hasPropertyPreferences(typedContact.property_preferences as Record<string, unknown> | null),
      motivation: (typedContact.motivation_level || 'Medium') as 'High' | 'Medium' | 'Low',
      hasHomeShowings: patterns.showings,
      daysSinceLastActivity: typedContact.days_since_contact || 0,
      offerAccepted: patterns.offerAccepted,
      closingCompleted: patterns.closing,
    });

    const conversationData = {
      contact_id: contactId,
      input_type: body.input_type,
      content: body.content,
      raw_url: body.raw_url || null,
      ai_detected_stage: pipelineResult.newStage,
      ai_stage_confidence: pipelineResult.confidence,
      ai_detected_motivation: body.ai_detected_motivation || null,
      ai_motivation_confidence: body.ai_motivation_confidence || 0,
      ai_detected_timeframe: body.ai_detected_timeframe || null,
      ai_timeframe_confidence: body.ai_timeframe_confidence || 0,
      ai_extracted_entities: body.ai_extracted_entities || {},
      ai_suggested_next_action: body.ai_suggested_next_action || null,
      ai_suggested_reply: body.ai_suggested_reply || null,
      triggers_buying_intent: patterns.buyingIntent,
      triggers_selling_intent: patterns.sellingIntent,
      triggers_urgency: patterns.urgency,
      triggers_specific_property: patterns.specificProperty,
      triggers_preapproval: patterns.preapproval,
      triggers_showings: patterns.showings,
      triggers_offer_accepted: patterns.offerAccepted,
      triggers_closing: patterns.closing,
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    if (pipelineResult.newStage !== typedContact.pipeline_stage) {
      try {
        const { error: stageError } = await supabase
          .from('contacts')
          .update({ pipeline_stage: pipelineResult.newStage } as never)
          .eq('id', contactId);

        if (stageError) {
          throw stageError;
        }

        await recordPipelineStageChange({
          contactId: contactId,
          previousStage: typedContact.pipeline_stage,
          newStage: pipelineResult.newStage,
          changeReason: pipelineResult.rationale,
          changeSource: 'ai',
          confidence: pipelineResult.confidence,
          conversationId: (data as { id: string }).id,
        });
      } catch (err) {
        console.error('Failed to update pipeline stage:', err);
      }
    }

    const touchTypeMap: Record<string, string> = {
      'text': 'Text',
      'voice': 'Voice Note',
      'screenshot': 'Screenshot',
    };

    try {
      const touchType = touchTypeMap[body.input_type as string];
      if (touchType) {
        await recordInteraction(contactId, touchType as never);
      }
    } catch (err) {
      console.error('Failed to update contact interaction:', err);
    }

    return NextResponse.json({
      success: true,
      conversation: data,
      pipelineUpdate: pipelineResult.newStage !== typedContact.pipeline_stage ? {
        previousStage: typedContact.pipeline_stage,
        newStage: pipelineResult.newStage,
        confidence: pipelineResult.confidence,
        rationale: pipelineResult.rationale,
      } : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
