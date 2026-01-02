import { createClient } from '@/lib/supabase/server';
import { getSevenDayViolations } from '@/lib/engines/seven-day-monitor';
import { generateNextAction } from '@/lib/engines/action-recommendation';
import type { Contact, PipelineStage } from '@/lib/database.types';

export interface DashboardStats {
  totalContacts: number;
  contactsByStage: Record<PipelineStage, number>;
  activeOpportunities: number;
  sevenDayViolations: number;
  todayActions: number;
  completedToday: number;
  streak: number;
  consistencyScore: number;
}

export interface PriorityContact extends Contact {
  priorityReason: string;
  nextAction?: {
    type: string;
    script: string;
  };
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get all contacts for user
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id);

  const contactsList = (contacts || []) as Contact[];

  // Calculate totals
  const totalContacts = contactsList.length;

  // Group by pipeline stage
  const contactsByStage: Record<PipelineStage, number> = {
    'Lead': 0,
    'New Opportunity': 0,
    'Active Opportunity': 0,
    'Under Contract': 0,
    'Closed': 0,
  };

  for (const contact of contactsList) {
    contactsByStage[contact.pipeline_stage]++;
  }

  const activeOpportunities = contactsByStage['Active Opportunity'];

  // Calculate 7-day rule violations
  const violations = getSevenDayViolations(contactsList);
  const sevenDayViolations = violations.length;

  // Get today's daily actions
  const today = new Date().toISOString().split('T')[0];
  
  const { count: todayActionsCount } = await supabase
    .from('daily_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action_date', today);

  const { count: completedTodayCount } = await supabase
    .from('daily_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action_date', today)
    .eq('completed', true);

  // Get user stats for streak/consistency
  const { data: userStatsData } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const userStats = userStatsData as { streak_count?: number; consistency_score?: number } | null;

  return {
    totalContacts,
    contactsByStage,
    activeOpportunities,
    sevenDayViolations,
    todayActions: todayActionsCount || 0,
    completedToday: completedTodayCount || 0,
    streak: userStats?.streak_count || 0,
    consistencyScore: userStats?.consistency_score || 0,
  };
}

/**
 * Get top priority contacts for daily actions
 */
export async function getTopPriorityContacts(limit: number = 10): Promise<PriorityContact[]> {
  const supabase = await createClient();
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get contacts ordered by priority score
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .neq('pipeline_stage', 'Closed')
    .order('priority_score', { ascending: false })
    .limit(limit);

  const contactsList = (contacts || []) as Contact[];

  // Add priority reasons and next actions
  return contactsList.map((contact) => {
    let priorityReason = '';

    if (contact.seven_day_rule_flag) {
      priorityReason = `7-day rule: ${contact.days_since_contact} days without contact`;
    } else if (contact.motivation_level === 'High' && contact.timeframe === 'Immediate') {
      priorityReason = 'High motivation + immediate timeframe';
    } else if (contact.pipeline_stage === 'Active Opportunity') {
      priorityReason = 'Active opportunity - maintain engagement';
    } else if (contact.pipeline_stage === 'New Opportunity') {
      priorityReason = 'New opportunity - qualify and advance';
    } else if (contact.days_since_contact >= 3) {
      priorityReason = `${contact.days_since_contact} days since last contact`;
    } else {
      priorityReason = 'General follow-up';
    }

    const nextAction = generateNextAction(contact);

    return {
      ...contact,
      priorityReason,
      nextAction: {
        type: nextAction.actionType,
        script: nextAction.script,
      },
    };
  });
}

/**
 * Get contacts by stage with limit
 */
export async function getContactsByStage(
  stage: PipelineStage,
  limit?: number
): Promise<Contact[]> {
  const supabase = await createClient();
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('pipeline_stage', stage)
    .order('priority_score', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;

  return (data || []) as Contact[];
}

/**
 * Get 7-day rule violation contacts
 */
export async function getSevenDayRuleContacts(): Promise<Contact[]> {
  const supabase = await createClient();
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('seven_day_rule_flag', true)
    .eq('pipeline_stage', 'Active Opportunity')
    .order('days_since_contact', { ascending: false });

  return (contacts || []) as Contact[];
}

/**
 * Get activity summary for date range
 */
export async function getActivitySummary(
  startDate: string,
  endDate: string
): Promise<{
  totalInteractions: number;
  byType: Record<string, number>;
  byDay: Record<string, number>;
}> {
  const supabase = await createClient();
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get conversations in date range
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      contacts!inner(user_id)
    `)
    .eq('contacts.user_id', user.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const convList = (conversations || []) as Array<{ input_type: string; created_at: string }>;

  // Calculate totals
  const totalInteractions = convList.length;

  // Group by input type
  const byType: Record<string, number> = {};
  for (const conv of convList) {
    byType[conv.input_type] = (byType[conv.input_type] || 0) + 1;
  }

  // Group by day
  const byDay: Record<string, number> = {};
  for (const conv of convList) {
    const day = new Date(conv.created_at).toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  }

  return {
    totalInteractions,
    byType,
    byDay,
  };
}
