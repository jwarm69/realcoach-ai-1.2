import { createClient } from '@/lib/supabase/server';
import type {
  Contact,
  ContactInsert,
  ContactUpdate,
  PipelineStage,
} from '@/lib/database.types';

export interface ContactFilters {
  search?: string;
  pipelineStage?: PipelineStage | 'all';
  sortBy?: 'name' | 'priority_score' | 'last_interaction_date' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  hasMore: boolean;
}

// Get all contacts with filtering and pagination
export async function getContacts(filters: ContactFilters = {}): Promise<ContactsResponse> {
  const supabase = await createClient();
  const {
    search,
    pipelineStage = 'all',
    sortBy = 'priority_score',
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = filters;

  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' });

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  // Apply pipeline stage filter
  if (pipelineStage && pipelineStage !== 'all') {
    query = query.eq('pipeline_stage', pipelineStage);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return {
    contacts: data || [],
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

// Get a single contact by ID
export async function getContact(id: string): Promise<Contact | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }

  return data;
}

// Create a new contact
export async function createContact(contact: ContactInsert): Promise<Contact> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contacts')
    .insert(contact as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`);
  }

  return data as Contact;
}

// Update an existing contact
export async function updateContact(
  id: string,
  updates: ContactUpdate
): Promise<Contact> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contacts')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }

  return data as Contact;
}

// Delete a contact
export async function deleteContact(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
}

// Get contacts by pipeline stage (for dashboard)
export async function getContactsByStage(): Promise<Record<PipelineStage, number>> {
  const supabase = await createClient();

  const stages: PipelineStage[] = [
    'Lead',
    'New Opportunity',
    'Active Opportunity',
    'Under Contract',
    'Closed',
  ];

  const counts: Record<PipelineStage, number> = {
    'Lead': 0,
    'New Opportunity': 0,
    'Active Opportunity': 0,
    'Under Contract': 0,
    'Closed': 0,
  };

  for (const stage of stages) {
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('pipeline_stage', stage);

    if (!error && count !== null) {
      counts[stage] = count;
    }
  }

  return counts;
}

// Get top priority contacts for daily actions
export async function getTopPriorityContacts(limit: number = 10): Promise<Contact[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .neq('pipeline_stage', 'Closed')
    .order('priority_score', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch priority contacts: ${error.message}`);
  }

  return data || [];
}

// Get contacts with 7-day rule violations
export async function getSevenDayRuleContacts(): Promise<Contact[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('seven_day_rule_flag', true)
    .neq('pipeline_stage', 'Closed')
    .order('days_since_contact', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch 7-day rule contacts: ${error.message}`);
  }

  return data || [];
}

// Record a contact interaction (updates last_interaction_date)
export async function recordInteraction(
  id: string,
  touchType: Contact['last_touch_type']
): Promise<Contact> {
  const supabase = await createClient();

  const updateData = {
    last_interaction_date: new Date().toISOString().split('T')[0],
    last_touch_type: touchType,
    last_activity_date: new Date().toISOString().split('T')[0],
  };

  const { data, error } = await supabase
    .from('contacts')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record interaction: ${error.message}`);
  }

  return data as Contact;
}
