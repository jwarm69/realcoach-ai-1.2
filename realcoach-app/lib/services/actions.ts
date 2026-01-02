import { createClient } from '@/lib/supabase/server';
import { calculatePriorityScore } from '@/lib/engines/priority-calculator';
import { generateNextAction } from '@/lib/engines/action-recommendation';
import type { Contact, DailyAction } from '@/lib/database.types';

export interface GeneratedAction {
  user_id: string;
  contact_id: string;
  action_date: string;
  action_type: string;
  priority_level: number;
  reason: string;
  suggested_script: string;
  urgency_factor: string | null;
  behavioral_rationale: string;
}

export interface DailyActionsResult {
  success: boolean;
  actionsCount: number;
  actions: GeneratedAction[];
  errors: string[];
}

const MAX_DAILY_ACTIONS = 10;
const MIN_PRIORITY_SCORE = 30;

export async function generateDailyActionsForUser(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<DailyActionsResult> {
  const supabase = await createClient();
  const errors: string[] = [];

  try {
    const existingActions = await checkExistingActions(userId, date);
    if (existingActions > 0) {
      return {
        success: true,
        actionsCount: existingActions,
        actions: [],
        errors: [`Actions already exist for ${date}`]
      };
    }

    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .neq('pipeline_stage', 'Closed');

    if (contactsError) {
      throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
    }

    if (!contacts || contacts.length === 0) {
      return {
        success: true,
        actionsCount: 0,
        actions: [],
        errors: []
      };
    }

    const scoredContacts = contacts.map(contact => ({
      ...(contact as any),
      priorityScore: calculatePriorityScore(contact)
    }));

    const qualifiedContacts = scoredContacts.filter(
      c => c.priorityScore >= MIN_PRIORITY_SCORE
    );

    qualifiedContacts.sort((a, b) => b.priorityScore - a.priorityScore);

    const topContacts = qualifiedContacts.slice(0, MAX_DAILY_ACTIONS);

    const actions: GeneratedAction[] = [];

    for (const contact of topContacts) {
      try {
        const nextAction = generateNextAction(contact);

        const action: GeneratedAction = {
          user_id: userId,
          contact_id: contact.id,
          action_date: date,
          action_type: nextAction.actionType,
          priority_level: nextAction.urgency,
          reason: nextAction.rationale,
          suggested_script: nextAction.script,
          urgency_factor: nextAction.behavioralFactors[0] || null,
          behavioral_rationale: nextAction.behavioralFactors.join(', ')
        };

        actions.push(action);
      } catch (actionError) {
        errors.push(`Failed to generate action for ${contact.id}: ${actionError instanceof Error ? actionError.message : 'Unknown error'}`);
      }
    }

    if (actions.length > 0) {
      await (supabase as any).from('daily_actions').insert(actions);
    }

    return {
      success: true,
      actionsCount: actions.length,
      actions,
      errors
    };
  } catch (error) {
    return {
      success: false,
      actionsCount: 0,
      actions: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

export async function checkExistingActions(
  userId: string,
  date: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('daily_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_date', date);

  if (error) {
    console.error('Error checking existing actions:', error);
    return 0;
  }

  return count || 0;
}

export async function getDailyActionsForUser(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<(DailyAction & { contact: Contact })[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('daily_actions')
    .select(`
      *,
      contact:contacts(*)
    `)
    .eq('user_id', userId)
    .eq('action_date', date)
    .order('priority_level', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch daily actions: ${error.message}`);
  }

  return (data || []) as (DailyAction & { contact: Contact })[];
}

export async function markActionCompleted(actionId: string): Promise<void> {
  const supabase = await createClient();

  await (supabase as any)
    .from('daily_actions')
    .update({
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', actionId);
}

export async function getActionStats(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<{ total: number; completed: number; remaining: number }> {
  const supabase = await createClient();

  const { data: actions, error } = await supabase
    .from('daily_actions')
    .select('completed')
    .eq('user_id', userId)
    .eq('action_date', date);

  if (error) {
    throw new Error(`Failed to fetch action stats: ${error.message}`);
  }

  const total = actions?.length || 0;
  const completed = actions?.filter((a: any) => a.completed).length || 0;
  const remaining = total - completed;

  return { total, completed, remaining };
}
