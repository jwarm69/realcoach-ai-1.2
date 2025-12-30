import type { Contact, MotivationLevel, PipelineStage, Timeframe } from '@/lib/database.types';

/**
 * Priority Score Calculator
 * 
 * Calculates a 0-100 priority score based on behavioral factors
 * 
 * Algorithm:
 * - Motivation Level (30 pts): High=30, Medium=20, Low=10
 * - Days Since Contact (25 pts): 0-1=25, 2-3=20, 4-7=15, 8-14=10, 15+=5
 * - Pipeline Stage (20 pts): Active=20, New=15, Under Contract=10, Lead=5
 * - New Lead Bonus (15 pts): If Lead + ≤2 days old + High motivation
 * - Timeframe Urgency (10 pts): Immediate=10, 1-3mo=7, 3-6mo=5
 * - 7-Day Rule Bonus (+10): If seven_day_rule_flag is true
 */

interface PriorityFactors {
  motivationLevel: MotivationLevel | null;
  daysSinceContact: number;
  pipelineStage: PipelineStage;
  timeframe: Timeframe | null;
  sevenDayRuleFlag: boolean;
  createdAt: string; // For new lead detection
}

export function calculatePriorityScore(contact: Contact): number {
  const factors: PriorityFactors = {
    motivationLevel: contact.motivation_level,
    daysSinceContact: contact.days_since_contact,
    pipelineStage: contact.pipeline_stage,
    timeframe: contact.timeframe,
    sevenDayRuleFlag: contact.seven_day_rule_flag,
    createdAt: contact.created_at,
  };

  return calculateScore(factors);
}

export function calculateScore(factors: PriorityFactors): number {
  let score = 0;

  // 1. Motivation Level (0-30 points)
  score += calculateMotivationScore(factors.motivationLevel);

  // 2. Days Since Contact (0-25 points)
  score += calculateDaysSinceContactScore(factors.daysSinceContact);

  // 3. Pipeline Stage (0-20 points)
  score += calculatePipelineStageScore(factors.pipelineStage);

  // 4. New Lead Bonus (0-15 points)
  score += calculateNewLeadBonus(
    factors.pipelineStage,
    factors.motivationLevel,
    factors.createdAt
  );

  // 5. Timeframe Urgency (0-10 points)
  score += calculateTimeframeScore(factors.timeframe);

  // 6. Seven-Day Rule Bonus (+10 points)
  if (factors.sevenDayRuleFlag) {
    score += 10;
  }

  // Cap at 100
  return Math.min(Math.round(score), 100);
}

// Motivation Level scoring
function calculateMotivationScore(level: MotivationLevel | null): number {
  const scores: Record<MotivationLevel, number> = {
    'High': 30,
    'Medium': 20,
    'Low': 10,
  };

  return level ? scores[level] : 5; // Default 5 if not set
}

// Days Since Contact scoring
function calculateDaysSinceContactScore(days: number): number {
  if (days <= 1) return 25;
  if (days <= 3) return 20;
  if (days <= 7) return 15;
  if (days <= 14) return 10;
  return 5;
}

// Pipeline Stage scoring
function calculatePipelineStageScore(stage: PipelineStage): number {
  const scores: Record<PipelineStage, number> = {
    'Lead': 5,
    'New Opportunity': 15,
    'Active Opportunity': 20,
    'Under Contract': 10,
    'Closed': 0, // Closed deals don't need priority
  };

  return scores[stage];
}

// New Lead Bonus (high-value new leads get priority)
function calculateNewLeadBonus(
  stage: PipelineStage,
  motivation: MotivationLevel | null,
  createdAt: string
): number {
  // Only applies to Leads
  if (stage !== 'Lead') return 0;

  // Check if created within last 2 days
  const created = new Date(createdAt);
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Must be ≤2 days old AND high motivation
  if (daysSinceCreation <= 2 && motivation === 'High') {
    return 15;
  }

  return 0;
}

// Timeframe Urgency scoring
function calculateTimeframeScore(timeframe: Timeframe | null): number {
  const scores: Record<Timeframe, number> = {
    'Immediate': 10,
    '1-3 months': 7,
    '3-6 months': 5,
    '6+ months': 2,
  };

  return timeframe ? scores[timeframe] : 0;
}

// Batch calculate scores for multiple contacts
export function calculateBatchPriorityScores(contacts: Contact[]): Map<string, number> {
  const scores = new Map<string, number>();

  for (const contact of contacts) {
    scores.set(contact.id, calculatePriorityScore(contact));
  }

  return scores;
}

// Get priority level category
export function getPriorityLevel(score: number): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// Get priority color for UI
export function getPriorityColor(score: number): string {
  if (score >= 80) return 'text-red-600 bg-red-50';
  if (score >= 60) return 'text-orange-600 bg-orange-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-slate-600 bg-slate-50';
}
