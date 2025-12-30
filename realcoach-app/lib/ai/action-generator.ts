import OpenAI from 'openai';
import type { PipelineStage, MotivationLevel, Timeframe } from '@/lib/database.types';

/**
 * Next Action Generator
 *
 * Generates context-aware next action recommendations based on
 * pipeline stage, conversation content, and behavioral signals.
 */

export interface NextAction {
  actionType: 'Call' | 'Text' | 'Email' | 'Meeting' | 'Send Listing' | 'Follow-up';
  urgency: number; // 1-10
  script: string;
  rationale: string;
  behavioralContext: {
    factor: string;
    explanation: string;
  };
  estimatedTimeframe: string;
}

/**
 * Generate next action recommendation
 */
export async function generateNextAction(
  conversation: string,
  context: {
    currentStage: PipelineStage;
    motivation: MotivationLevel | null;
    timeframe: Timeframe | null;
    daysSinceContact: number;
    propertyPreferences?: any;
  },
  openai: OpenAI
): Promise<NextAction> {
  try {
    const prompt = buildActionPrompt(conversation, context);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert real estate coach recommending next actions for agents.

Action Types:
- Call: For urgent matters, relationship building, complex discussions
- Text: Quick updates, reminders, low urgency check-ins
- Email: Formal communications, detailed information, documents
- Meeting: Property showings, strategy discussions, important updates
- Send Listing: When new properties match client criteria
- Follow-up: General check-ins when no specific action needed

Urgency Scale (1-10):
10: Critical - 7-day rule violation, immediate attention required
9: Urgent - Time-sensitive opportunity or issue
7-8: High - Important but not emergency
5-6: Medium - Routine priority actions
3-4: Low - Can wait a day or two
1-2: Minimal - Nice to have when time permits

Generate actionable, specific recommendations with scripts the agent can use.

Return ONLY valid JSON.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return normalizeNextAction(parsed);
  } catch (error) {
    console.error('Action generation error:', error);
    return getDefaultNextAction(context);
  }
}

/**
 * Build action generation prompt
 */
function buildActionPrompt(
  conversation: string,
  context: {
    currentStage: PipelineStage;
    motivation: MotivationLevel | null;
    timeframe: Timeframe | null;
    daysSinceContact: number;
    propertyPreferences?: any;
  }
): string {
  const contextInfo = `
Current Context:
- Pipeline Stage: ${context.currentStage}
- Motivation Level: ${context.motivation || 'Not set'}
- Timeframe: ${context.timeframe || 'Not set'}
- Days Since Contact: ${context.daysSinceContact}
- Property Preferences: ${context.propertyPreferences ? JSON.stringify(context.propertyPreferences) : 'None'}

Recent Conversation:
"${conversation}"
`;

  return `${contextInfo}

Recommend the best next action and return JSON with this structure:
{
  "actionType": "Call|Text|Email|Meeting|Send Listing|Follow-up",
  "urgency": 1-10,
  "script": "Specific script the agent should use",
  "rationale": "Why this action matters now",
  "behavioralContext": {
    "factor": "Primary behavioral factor driving this action",
    "explanation": "Detailed explanation"
  },
  "estimatedTimeframe": "When this should be completed (e.g., 'Today', 'This week', 'Within 48 hours')"
}`;
}

/**
 * Normalize next action result
 */
function normalizeNextAction(raw: any): NextAction {
  return {
    actionType: normalizeActionType(raw.actionType),
    urgency: clamp(raw.urgency || 5, 1, 10),
    script: raw.script || 'Follow up with client to discuss their real estate needs.',
    rationale: raw.rationale || 'Maintain engagement with client.',
    behavioralContext: {
      factor: raw.behavioralContext?.factor || 'General engagement',
      explanation: raw.behavioralContext?.explanation || 'Regular communication important for relationship building.'
    },
    estimatedTimeframe: raw.estimatedTimeframe || 'This week'
  };
}

/**
 * Normalize action type
 */
function normalizeActionType(type: string): NextAction['actionType'] {
  const validTypes: NextAction['actionType'][] = [
    'Call',
    'Text',
    'Email',
    'Meeting',
    'Send Listing',
    'Follow-up'
  ];

  const normalized = type?.toLowerCase();
  for (const validType of validTypes) {
    if (normalized?.includes(validType.toLowerCase())) {
      return validType;
    }
  }

  return 'Call'; // Default
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get default next action when AI fails
 */
function getDefaultNextAction(context: {
  currentStage: PipelineStage;
  motivation: MotivationLevel | null;
  timeframe: Timeframe | null;
  daysSinceContact: number;
}): NextAction {
  const { currentStage, daysSinceContact } = context;

  // Rule-based fallback
  if (currentStage === 'Active Opportunity' && daysSinceContact >= 7) {
    return {
      actionType: 'Call',
      urgency: 10,
      script: `Hi [Name], I want to ensure I'm providing the best service. With the market changing weekly, should I send you fresh listings or schedule another showing tour?`,
      rationale: 'CRITICAL: 7-day rule violation - immediate re-engagement required',
      behavioralContext: {
        factor: '7-Day Rule Violation',
        explanation: `${daysSinceContact} days without contact in Active Opportunity stage. Active opportunities at risk of going cold without weekly contact.`
      },
      estimatedTimeframe: 'Today'
    };
  }

  if (currentStage === 'Lead' && !context.motivation) {
    return {
      actionType: 'Call',
      urgency: 7,
      script: 'Hi [Name], I wanted to follow up and learn more about your real estate goals. What\'s motivating your move, and what\'s your ideal timeline?',
      rationale: 'Qualification needed: Determine motivation level and timeframe',
      behavioralContext: {
        factor: 'Lead Qualification',
        explanation: 'Need to establish motivation and timeframe to advance lead to opportunity stage.'
      },
      estimatedTimeframe: 'This week'
    };
  }

  if (currentStage === 'New Opportunity' && context.timeframe === 'Immediate') {
    return {
      actionType: 'Call',
      urgency: 8,
      script: 'Hi [Name], given your immediate timeline, let\'s schedule showings for the top properties that match your criteria. When are you available this week?',
      rationale: 'Urgent timeline requires accelerated showing schedule',
      behavioralContext: {
        factor: 'Immediate Timeframe',
        explanation: 'Client needs immediate action - should prioritize property showings and offer preparation.'
      },
      estimatedTimeframe: 'Within 48 hours'
    };
  }

  return {
    actionType: 'Text',
    urgency: 5,
    script: 'Hi [Name], just checking in. Any updates on your real estate search?',
    rationale: 'Routine check-in to maintain engagement',
    behavioralContext: {
      factor: 'General Engagement',
      explanation: 'Regular communication important for relationship building and staying top of mind.'
    },
    estimatedTimeframe: 'This week'
  };
}

/**
 * Get stage-specific default action
 */
export function getStageDefaultAction(stage: PipelineStage): NextAction['actionType'] {
  const defaults: Record<PipelineStage, NextAction['actionType']> = {
    'Lead': 'Call',
    'New Opportunity': 'Call',
    'Active Opportunity': 'Call',
    'Under Contract': 'Text',
    'Closed': 'Email'
  };

  return defaults[stage] || 'Call';
}

/**
 * Calculate urgency based on multiple factors
 */
export function calculateActionUrgency(factors: {
  daysSinceContact: number;
  sevenDayRuleViolation: boolean;
  timeframe: Timeframe | null;
  motivation: MotivationLevel | null;
  stage: PipelineStage;
}): number {
  let urgency = 5; // Base urgency

  // 7-day rule violation
  if (factors.sevenDayRuleViolation) {
    urgency += 5;
  }

  // Days since contact
  if (factors.daysSinceContact >= 7) {
    urgency += 3;
  } else if (factors.daysSinceContact >= 3) {
    urgency += 1;
  }

  // Timeframe urgency
  if (factors.timeframe === 'Immediate') {
    urgency += 2;
  }

  // High motivation
  if (factors.motivation === 'High') {
    urgency += 1;
  }

  // Active Opportunity gets higher base urgency
  if (factors.stage === 'Active Opportunity') {
    urgency += 1;
  }

  // Closed deals get lower urgency
  if (factors.stage === 'Closed') {
    urgency -= 3;
  }

  return clamp(urgency, 1, 10);
}
