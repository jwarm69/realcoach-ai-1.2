import { createClient } from '@/lib/supabase/server';
import type { PipelineStage, LeadSource } from '@/lib/database.types';

// ===========================================
// Analytics Types
// ===========================================

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
export type TrendPeriod = 'day' | 'week' | 'month';

export interface PipelineVelocityMetrics {
  stage: PipelineStage;
  averageDays: number;
  contactCount: number;
  benchmarkDays: number;
  variance: number;
}

export interface StageConversion {
  fromStage: PipelineStage;
  toStage: PipelineStage;
  conversions: number;
  rate: number;
  avgTimeToConvert: number;
}

export interface ActivityTrendData {
  date: string;
  contacts: number;
  conversations: number;
  stageChanges: number;
  newLeads: number;
}

export interface SourcePerformance {
  source: LeadSource | string;
  totalContacts: number;
  activeContacts: number;
  closedDeals: number;
  conversionRate: number;
  avgDaysToClose: number;
  totalGCI?: number;
}

export interface MotivationDistribution {
  level: 'High' | 'Medium' | 'Low';
  count: number;
  percentage: number;
  avgPriorityScore: number;
}

export interface TimeframeDistribution {
  timeframe: string;
  count: number;
  percentage: number;
  closedDeals: number;
}

export interface AnalyticsOverview {
  pipelineVelocity: PipelineVelocityMetrics[];
  stageConversions: StageConversion[];
  activityTrends: ActivityTrendData[];
  sourcePerformance: SourcePerformance[];
  motivationDistribution: MotivationDistribution[];
  timeframeDistribution: TimeframeDistribution[];
  summary: {
    totalContacts: number;
    activeOpportunities: number;
    closedDeals: number;
    overallConversionRate: number;
    avgPipelineVelocity: number;
  };
}

// ===========================================
// Helper Functions
// ===========================================

function getDateRange(period: TimePeriod): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString();
  let startDate = endDate;

  switch (period) {
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString();
      break;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString();
      break;
    case 'quarter':
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(now.getMonth() - 3);
      startDate = quarterAgo.toISOString();
      break;
    case 'year':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      startDate = yearAgo.toISOString();
      break;
    case 'all':
      startDate = '2020-01-01T00:00:00.000Z';
      break;
  }

  return { startDate, endDate };
}

function getTrendDates(period: TrendPeriod, points: number = 12): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString();
  let startDate = endDate;

  switch (period) {
    case 'day':
      const daysAgo = new Date(now);
      daysAgo.setDate(now.getDate() - points);
      startDate = daysAgo.toISOString();
      break;
    case 'week':
      const weeksAgo = new Date(now);
      weeksAgo.setDate(now.getDate() - (points * 7));
      startDate = weeksAgo.toISOString();
      break;
    case 'month':
      const monthsAgo = new Date(now);
      monthsAgo.setMonth(now.getMonth() - points);
      startDate = monthsAgo.toISOString();
      break;
  }

  return { startDate, endDate };
}

function getBenchmarkDays(stage: PipelineStage): number {
  const benchmarks: Record<PipelineStage, number> = {
    'Lead': 7,
    'New Opportunity': 14,
    'Active Opportunity': 30,
    'Under Contract': 45,
    'Closed': 60,
  };
  return benchmarks[stage] || 30;
}

function groupByDate<T extends { created_at: string }>(
  items: T[],
  period: TrendPeriod
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  for (const item of items) {
    const date = new Date(item.created_at);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    grouped[key] = grouped[key] || [];
    grouped[key].push(item);
  }

  return grouped;
}

// ===========================================
// Pipeline Velocity
// ===========================================

export async function getPipelineVelocity(
  period: TimePeriod = 'all'
): Promise<PipelineVelocityMetrics[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getDateRange(period);

  // Get contacts created in the period
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, pipeline_stage, created_at')
    .eq('user_id', user.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const typedContacts = contacts as Array<{ id: string; pipeline_stage: string; created_at: string }> | null;

  if (!typedContacts || typedContacts.length === 0) {
    return [];
  }

  const contactIds = typedContacts.map((c) => c.id);

  // Get stage history for these contacts
  const { data: stageHistory } = await supabase
    .from('pipeline_stage_history')
    .select('contact_id, previous_stage, new_stage, created_at')
    .in('contact_id', contactIds)
    .order('created_at', { ascending: true });

  const typedStageHistory = stageHistory as Array<{ contact_id: string; previous_stage: string; new_stage: string; created_at: string }> | null;

  // Calculate time in each stage for each contact
  const stageTimes: Record<PipelineStage, number[]> = {
    'Lead': [],
    'New Opportunity': [],
    'Active Opportunity': [],
    'Under Contract': [],
    'Closed': [],
  };

  for (const contact of typedContacts) {
    const contactHistory = typedStageHistory?.filter(
      (h) => h.contact_id === contact.id
    ) || [];

    let currentDate = new Date(contact.created_at);
    const stages: PipelineStage[] = [contact.pipeline_stage as PipelineStage];

    // Build stage timeline
    for (const history of contactHistory) {
      stages.push(history.new_stage as PipelineStage);
    }

    // Calculate time in each stage
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const nextChange = contactHistory[i];

      if (nextChange) {
        const daysInStage = Math.floor(
          (new Date(nextChange.created_at).getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysInStage >= 0) {
          stageTimes[stage].push(daysInStage);
        }
        currentDate = new Date(nextChange.created_at);
      } else if (i === stages.length - 1) {
        // Still in this stage - use created_at to now
        const daysInStage = Math.floor(
          (new Date().getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysInStage >= 0) {
          stageTimes[stage].push(daysInStage);
        }
      }
    }
  }

  // Calculate metrics for each stage
  const stages: PipelineStage[] = ['Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed'];
  const metrics: PipelineVelocityMetrics[] = [];

  for (const stage of stages) {
    const times = stageTimes[stage];
    const averageDays = times.length > 0
      ? Math.round(times.reduce((sum, t) => sum + t, 0) / times.length)
      : 0;
    const benchmarkDays = getBenchmarkDays(stage);
    const variance = benchmarkDays > 0 ? Math.round(((averageDays - benchmarkDays) / benchmarkDays) * 100) : 0;

    // Count contacts currently in or have passed through this stage
    const contactCount = typedContacts.filter((c) => {
      const contactHistory = typedStageHistory?.filter((h) => h.contact_id === c.id) || [];
      const allStages = [c.pipeline_stage as PipelineStage, ...contactHistory.map((h) => h.new_stage as PipelineStage)];
      return allStages.includes(stage);
    }).length;

    metrics.push({
      stage,
      averageDays,
      contactCount,
      benchmarkDays,
      variance,
    });
  }

  return metrics;
}

// ===========================================
// Stage Conversions
// ===========================================

export async function getStageConversions(
  period: TimePeriod = 'all'
): Promise<StageConversion[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getDateRange(period);

  // Get all stage changes in the period
  const { data: stageHistory } = await supabase
    .from('pipeline_stage_history')
    .select('contact_id, previous_stage, new_stage, created_at, contacts!inner(user_id)')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const typedStageHistory = stageHistory as Array<{ contact_id: string; previous_stage: string; new_stage: string; created_at: string }> | null;

  if (!typedStageHistory || typedStageHistory.length === 0) {
    return [];
  }

  const conversions: StageConversion[] = [];
  const stages: PipelineStage[] = ['Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed'];

  // Calculate conversions between adjacent stages
  for (let i = 0; i < stages.length - 1; i++) {
    const fromStage = stages[i];
    const toStage = stages[i + 1];

    const transitions = typedStageHistory.filter(
      (h) => h.previous_stage === fromStage && h.new_stage === toStage
    );

    // Count how many contacts were in the from_stage at the start of period
    const { data: fromStageContacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .eq('pipeline_stage', fromStage)
      .lte('created_at', startDate);

    const totalInFromStage = fromStageContacts?.length || 0;
    const conversionCount = transitions.length;
    const rate = totalInFromStage > 0 ? Math.round((conversionCount / totalInFromStage) * 100) : 0;

    // Calculate average time to convert
    const timesToConvert: number[] = [];
    for (const transition of transitions) {
      // Find when this contact entered the from_stage
      const { data: earlierHistory } = await supabase
        .from('pipeline_stage_history')
        .select('created_at')
        .eq('contact_id', transition.contact_id)
        .eq('new_stage', fromStage)
        .lt('created_at', transition.created_at)
        .order('created_at', { ascending: false })
        .limit(1);

      const typedEarlierHistory = earlierHistory as Array<{ created_at: string }> | null;

      if (typedEarlierHistory && typedEarlierHistory.length > 0) {
        const days = Math.floor(
          (new Date(transition.created_at).getTime() - new Date(typedEarlierHistory[0].created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        timesToConvert.push(days);
      }
    }

    const avgTimeToConvert = timesToConvert.length > 0
      ? Math.round(timesToConvert.reduce((sum, t) => sum + t, 0) / timesToConvert.length)
      : 0;

    conversions.push({
      fromStage,
      toStage,
      conversions: conversionCount,
      rate,
      avgTimeToConvert,
    });
  }

  return conversions;
}

// ===========================================
// Activity Trends
// ===========================================

export async function getActivityTrends(
  period: TrendPeriod = 'week',
  points: number = 12
): Promise<ActivityTrendData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getTrendDates(period, points);

  // Get all activity data in parallel
  const [contactsData, conversationsData, stageHistoryData] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, created_at, pipeline_stage')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate),

    supabase
      .from('conversations')
      .select('created_at, contacts!inner(user_id)')
      .eq('contacts.user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate),

    supabase
      .from('pipeline_stage_history')
      .select('created_at, contacts!inner(user_id)')
      .eq('contacts.user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
  ]);

  const contacts = (contactsData?.data || []) as Array<{ id: string; created_at: string; pipeline_stage: string }>;
  const conversations = (conversationsData?.data || []) as Array<{ created_at: string }>;
  const stageHistory = (stageHistoryData?.data || []) as Array<{ created_at: string }>;

  // Group by date period
  const contactsByDate = groupByDate(contacts, period);
  const conversationsByDate = groupByDate(conversations, period);
  const stageChangesByDate = groupByDate(stageHistory, period);

  // Get all unique dates
  const allDates = new Set([
    ...Object.keys(contactsByDate),
    ...Object.keys(conversationsByDate),
    ...Object.keys(stageChangesByDate),
  ]);

  // Generate trend data
  const trends: ActivityTrendData[] = Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      contacts: contactsByDate[date]?.filter((c) => c.pipeline_stage === 'Lead').length || 0,
      conversations: conversationsByDate[date]?.length || 0,
      stageChanges: stageChangesByDate[date]?.length || 0,
      newLeads: contactsByDate[date]?.filter((c) => c.pipeline_stage === 'Lead').length || 0,
    }));

  return trends;
}

// ===========================================
// Source Performance
// ===========================================

export async function getSourcePerformance(
  period: TimePeriod = 'all'
): Promise<SourcePerformance[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { startDate, endDate } = getDateRange(period);

  // Get all contacts in period
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, lead_source, pipeline_stage, created_at')
    .eq('user_id', user.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const typedContacts = contacts as Array<{ id: string; lead_source: string | null; pipeline_stage: string; created_at: string }> | null;

  if (!typedContacts || typedContacts.length === 0) {
    return [];
  }

  // Get closed deals with dates (from stage history)
  const contactIds = typedContacts.map((c) => c.id);
  const { data: stageHistory } = await supabase
    .from('pipeline_stage_history')
    .select('contact_id, new_stage, created_at')
    .in('contact_id', contactIds)
    .eq('new_stage', 'Closed');

  const typedStageHistory = stageHistory as Array<{ contact_id: string; created_at: string }> | null;

  // Group by source
  const sourceMap: Record<string, {
    total: number;
    active: number;
    closed: number;
    daysToClose: number[];
  }> = {};

  for (const contact of typedContacts) {
    const source = contact.lead_source || 'Unknown';
    if (!sourceMap[source]) {
      sourceMap[source] = { total: 0, active: 0, closed: 0, daysToClose: [] };
    }

    sourceMap[source].total++;

    if (contact.pipeline_stage === 'Closed') {
      sourceMap[source].closed++;
    } else if (
      contact.pipeline_stage === 'New Opportunity' ||
      contact.pipeline_stage === 'Active Opportunity' ||
      contact.pipeline_stage === 'Under Contract'
    ) {
      sourceMap[source].active++;
    }

    // Check if this contact closed and calculate days to close
    const closeEvent = typedStageHistory?.find((h) => h.contact_id === contact.id);
    if (closeEvent) {
      const days = Math.floor(
        (new Date(closeEvent.created_at).getTime() - new Date(contact.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      sourceMap[source].daysToClose.push(days);
    }
  }

  // Convert to performance metrics
  const performance: SourcePerformance[] = Object.entries(sourceMap).map(([source, data]) => {
    const avgDaysToClose = data.daysToClose.length > 0
      ? Math.round(data.daysToClose.reduce((sum, d) => sum + d, 0) / data.daysToClose.length)
      : 0;

    return {
      source,
      totalContacts: data.total,
      activeContacts: data.active,
      closedDeals: data.closed,
      conversionRate: data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0,
      avgDaysToClose,
    };
  });

  // Sort by total contacts descending
  return performance.sort((a, b) => b.totalContacts - a.totalContacts);
}

// ===========================================
// Motivation Distribution
// ===========================================

export async function getMotivationDistribution(): Promise<MotivationDistribution[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('motivation_level, priority_score')
    .eq('user_id', user.id)
    .not('motivation_level', 'is', null);

  const typedContacts = contacts as Array<{ motivation_level: string; priority_score: number | null }> | null;

  if (!typedContacts || typedContacts.length === 0) {
    return [];
  }

  const levels: MotivationDistribution[] = [];
  const motivationLevels: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

  for (const level of motivationLevels) {
    const levelContacts = typedContacts.filter((c) => c.motivation_level === level);
    const avgScore = levelContacts.length > 0
      ? Math.round(levelContacts.reduce((sum, c) => sum + (c.priority_score || 0), 0) / levelContacts.length)
      : 0;

    levels.push({
      level,
      count: levelContacts.length,
      percentage: typedContacts.length > 0 ? Math.round((levelContacts.length / typedContacts.length) * 100) : 0,
      avgPriorityScore: avgScore,
    });
  }

  return levels;
}

// ===========================================
// Timeframe Distribution
// ===========================================

export async function getTimeframeDistribution(): Promise<TimeframeDistribution[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('timeframe, pipeline_stage')
    .eq('user_id', user.id)
    .not('timeframe', 'is', null);

  const typedContacts = contacts as Array<{ timeframe: string | null; pipeline_stage: string }> | null;

  if (!typedContacts || typedContacts.length === 0) {
    return [];
  }

  const timeframeMap: Record<string, { count: number; closed: number }> = {};

  for (const contact of typedContacts) {
    const timeframe = contact.timeframe || 'Unknown';
    if (!timeframeMap[timeframe]) {
      timeframeMap[timeframe] = { count: 0, closed: 0 };
    }

    timeframeMap[timeframe].count++;
    if (contact.pipeline_stage === 'Closed') {
      timeframeMap[timeframe].closed++;
    }
  }

  const total = typedContacts.length;
  const timeframeOrder = ['Immediate', '1-3 months', '3-6 months', '6+ months'];

  const distribution: TimeframeDistribution[] = timeframeOrder
    .filter((tf) => timeframeMap[tf])
    .map((timeframe) => {
      const data = timeframeMap[timeframe];
      return {
        timeframe,
        count: data.count,
        percentage: Math.round((data.count / total) * 100),
        closedDeals: data.closed,
      };
    });

  return distribution;
}

// ===========================================
// Analytics Overview
// ===========================================

export async function getAnalyticsOverview(
  period: TimePeriod = 'all'
): Promise<AnalyticsOverview> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get summary stats
  const { data: contacts } = await supabase
    .from('contacts')
    .select('pipeline_stage')
    .eq('user_id', user.id);

  const typedContacts = contacts as Array<{ pipeline_stage: string }> | null;

  const totalContacts = typedContacts?.length || 0;
  const activeOpportunities = typedContacts?.filter((c) => c.pipeline_stage === 'Active Opportunity').length || 0;
  const closedDeals = typedContacts?.filter((c) => c.pipeline_stage === 'Closed').length || 0;
  const overallConversionRate = totalContacts > 0 ? Math.round((closedDeals / totalContacts) * 100) : 0;

  // Get pipeline velocity for average calculation
  const pipelineVelocity = await getPipelineVelocity(period);
  const avgPipelineVelocity = pipelineVelocity.length > 0
    ? Math.round(pipelineVelocity.reduce((sum, m) => sum + m.averageDays, 0) / pipelineVelocity.length)
    : 0;

  // Get all analytics data in parallel
  const [
    stageConversions,
    activityTrends,
    sourcePerformance,
    motivationDistribution,
    timeframeDistribution,
  ] = await Promise.all([
    getStageConversions(period),
    getActivityTrends('week', 12),
    getSourcePerformance(period),
    getMotivationDistribution(),
    getTimeframeDistribution(),
  ]);

  return {
    pipelineVelocity,
    stageConversions,
    activityTrends,
    sourcePerformance,
    motivationDistribution,
    timeframeDistribution,
    summary: {
      totalContacts,
      activeOpportunities,
      closedDeals,
      overallConversionRate,
      avgPipelineVelocity,
    },
  };
}
