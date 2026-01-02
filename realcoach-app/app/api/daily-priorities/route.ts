import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePriorityScore, getPriorityLevel, getPriorityColor } from '@/lib/engines/priority-calculator';
import { generateNextAction, getUrgencyLevel } from '@/lib/engines/action-recommendation';
import { checkSevenDayRule } from '@/lib/engines/seven-day-monitor';
import type { Contact } from '@/lib/database.types';

/**
 * GET /api/daily-priorities
 *
 * Returns today's top 5-10 prioritized contacts with:
 * - Contact info (name, stage, motivation)
 * - Priority score (0-100)
 * - Why this matters (behavioral rationale)
 * - Suggested action with script
 * - Urgency indicator
 */
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const minPriority = parseInt(searchParams.get('minPriority') || '0');

    // Get all contacts for this user
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .neq('pipeline_stage', 'Closed'); // Exclude closed contacts

    if (contactsError) {
      return NextResponse.json({ error: contactsError.message }, { status: 500 });
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({
        priorities: [],
        total: 0,
        date: new Date().toISOString().split('T')[0],
        message: 'No contacts found. Add some contacts to see your daily priorities!',
      });
    }

    // Calculate priority scores and generate actions for each contact
    const prioritizedContacts = (contacts as Contact[]).map((contact) => {
      const priorityScore = calculatePriorityScore(contact);
      const nextAction = generateNextAction(contact);
      const sevenDayCheck = checkSevenDayRule(contact);

      // Build behavioral rationale
      const factors = [];
      if (contact.motivation_level === 'High') factors.push('High Motivation');
      if (contact.days_since_contact <= 2) factors.push('Recent Contact');
      if (contact.days_since_contact >= 7) factors.push(`${contact.days_since_contact} Days Since Contact`);
      if (contact.timeframe === 'Immediate') factors.push('Immediate Timeframe');
      if (sevenDayCheck.shouldFlag) factors.push('7-Day Rule Violation');
      if (contact.pipeline_stage === 'Active Opportunity') factors.push('Active Showing Phase');
      if (contact.pipeline_stage === 'New Opportunity' && !contact.preapproval_status) {
        factors.push('Missing Pre-approval');
      }

      return {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        pipelineStage: contact.pipeline_stage,
        motivationLevel: contact.motivation_level,
        timeframe: contact.timeframe,
        daysSinceContact: contact.days_since_contact,
        lastInteractionDate: contact.last_interaction_date,
        priorityScore,
        priorityLevel: getPriorityLevel(priorityScore),
        priorityColor: getPriorityColor(priorityScore),
        nextAction: {
          type: nextAction.actionType,
          urgency: nextAction.urgency,
          urgencyLevel: getUrgencyLevel(nextAction.urgency),
          script: nextAction.script,
          rationale: nextAction.rationale,
        },
        behavioralFactors: factors,
        sevenDayFlag: sevenDayCheck.shouldFlag,
        sevenDayReason: sevenDayCheck.reason,
      };
    });

    // Filter by minimum priority if specified
    const filtered = prioritizedContacts.filter(
      (contact) => contact.priorityScore >= minPriority
    );

    // Sort by priority score (descending)
    filtered.sort((a, b) => b.priorityScore - a.priorityScore);

    // Take top N
    const topPriorities = filtered.slice(0, limit);

    // Calculate summary stats
    const summary = {
      totalContacts: contacts.length,
      prioritizedContacts: filtered.length,
      criticalCount: filtered.filter((c) => c.priorityLevel === 'Critical').length,
      highCount: filtered.filter((c) => c.priorityLevel === 'High').length,
      sevenDayViolations: filtered.filter((c) => c.sevenDayFlag).length,
      avgPriorityScore:
        filtered.length > 0
          ? Math.round(
              filtered.reduce((sum, c) => sum + c.priorityScore, 0) / filtered.length
            )
          : 0,
    };

    return NextResponse.json({
      priorities: topPriorities,
      summary,
      date: new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Daily priorities error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
