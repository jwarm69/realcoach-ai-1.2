import { createClient } from '@/lib/supabase/server';
import type {
  Conversation,
  ConversationInsert,
  ConversationUpdate,
  InputType,
} from '@/lib/database.types';

export interface ConversationFilters {
  contactId?: string;
  inputType?: InputType;
  limit?: number;
  offset?: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

// Get conversations for a contact
export async function getConversations(
  filters: ConversationFilters = {}
): Promise<ConversationsResponse> {
  const supabase = await createClient();
  const { contactId, inputType, limit = 50, offset = 0 } = filters;

  let query = supabase
    .from('conversations')
    .select('*', { count: 'exact' });

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
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  return {
    conversations: data || [],
    total: count || 0,
  };
}

// Get a single conversation by ID
export async function getConversation(id: string): Promise<Conversation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }

  return data as Conversation;
}

// Create a new conversation
export async function createConversation(
  conversation: ConversationInsert
): Promise<Conversation> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .insert(conversation as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return data as Conversation;
}

// Update an existing conversation
export async function updateConversation(
  id: string,
  updates: ConversationUpdate
): Promise<Conversation> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update conversation: ${error.message}`);
  }

  return data as Conversation;
}

// Delete a conversation
export async function deleteConversation(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}

// Get conversation count for a contact
export async function getConversationCount(contactId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('contact_id', contactId);

  if (error) {
    throw new Error(`Failed to count conversations: ${error.message}`);
  }

  return count || 0;
}

// Get recent conversations across all contacts (for dashboard/activity feed)
export async function getRecentConversations(limit: number = 10): Promise<Conversation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent conversations: ${error.message}`);
  }

  return (data || []) as Conversation[];
}
