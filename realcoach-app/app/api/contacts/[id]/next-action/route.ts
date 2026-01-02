import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateNextAction, getUrgencyLevel, getUrgencyColor, getActionIcon } from '@/lib/engines/action-recommendation';
import { calculatePriorityScore } from '@/lib/engines/priority-calculator';
import { checkSevenDayRule } from '@/lib/engines/seven-day-monitor';
import type { Contact } from '@/lib/database.types';

/**
 * GET /api/contacts/[id]/next-action
 *
 * Returns the next recommended action for a specific contact:
 * - Action type (Call/Text/Email/Meeting/Send Listing/Follow-up)
 * - Urgency level (1-10)
 * - Suggested script
 * - "Why it matters" behavioral rationale
 * - Behavioral factors
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: contactId } = await params;

    // Get contact and verify ownership
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      );
    }

    // Generate next action
    const nextAction = generateNextAction(contact as Contact);

    // Calculate priority score
    const priorityScore = calculatePriorityScore(contact as Contact);

    // Check 7-day rule
    const sevenDayCheck = checkSevenDayRule(contact as Contact);

    // Build response
    const response = {
      contactId: (contact as Contact).id,
      contactName: (contact as Contact).name,
      pipelineStage: (contact as Contact).pipeline_stage,
      priorityScore,
      nextAction: {
        type: nextAction.actionType,
        icon: getActionIcon(nextAction.actionType),
        urgency: nextAction.urgency,
        urgencyLevel: getUrgencyLevel(nextAction.urgency),
        urgencyColor: getUrgencyColor(nextAction.urgency),
        script: nextAction.script,
        rationale: nextAction.rationale,
        estimatedTimeframe: getEstimatedTimeframe(nextAction.actionType),
      },
      behavioralFactors: nextAction.behavioralFactors,
      sevenDayRule: {
        isViolated: sevenDayCheck.shouldFlag,
        daysSinceContact: sevenDayCheck.daysSinceContact,
        reason: sevenDayCheck.reason,
      },
      context: {
        motivationLevel: (contact as Contact).motivation_level,
        timeframe: (contact as Contact).timeframe,
        daysSinceContact: (contact as Contact).days_since_contact,
        lastInteractionDate: (contact as Contact).last_interaction_date,
        preapprovalStatus: (contact as Contact).preapproval_status,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Next action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get estimated time to complete an action
 */
function getEstimatedTimeframe(actionType: string): string {
  const timeframes: Record<string, string> = {
    'Call': '5-10 minutes',
    'Text': '1-2 minutes',
    'Email': '5-10 minutes',
    'Meeting': '30-60 minutes',
    'Send Listing': '5 minutes',
    'Follow-up': '5-10 minutes',
  };

  return timeframes[actionType] || '5-10 minutes';
}
