import { createClient } from '@/lib/supabase/server';
import type { PipelineStage } from '@/lib/database.types';

export type SalesConversationType = 'appointment' | 'listing' | 'closing' | 'gci';
export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface SalesConversation {
  id: string;
  user_id: string;
  contact_id: string | null;
  conversation_type: SalesConversationType;
  amount: number | null;
  conversation_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesMetrics {
  appointments: number;
  listings: number;
  closings: number;
  gci: number;
  period: TimePeriod;
  startDate: string;
  endDate: string;
  previousPeriod?: {
    appointments: number;
    listings: number;
    closings: number;
    gci: number;
  };
}

export interface ConversionFunnel {
  stage: PipelineStage;
  count: number;
  percentage: number;
  dropOffFromPrevious?: number;
}

export interface LeadSourceData {
  source: string;
  count: number;
  percentage: number;
}

function getDateRange(period: TimePeriod): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate = endDate;

  switch (period) {
    case 'today':
      startDate = endDate;
      break;
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'quarter':
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(now.getMonth() - 3);
      startDate = quarterAgo.toISOString().split('T')[0];
      break;
    case 'year':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      break;
    case 'all':
      startDate = '2020-01-01';
      break;
  }

  return { startDate, endDate };
}

function getPreviousDateRange(period: TimePeriod): { startDate: string; endDate: string } {
  const current = getDateRange(period);
  const start = new Date(current.startDate);
  const end = new Date(current.endDate);
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - diffDays);

  return {
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0],
  };
}

export async function getSalesMetrics(period: TimePeriod = 'month'): Promise<SalesMetrics> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getDateRange(period);

  const { data: conversations } = await supabase
    .from('sales_conversations')
    .select('*')
    .eq('user_id', user.id)
    .gte('conversation_date', startDate)
    .lte('conversation_date', endDate);

  const metrics: SalesMetrics = {
    appointments: 0,
    listings: 0,
    closings: 0,
    gci: 0,
    period,
    startDate,
    endDate,
  };

  (conversations || []).forEach((conv: any) => {
    switch (conv.conversation_type) {
      case 'appointment':
        metrics.appointments++;
        break;
      case 'listing':
        metrics.listings++;
        if (conv.amount) metrics.gci += parseFloat(conv.amount);
        break;
      case 'closing':
        metrics.closings++;
        if (conv.amount) metrics.gci += parseFloat(conv.amount);
        break;
      case 'gci':
        if (conv.amount) metrics.gci += parseFloat(conv.amount);
        break;
    }
  });

  if (period !== 'all' && period !== 'today') {
    const prevRange = getPreviousDateRange(period);
    const { data: prevConversations } = await supabase
      .from('sales_conversations')
      .select('*')
      .eq('user_id', user.id)
      .gte('conversation_date', prevRange.startDate)
      .lte('conversation_date', prevRange.endDate);

    const previousPeriod = {
      appointments: 0,
      listings: 0,
      closings: 0,
      gci: 0,
    };

    (prevConversations || []).forEach((conv: any) => {
      switch (conv.conversation_type) {
        case 'appointment':
          previousPeriod.appointments++;
          break;
        case 'listing':
          previousPeriod.listings++;
          break;
        case 'closing':
          previousPeriod.closings++;
          break;
        case 'gci':
          if (conv.amount) previousPeriod.gci += parseFloat(conv.amount);
          break;
      }
    });

    metrics.previousPeriod = previousPeriod;
  }

  return metrics;
}

export async function getConversionFunnel(): Promise<ConversionFunnel[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('pipeline_stage')
    .eq('user_id', user.id);

  const stageCounts: Record<PipelineStage, number> = {
    'Lead': 0,
    'New Opportunity': 0,
    'Active Opportunity': 0,
    'Under Contract': 0,
    'Closed': 0,
  };

  (contacts || []).forEach((contact: any) => {
    const stage = contact.pipeline_stage as PipelineStage;
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  const total = Object.values(stageCounts).reduce((sum, count) => sum + count, 0);
  const stages: PipelineStage[] = ['Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed'];

  const funnel: ConversionFunnel[] = stages.map((stage, index) => {
    const count = stageCounts[stage];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    const dropOffFromPrevious = index > 0
      ? stageCounts[stages[index - 1]] - count
      : undefined;

    return { stage, count, percentage, dropOffFromPrevious };
  });

  return funnel;
}

export async function getLeadSourceDistribution(): Promise<LeadSourceData[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('lead_source')
    .eq('user_id', user.id)
    .not('lead_source', 'is', null);

  const sourceCounts: Record<string, number> = {};

  (contacts || []).forEach((contact: any) => {
    const source = contact.lead_source || 'Unknown';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function createSalesConversation(
  conversationType: SalesConversationType,
  conversationDate: string,
  amount: number | null,
  contactId: string | null,
  notes: string | null = null
): Promise<SalesConversation> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await (supabase as any)
    .from('sales_conversations')
    .insert({
      user_id: user.id,
      contact_id: contactId,
      conversation_type: conversationType,
      amount,
      conversation_date: conversationDate,
      notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as SalesConversation;
}

export async function getSalesConversationsByType(
  conversationType: SalesConversationType,
  limit: number = 50
): Promise<SalesConversation[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('sales_conversations')
    .select('*')
    .eq('user_id', user.id)
    .eq('conversation_type', conversationType)
    .order('conversation_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []) as SalesConversation[];
}

export async function deleteSalesConversation(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('sales_conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}
